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

// Canonicalization middleware (production only) - must run BEFORE static handlers
app.use((req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'production') return next();

    const CANONICAL_HOST = '24toolhub.com';
    const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
    const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').toString();

    // Enforce HTTPS
    if (proto !== 'https') {
      const redirectUrl = `https://${host}${req.url}`;
      return res.redirect(301, redirectUrl);
    }

    // Enforce canonical host (de-www)
    if (host && host !== CANONICAL_HOST) {
      const redirectUrl = `https://${CANONICAL_HOST}${req.url}`;
      return res.redirect(301, redirectUrl);
    }

    // Path normalization for common index routes
    if (req.method === 'GET') {
      const url = new URL(req.url, `https://${CANONICAL_HOST}`);
      const pathname = url.pathname;

      // Normalize root index
      if (pathname === '/index.html' || pathname === '/index') {
        url.pathname = '/';
        return res.redirect(301, url.pathname + url.search);
      }

      // Normalize blog index and trailing slash
      if (pathname === '/blog' || pathname === '/blog/index.html') {
        url.pathname = '/blog/';
        return res.redirect(301, url.pathname + url.search);
      }
    }

    return next();
  } catch (_) {
    return next();
  }
});

// Static folders
app.use('/css', express.static(path.join(process.cwd(), 'css')));
app.use('/js', express.static(path.join(process.cwd(), 'js')));
app.use('/images', express.static(path.join(process.cwd(), 'images')));
app.use('/blog', express.static(path.join(process.cwd(), 'blog')));
app.use('/tools', express.static(path.join(process.cwd(), 'tools')));
app.use('/public', express.static(path.join(process.cwd(), 'public')));

app.use(cors());
app.use(express.json());

app.get('/ads.txt', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'ads.txt'));
});

app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'sitemap.xml'));
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'favicon.ico'));
});

app.get('/favicon-16x16.png', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'favicon-16x16.png'));
});

app.get('/favicon-32x32.png', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'favicon-32x32.png'));
});

app.get('/apple-touch-icon.png', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'apple-touch-icon.png'));
});

app.get('/android-chrome-192x192.png', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'android-chrome-192x192.png'));
});

app.get('/android-chrome-512x512.png', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'android-chrome-512x512.png'));
});

app.get('/site.webmanifest', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(process.cwd(), 'site.webmanifest'));
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
  
  // Check if the page is in the public directory
  const publicPages = ['about.html', 'contact.html', 'privacy.html', 'terms.html', 'cookie-policy.html'];
  if (publicPages.includes(pageName)) {
    const pageFile = path.join(process.cwd(), 'public', pageName);
    if (fs.existsSync(pageFile)) {
      res.sendFile(pageFile);
      return;
    }
  }
  
  // Otherwise check in the root directory
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

    // Extract Open Graph tags
    const ogTags = {
      title: $('meta[property="og:title"]').attr('content') || '',
      description: $('meta[property="og:description"]').attr('content') || '',
      image: $('meta[property="og:image"]').attr('content') || '',
      url: $('meta[property="og:url"]').attr('content') || ''
    };

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
      },
      ogTags: ogTags
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

// AI Status Check API
app.get('/ai-status', (req, res) => {
  try {
    const modelConfig = getModelForEndpoint('/chat', process.env);
    
    if (!modelConfig) {
      return res.json({
        available: false,
        reason: 'No AI configuration found',
        reasonAr: 'لم يتم العثور على إعدادات الذكاء الاصطناعي'
      });
    }

    const { primary, fallbacks } = modelConfig;
    const allModels = [primary, ...fallbacks];
    
    // Check if at least one model has a valid API key
    const hasValidKey = allModels.some(model => {
      const apiKey = process.env[model.requiresKey];
      return apiKey && apiKey.length > 10;
    });

    if (hasValidKey) {
      return res.json({
        available: true,
        primaryModel: `${primary.provider}/${primary.name}`,
        fallbackCount: fallbacks.length
      });
    } else {
      return res.json({
        available: false,
        reason: 'No valid API keys configured',
        reasonAr: 'لم يتم تكوين مفاتيح API صالحة'
      });
    }
  } catch (err) {
    res.json({
      available: false,
      reason: err.message,
      reasonAr: 'خطأ في التحقق من حالة الذكاء الاصطناعي'
    });
  }
});

// PageSpeed Insights API
app.get('/pagespeed', async (req, res) => {
  const { url, strategy = 'desktop' } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'PageSpeed API key not configured',
        errorAr: 'مفتاح PageSpeed API غير مُكوّن'
      });
    }

    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`;
    const response = await fetch(psiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'PageSpeed API request failed');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exchange Rates API
app.get('/exchange-rates', async (req, res) => {
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    
    // Try using API key if available (for better rate limits)
    if (apiKey) {
      try {
        // Try fixer.io API format
        const fixerUrl = `http://data.fixer.io/api/latest?access_key=${apiKey}&base=USD`;
        const fixerResponse = await fetch(fixerUrl);
        
        if (fixerResponse.ok) {
          const fixerData = await fixerResponse.json();
          if (fixerData.success !== false && fixerData.rates) {
            return res.json({ rates: fixerData.rates, source: 'fixer.io' });
          }
        }
      } catch (fixerError) {
        console.log('Fixer.io API failed, trying alternative...');
      }
      
      // Try exchangerate-api.com with API key
      try {
        const exchangeUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
        const exchangeResponse = await fetch(exchangeUrl);
        
        if (exchangeResponse.ok) {
          const exchangeData = await exchangeResponse.json();
          if (exchangeData.result === 'success' && exchangeData.conversion_rates) {
            return res.json({ rates: exchangeData.conversion_rates, source: 'exchangerate-api.com' });
          }
        }
      } catch (exchangeError) {
        console.log('ExchangeRate-API failed, using fallback...');
      }
    }
    
    // Fallback to free API (no key required)
    const freeResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (freeResponse.ok) {
      const freeData = await freeResponse.json();
      return res.json({ rates: freeData.rates, source: 'exchangerate-api.com (free)' });
    }
    
    throw new Error('All exchange rate APIs failed');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ping Test API
app.get('/ping', async (req, res) => {
  const { host, timeout = 5000 } = req.query;
  if (!host) return res.status(400).json({ error: 'Host required' });

  try {
    const config = {
      timeout: Math.min(parseInt(timeout) || 5000, 10000) / 1000, // Convert to seconds, max 10s
      min_reply: 1
    };

    const result = await ping.promise.probe(host, config);
    
    res.json({
      host: result.host,
      time: result.time !== 'unknown' ? parseFloat(result.time) : null,
      status: result.alive ? 'success' : 'timeout',
      packetLoss: result.packetLoss || '0%'
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      status: 'error'
    });
  }
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
