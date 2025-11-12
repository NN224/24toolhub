const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require('cors');
const dns = require('dns').promises;
const ping = require('ping');
const path = require('path');
const fs = require('fs');
const { getModelForEndpoint } = require('./ai-config');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// ✅ Safely load tools database (Vercel-safe)
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

// Rate limiting (in-memory, simple)
const rateLimits = new Map();
const RATE_LIMIT = 5; // messages per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimits.entries()) {
    if (now > data.resetTime + RATE_WINDOW) {
      rateLimits.delete(ip);
    }
  }
}, RATE_WINDOW * 2);

app.use(cors());
app.use(express.json());

// Disable caching for HTML files
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));


// ==========================
// 🔍 SEO ANALYZER ENDPOINT
// ==========================
app.get('/analyze-seo', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'URL parameter is required' });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch URL with status: ${response.status}`);

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

    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch or analyze URL: ${error.message}` });
  }
});


// ==========================
// 🌐 DNS LOOKUP ENDPOINT
// ==========================
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
        case 'A':
          records = await dns.resolve4(domain, { ttl: true });
          break;
        case 'AAAA':
          records = await dns.resolve6(domain, { ttl: true });
          break;
        case 'MX':
          records = await dns.resolveMx(domain);
          break;
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
          records = [{ value: `${soa.nsname} ${soa.hostmaster} ${soa.serial} ${soa.refresh} ${soa.retry} ${soa.expire} ${soa.minttl}`, ttl: soa.minttl }];
          break;
        default:
          return;
      }
      results[type] = records.map(r => (typeof r === 'string' ? { value: r, ttl: 300 } : r));
    } catch (error) {
      console.warn(`DNS lookup for ${type} on ${domain} failed:`, error.code);
    }
  });

  await Promise.all(lookupPromises);
  res.status(200).json(results);
});


// ==========================
// ⚡ PAGE SPEED ENDPOINT
// ==========================
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
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: errorData.error?.message || 'Failed to fetch PageSpeed data'
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: `PageSpeed API failed: ${error.message}` });
  }
});


// ==========================
// 🛰️ PING ENDPOINT
// ==========================
app.get('/ping', async (req, res) => {
  const { host, timeout } = req.query;
  if (!host) return res.status(400).json({ error: 'Host parameter is required' });

  const timeoutMs = parseInt(timeout) || 2000;
  const startTime = Date.now();

  try {
    let testUrl = host;
    if (!host.startsWith('http://') && !host.startsWith('https://')) testUrl = 'https://' + host;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      await fetch(testUrl, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeoutId);
      const endTime = Date.now();
      res.status(200).json({ host, time: endTime - startTime, status: 'success' });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        res.status(200).json({ host, time: timeoutMs, status: 'timeout', error: 'Request timed out' });
      } else {
        const httpUrl = 'http://' + host.replace(/^https?:\/\//, '');
        try {
          const controller2 = new AbortController();
          const timeoutId2 = setTimeout(() => controller2.abort(), timeoutMs);
          await fetch(httpUrl, { method: 'HEAD', signal: controller2.signal });
          clearTimeout(timeoutId2);
          const endTime = Date.now();
          res.status(200).json({ host, time: endTime - startTime, status: 'success' });
        } catch (error2) {
          const endTime = Date.now();
          res.status(200).json({
            host,
            time: endTime - startTime,
            status: 'error',
            error: 'Host unreachable or does not respond to HTTP/HTTPS'
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ error: `Ping failed: ${error.message}` });
  }
});


// ==========================
// 💬 CHAT ENDPOINT (AI)
// ==========================
app.post('/chat', async (req, res) => {
  const { message, conversationHistory } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  const now = Date.now();
  const limitData = rateLimits.get(clientIp);
  if (limitData) {
    if (now < limitData.resetTime) {
      if (limitData.count >= RATE_LIMIT) {
        return res.status(429).json({
          error: 'Too many requests. Please wait a moment before sending another message.',
          errorAr: 'عدد كبير جداً من الرسائل. يرجى الانتظار قليلاً قبل إرسال رسالة أخرى.'
        });
      }
      limitData.count++;
    } else {
      limitData.count = 1;
      limitData.resetTime = now + RATE_WINDOW;
    }
  } else {
    rateLimits.set(clientIp, { count: 1, resetTime: now + RATE_WINDOW });
  }

  try {
    const { callAIWithFallback } = require('./ai-service');
    const modelConfig = getModelForEndpoint('/chat', process.env);
    if (!modelConfig) {
      return res.status(500).json({
        error: 'AI service not configured for this endpoint.',
        errorAr: 'خدمة الذكاء الاصطناعي غير مُكونة لهذه النقطة.'
      });
    }

    const systemInstruction = `You are a helpful assistant for 24ToolHub, a website with 70+ free online tools.
Your role:
- Help users find the right tool for their needs
- Explain how to use tools
- Answer questions in Arabic or English (match the user's language)
- Be friendly, concise, and helpful
- When suggesting tools, provide the tool name and a brief description
- You can suggest multiple tools if relevant
- For complex tasks, suggest a WORKFLOW (step-by-step tool recommendations)
Available tools database:
${JSON.stringify(toolsData.tools, null, 2)}`;

    const messages = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content }));
    }
    messages.push({ role: 'user', content: message });

    const result = await callAIWithFallback(modelConfig, { messages, systemInstruction }, process.env);

    res.json({
      response: result.response,
      timestamp: new Date().toISOString(),
      modelUsed: result.modelUsed
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Sorry, something went wrong. Please try again.',
      errorAr: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
      details: error.message
    });
  }
});


// ==========================
// 🚀 SERVER STARTUP
// ==========================
// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ 24ToolHub server running on port ${port}`);
});

module.exports = app;
