/**
 * Backend API Tests for 24ToolHub
 * Tests all major API endpoints
 */

const request = require('supertest');
const path = require('path');

// Mock environment variables
process.env.GEMINI_API_KEY = 'test-key';
process.env.PAGESPEED_API_KEY = 'test-key';

// Import the app after setting env vars
const app = require('../../server.js');

describe('24ToolHub Backend API Tests', () => {
  
  // ===================================================
  // Static File Serving Tests
  // ===================================================
  describe('Static File Serving', () => {
    test('GET / should return index.html', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200);
      
      expect(response.text).toContain('24ToolHub');
    });

    test('GET /about should return about.html', async () => {
      const response = await request(app)
        .get('/about')
        .expect('Content-Type', /html/)
        .expect(200);
      
      expect(response.text).toContain('About');
    });

    test('GET /contact should return contact.html', async () => {
      const response = await request(app)
        .get('/contact')
        .expect('Content-Type', /html/)
        .expect(200);
    });
  });

  // ===================================================
  // SEO Analyzer API Tests
  // ===================================================
  describe('SEO Analyzer API', () => {
    test('GET /analyze-seo without URL should return 400', async () => {
      const response = await request(app)
        .get('/analyze-seo')
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('URL parameter is required');
    });

    test('GET /analyze-seo with invalid URL should return 500', async () => {
      const response = await request(app)
        .get('/analyze-seo?url=invalid-url')
        .expect(500);
      
      expect(response.body).toHaveProperty('error');
    });

    // This test would require actual HTTP call - skipping in unit tests
    test.skip('GET /analyze-seo with valid URL should return analysis', async () => {
      const response = await request(app)
        .get('/analyze-seo?url=https://example.com')
        .expect(200);
      
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('headings');
      expect(response.body).toHaveProperty('images');
    });
  });

  // ===================================================
  // DNS Lookup API Tests
  // ===================================================
  describe('DNS Lookup API', () => {
    test('GET /dns-lookup without parameters should return 400', async () => {
      const response = await request(app)
        .get('/dns-lookup')
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Domain and recordTypes parameters are required');
    });

    test('GET /dns-lookup without recordTypes should return 400', async () => {
      const response = await request(app)
        .get('/dns-lookup?domain=example.com')
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });

    test('GET /dns-lookup with valid parameters should return DNS records', async () => {
      const response = await request(app)
        .get('/dns-lookup?domain=example.com&recordTypes=A')
        .expect(200);
      
      expect(response.body).toBeDefined();
      // Response will be empty object or have A records
      expect(typeof response.body).toBe('object');
    }, 10000); // DNS lookup may take time
  });

  // ===================================================
  // PageSpeed API Tests
  // ===================================================
  describe('PageSpeed API', () => {
    test('GET /pagespeed without URL should return 400', async () => {
      const response = await request(app)
        .get('/pagespeed')
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('URL parameter is required');
    });

    test('GET /pagespeed with URL but missing API key should return 500', async () => {
      // Temporarily remove API key
      const originalKey = process.env.PAGESPEED_API_KEY;
      delete process.env.PAGESPEED_API_KEY;
      
      const response = await request(app)
        .get('/pagespeed?url=https://example.com')
        .expect(500);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('PageSpeed API key is not configured');
      
      // Restore API key
      process.env.PAGESPEED_API_KEY = originalKey;
    });
  });

  // ===================================================
  // Chatbot API Tests
  // ===================================================
  describe('Chatbot API', () => {
    test('POST /chat without message should return 400', async () => {
      const response = await request(app)
        .post('/chat')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Message is required');
    });

    test('POST /chat with message but missing API key should return 500', async () => {
      // Temporarily remove API key
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      
      const response = await request(app)
        .post('/chat')
        .send({ message: 'Hello' })
        .expect(500);
      
      expect(response.body).toHaveProperty('error');
      
      // Restore API key
      process.env.GEMINI_API_KEY = originalKey;
    });

    test('POST /chat with valid message and conversation history', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          message: 'What tools do you have?',
          conversationHistory: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi! How can I help you?' }
          ]
        });
      
      // Expect either success or error (depends on API key validity)
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('response');
        expect(response.body).toHaveProperty('modelUsed');
        expect(response.body).toHaveProperty('timestamp');
      }
    });
  });

  // ===================================================
  // Static Assets Tests
  // ===================================================
  describe('Static Assets', () => {
    test('GET /css/styles.css should return CSS file', async () => {
      await request(app)
        .get('/css/styles.css')
        .expect('Content-Type', /css/)
        .expect(200);
    });

    test('GET /js/main.js should return JavaScript file', async () => {
      await request(app)
        .get('/js/main.js')
        .expect('Content-Type', /javascript/)
        .expect(200);
    });

    test('GET /images should be accessible', async () => {
      // This will either return directory listing or 404 depending on server config
      const response = await request(app).get('/images');
      expect([200, 301, 302, 404]).toContain(response.status);
    });
  });

  // ===================================================
  // Error Handling Tests
  // ===================================================
  describe('Error Handling', () => {
    test('GET /nonexistent-page should return 404 or redirect', async () => {
      const response = await request(app).get('/nonexistent-page-xyz');
      expect([404, 301, 302]).toContain(response.status);
    });

    test('POST to wrong endpoint should handle gracefully', async () => {
      const response = await request(app)
        .post('/analyze-seo')
        .send({ data: 'test' });
      
      // Should either not match route or handle POST
      expect([404, 405, 400]).toContain(response.status);
    });
  });

  // ===================================================
  // CORS Tests
  // ===================================================
  describe('CORS Configuration', () => {
    test('API endpoints should have CORS headers', async () => {
      const response = await request(app)
        .get('/analyze-seo?url=https://example.com')
        .expect('Access-Control-Allow-Origin', '*');
    });

    test('OPTIONS request should be handled', async () => {
      await request(app)
        .options('/chat')
        .expect(204);
    });
  });
});
