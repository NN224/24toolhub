const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require('cors');
const dns = require('dns').promises;
const ping = require('ping');
const path = require('path');
const fs = require('fs');
const { getModelForEndpoint } = require('./ai-config');

const app = express();
const port = process.env.PORT || 5000;

// ✅ Safely load tools database
let toolsData = { tools: [] };
try {
  const dbPath = path.join(process.cwd(), 'tools-database.json');
  const raw = fs.readFileSync(dbPath, 'utf8');
  toolsData = JSON.parse(raw);
  console.log('✅ Loaded tools-database.json successfully');
} catch (err) {
  console.error('⚠️ Could not load tools-database.json:', err.message);
  toolsData = { tools: [] };
}

// ✅ Serve static folders (important for CSS, JS, images)
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/blog', express.static(path.join(__dirname, 'blog')));
app.use('/tools', express.static(path.join(__dirname, 'tools')));

// Allow CORS and JSON
app.use(cors());
app.use(express.json());

// Disable caching for HTML
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// ✅ Serve static HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:page', (req, res, next) => {
  const pageFile = path.join(__dirname, `${req.params.page}.html`);
  if (fs.existsSync(pageFile)) {
    res.sendFile(pageFile);
  } else {
    next();
  }
});

// ===================================================
// 🔍 SEO Analyzer API
// ===================================================
app.get('/analyze-seo', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'URL parameter is required' });

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const analysis = {
      title: { text: $('title').text(), length: $('title').text().length },
      description: {
        text: $('meta[name="description"]').attr('content') || '',
        length: ($('meta[name="description"]').attr('content') || '').length
      },
      headings: { h1: $('h1').length, h2: $('h2').length, h3: $('h3').length },
      images: {
        total: $('img').length,
        missingAlt: $('img:not([alt]), img[alt=""]').length
      },
      ogTags: {
        title: $('meta[property="og:title"]').attr('content') || '',
        description: $('meta[property="og:description"]').attr('content') || '',
        image: $('meta[property="og:image"]').attr('content') || ''
      }
    };

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch or analyze URL: ${error.message}` });
  }
});

// ===================================================
// 🌐 DNS Lookup API
// ===================================================
app.get('/dns-lookup', async (req, res) => {
  const { domain, recordTypes } = req.query;
  if (!domain || !recordTypes)
    return res.status(400).json({ error: 'Domain and recordTypes parameters are required' });

  const types = Array.isArray(recordTypes) ? recordTypes : [recordTypes];
  const results = {};

  const lookupPromises = types.map(async (type) => {
    try {
      let records;
      switch (type) {
        case 'A': records = await dns.resolve4(domain, { ttl: true }); break;
        case 'AAAA': records = await dns.resolve6(domain, { ttl: true }); break;
        case 'MX': records = await dns.resolveMx(domain); break;
        case 'TXT':
          records = (await dns.resolveTxt(domain)).map(r => ({ value: r.join(' '), ttl: 300 }));
          break;
        case 'NS':
          records = (await dns.resolveNs(domain)).map(r => ({ value: r, ttl: 300 }));
          break;
        case 'CNAME':
          records = (await dns.resolveCname(domain)).map(r => ({ value: r, ttl: 300 }));
          break;
        case 'SOA':
          const soa = await dns.resolveSoa(domain);
          records = [{ value: `${soa.nsname} ${soa.hostmaster} ${soa.serial}`, ttl: soa.minttl }];
          break;
      }
      results[type] = records.map(r => (typeof r === 'string' ? { value: r, ttl: 300 } : r));
    } catch (error) {
      console.warn(`DNS lookup for ${type} on ${domain} failed:`, error.code);
    }
  });

  await Promise.all(lookupPromises);
  res.json(results);
});

// ===================================================
// ⚡ PageSpeed API
// ===================================================
app.get('/pagespeed', async (req, res) => {
  const { url, strategy } = req.query;
  if (!url) return res.status(400).json({ error: 'URL parameter is required' });
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'PageSpeed API key is not configured. Please add PAGESPEED_API_KEY to environment variables.'
    });
  }

  const apiStrategy = strategy || 'desktop';
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${apiStrategy}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: `PageSpeed API failed: ${error.message}` });
  }
});

// ===================================================
// 💬 Chatbot API
// ===================================================
app.post('/chat', async (req, res) => {
  const { message, conversationHistory } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const { callAIWithFallback } = require('./ai-service');
    const modelConfig = getModelForEndpoint('/chat', process.env);

    const systemInstruction = `You are a helpful assistant for 24ToolHub, a website with 70+ free online tools.

Your role:
- Help users find tools and explain them
- Support Arabic and English
- Suggest workflows for complex tasks
Available tools:
${JSON.stringify(toolsData.tools, null, 2)}`;

    const messages = [];
    if (Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));
    }
    messages.push({ role: 'user', content: message });

    const result = await callAIWithFallback(modelConfig, { messages, systemInstruction }, process.env);
    res.json({
      response: result.response,
      modelUsed: result.modelUsed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal error', details: error.message });
  }
});

// ===================================================
// 🚀 Server startup
// ===================================================
// Only start server if not being required for testing
if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ 24ToolHub server running on port ${port}`);
  });
}

module.exports = app;
