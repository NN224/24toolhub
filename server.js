const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require('cors');
const dns = require('dns').promises;
const ping = require('ping');
const path = require('path');
const fs = require('fs');
const { getModelForEndpoint } = require('./ai-config');
const { callAIWithFallback } = require('./ai-service');

const app = express();
const port = process.env.PORT || 5000;

// Load tools database
const toolsData = JSON.parse(fs.readFileSync('tools-database.json', 'utf8'));

// Rate limiting: Simple in-memory store (IP -> {count, resetTime})
// Note: For Vercel serverless, consider using external rate limiting (Redis, Vercel KV, etc.)
// This in-memory approach works for initial deployment but has limitations in serverless
const rateLimits = new Map();
const RATE_LIMIT = 5; // messages per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

// Cleanup old rate limit entries periodically (for memory management)
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

// Disable caching for HTML files to ensure users always get latest version
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

app.use(express.static(path.join(__dirname)));

app.get('/analyze-seo', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL with status: ${response.status}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        const analysis = {
            title: {
                text: $('title').text(),
                length: $('title').text().length
            },
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

app.get('/dns-lookup', async (req, res) => {
    const { domain, recordTypes } = req.query;

    if (!domain || !recordTypes) {
        return res.status(400).json({ error: 'Domain and recordTypes parameters are required' });
    }

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
                    records = (await dns.resolveTxt(domain)).map(r => ({ value: r.join(' '), ttl: 300 })); // TTL not provided for TXT
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
            // Ignore errors for specific record types (e.g., no AAAA record found)
            console.warn(`DNS lookup for ${type} on ${domain} failed:`, error.code);
        }
    });

    await Promise.all(lookupPromises);

    res.status(200).json(results);
});

app.get('/pagespeed', async (req, res) => {
    const { url, strategy } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

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

app.get('/ping', async (req, res) => {
    const { host, timeout } = req.query;

    if (!host) {
        return res.status(400).json({ error: 'Host parameter is required' });
    }

    const timeoutMs = parseInt(timeout) || 2000;
    const startTime = Date.now();

    try {
        // Try HTTP/HTTPS connection test as an alternative to ICMP ping
        let testUrl = host;
        if (!host.startsWith('http://') && !host.startsWith('https://')) {
            testUrl = 'https://' + host;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(testUrl, {
                method: 'HEAD',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            res.status(200).json({
                host: host,
                time: responseTime,
                status: 'success'
            });
        } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
                res.status(200).json({
                    host: host,
                    time: timeoutMs,
                    status: 'timeout',
                    error: 'Request timed out'
                });
            } else {
                // Try with http if https failed
                try {
                    const httpUrl = 'http://' + host.replace(/^https?:\/\//, '');
                    const controller2 = new AbortController();
                    const timeoutId2 = setTimeout(() => controller2.abort(), timeoutMs);
                    
                    const response2 = await fetch(httpUrl, {
                        method: 'HEAD',
                        signal: controller2.signal
                    });
                    clearTimeout(timeoutId2);
                    
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;

                    res.status(200).json({
                        host: host,
                        time: responseTime,
                        status: 'success'
                    });
                } catch (error2) {
                    const endTime = Date.now();
                    res.status(200).json({
                        host: host,
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

// Chat endpoint for AI Assistant
app.post('/chat', async (req, res) => {
    const { message, conversationHistory } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Rate limiting check
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
            // Reset window
            limitData.count = 1;
            limitData.resetTime = now + RATE_WINDOW;
        }
    } else {
        rateLimits.set(clientIp, { count: 1, resetTime: now + RATE_WINDOW });
    }

    try {
        // Get model configuration with fallback chain
        const modelConfig = getModelForEndpoint('/chat', process.env);
        
        if (!modelConfig) {
            return res.status(500).json({ 
                error: 'AI service not configured for this endpoint.',
                errorAr: 'خدمة الذكاء الاصطناعي غير مُكونة لهذه النقطة.'
            });
        }

        // Build system instruction with tools database
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
${JSON.stringify(toolsData.tools, null, 2)}

Guidelines:
- Always search through the tools database to find relevant tools
- Provide direct links when suggesting tools (use the 'url' field)
- If user asks in Arabic, respond in Arabic
- If user asks in English, respond in English
- Keep responses concise (2-4 sentences unless more detail is needed)
- Be encouraging and helpful

WORKFLOW RECOMMENDATIONS:
When users ask about complex tasks (e.g., "optimize my website", "prepare data for analysis"), suggest a complete workflow:

Example 1: "How to optimize my website?"
Response: To optimize your website, follow this workflow:
*   **Step 1 - Minify CSS:** [CSS Minifier](url) - Reduce CSS file size
*   **Step 2 - Minify HTML:** [HTML Minifier](url) - Compress HTML code
*   **Step 3 - Compress Images:** [Image Compressor](url) - Reduce image sizes
*   **Step 4 - Test Performance:** [Website Speed Test](url) - Check your improvements

Example 2: "Convert data from JSON to Excel"
Response: To convert JSON to Excel format:
*   **Step 1:** [JSON Formatter](url) - Verify your JSON is valid
*   **Step 2:** [JSON to CSV](url) - Convert to CSV format (Excel compatible)

Use workflows when appropriate to provide complete solutions!`;

        // Build message history for AI
        const messages = [];
        
        // Add conversation history
        if (conversationHistory && Array.isArray(conversationHistory)) {
            conversationHistory.forEach(msg => {
                messages.push({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                });
            });
        }
        
        // Add current message
        messages.push({
            role: 'user',
            content: message
        });

        // Call AI with automatic fallback
        const result = await callAIWithFallback(
            modelConfig,
            { messages, systemInstruction },
            process.env
        );

        res.json({
            response: result.response,
            timestamp: new Date().toISOString(),
            modelUsed: result.modelUsed // Include which model was used for transparency
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

app.listen(port, '0.0.0.0', () => {
    console.log(`24ToolHub server listening at http://0.0.0.0:${port}`);
});

// Export for Vercel serverless
module.exports = app;
