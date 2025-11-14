const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require('cors');
const dns = require('dns').promises;
const ping = require('ping');
const path = require('path');
const fs = require('fs');
const { getModelForEndpoint } = require('../ai-config');

const app = express();
const port = process.env.PORT || 5000;

// Load tools database
let toolsData = { tools: [] };
try {
  const dbPath = path.join(process.cwd(), 'tools-database.json');
  const raw = fs.readFileSync(dbPath, 'utf8');
  toolsData = JSON.parse(raw);
  console.log('Loaded tools-database.json successfully');
} catch (err) {
  console.error('Could not load tools-database.json:', err.message);
  toolsData = { tools: [] };
}

// Static folders
app.use('/css', express.static(path.join(process.cwd(), 'css')));
app.use('/js', express.static(path.join(process.cwd(), 'js')));
app.use('/images', express.static(path.join(process.cwd(), 'images')));
app.use('/blog', express.static(path.join(process.cwd(), 'blog')));
app.use('/tools', express.static(path.join(process.cwd(), 'tools')));

// Serve static files from root (robots.txt, sitemap.xml, favicons, etc.)
app.use(express.static(process.cwd(), {
  index: false,
  dotfiles: 'ignore',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.set('Cache-Control', 'no-store');
    }
  }
}));

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    res.set('Cache-Control', 'no-store');
  }
  next();
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.get('/:page', (req, res, next) => {
  const pageFile = path.join(process.cwd(), `${req.params.page}.html`);
  if (fs.existsSync(pageFile)) {
    res.sendFile(pageFile);
  } else {
    next();
  }
});

// SEO Analyzer
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
      headings: {
        h1: $('h1').length,
        h2: $('h2').length,
        h3: $('h3').length
      },
      images: {
        total: $('img').length,
        missingAlt: $('img:not([alt]), img[alt=""]').length
      }
    };

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DNS Lookup
app.get('/dns-lookup', async (req, res) => {
  const { domain, recordTypes } = req.query;
  if (!domain || !recordTypes) return res.status(400).json({ error: 'Domain and recordTypes parameters are required' });

  const types = Array.isArray(recordTypes) ? recordTypes : [recordTypes];
  const results = {};

  await Promise.all(types.map(async type => {
    try {
      let records = await dns.resolve(domain, type);
      results[type] = records;
    } catch (_) {
      results[type] = [];
    }
  }));

  res.json(results);
});

// PageSpeed Insights
app.get('/pagespeed', async (req, res) => {
  const { url, strategy = 'mobile' } = req.query;
  if (!url) return res.status(400).json({ error: 'URL parameter is required' });

  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'PageSpeed API key is not configured' });

  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ping Test
app.get('/ping', async (req, res) => {
  const host = req.query.host;
  if (!host) return res.status(400).json({ error: 'Host parameter is required' });

  try {
    const result = await ping.promise.probe(host);
    res.json({
      host: result.host,
      alive: result.alive,
      time: result.time,
      numeric_host: result.numeric_host
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chatbot API
app.post('/chat', async (req, res) => {
  const { message, conversationHistory } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const { callAIWithFallback } = require('../ai-service');
    const modelConfig = getModelForEndpoint('/chat', process.env);

    const systemInstruction =
      `You are a helpful assistant for 24ToolHub.

Available tools:
${JSON.stringify(toolsData.tools, null, 2)}`;

    const messages = [];

    if (Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })));
    }

    messages.push({ role: 'user', content: message });

    const result = await callAIWithFallback(modelConfig, { messages, systemInstruction }, process.env);

    res.json({
      response: result.response,
      modelUsed: result.modelUsed,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
