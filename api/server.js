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
  let pageName = req.params.page;
  // If the page already ends with .html, use it as is, otherwise append .html
  if (!pageName.endsWith('.html')) {
    pageName = `${pageName}.html`;
  }
  const pageFile = path.join(process.cwd(), pageName);
  if (fs.existsSync(pageFile)) {
    res.sendFile(pageFile);
  } else {
    next();
  }
});

// SEO Analyzer
app.get('/analyze-seo', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'URL required' });

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
  if (!domain || !recordTypes) return res.status(400).json({ error: 'Missing params' });

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

// Chatbot API
app.post('/chat', async (req, res) => {
  const { message, conversationHistory } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

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
