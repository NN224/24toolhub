const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require('cors');
const dns = require('dns').promises;
const ping = require('ping');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.listen(port, '0.0.0.0', () => {
    console.log(`24ToolHub server listening at http://0.0.0.0:${port}`);
});
