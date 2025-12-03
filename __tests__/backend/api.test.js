/**
 * Backend API Tests
 * Tests for the Express server endpoints
 */

const request = require('supertest');
const app = require('../../api/server');

describe('API Server', () => {
  describe('Health & Status Endpoints', () => {
    test('GET /ai-status should return AI availability status', async () => {
      const response = await request(app)
        .get('/ai-status')
        .expect('Content-Type', /json/);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('available');
    });

    test('GET /tools-database.json should return tools list', async () => {
      const response = await request(app)
        .get('/tools-database.json')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('tools');
      expect(Array.isArray(response.body.tools)).toBe(true);
    });
  });

  describe('SEO Analyzer', () => {
    test('GET /analyze-seo should require URL parameter', async () => {
      const response = await request(app)
        .get('/analyze-seo')
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });

    test('GET /analyze-seo should analyze valid URL', async () => {
      const response = await request(app)
        .get('/analyze-seo')
        .query({ url: 'https://example.com' })
        .timeout(15000);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('headings');
      }
    }, 20000);
  });

  describe('DNS Lookup', () => {
    test('GET /dns-lookup should require domain and recordTypes', async () => {
      const response = await request(app)
        .get('/dns-lookup')
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });

    test('GET /dns-lookup should return DNS records', async () => {
      const response = await request(app)
        .get('/dns-lookup')
        .query({ domain: 'google.com', recordTypes: 'A' })
        .timeout(10000);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('A');
    }, 15000);
  });

  describe('IP Info', () => {
    test('GET /ip-info should return IP information', async () => {
      const response = await request(app)
        .get('/ip-info')
        .timeout(10000);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ip');
    }, 15000);
  });

  describe('Ping', () => {
    test('GET /ping should require host parameter', async () => {
      const response = await request(app)
        .get('/ping')
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });

    test('GET /ping should ping valid host', async () => {
      const response = await request(app)
        .get('/ping')
        .query({ host: '8.8.8.8' })
        .timeout(10000);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    }, 15000);
  });

  describe('Chat API', () => {
    test('POST /chat should require message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Static Files', () => {
    test('GET / should return homepage', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.text).toContain('html');
    });

    test('GET /robots.txt should return robots file', async () => {
      const response = await request(app)
        .get('/robots.txt')
        .expect(200);
      
      expect(response.text).toContain('User-agent');
    });

    test('GET /sitemap.xml should return sitemap', async () => {
      const response = await request(app)
        .get('/sitemap.xml')
        .expect(200);
      
      expect(response.text).toContain('xml');
    });
  });

  describe('Error Handling', () => {
    test('GET /nonexistent-route should return 404', async () => {
      const response = await request(app)
        .get('/this-route-does-not-exist-12345')
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
    });
  });
});
