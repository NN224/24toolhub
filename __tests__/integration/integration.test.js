/**
 * Integration Tests for 24ToolHub
 * Tests complete end-to-end workflows
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Mock environment variables
process.env.GEMINI_API_KEY = 'test-key';
process.env.PAGESPEED_API_KEY = 'test-key';

const app = require('../../server.js');

describe('End-to-End Integration Tests', () => {
  
  // ===================================================
  // Complete User Journey Tests
  // ===================================================
  describe('User Journey: Homepage to Tool', () => {
    test('User can navigate from homepage to tool page', async () => {
      // Step 1: Load homepage
      const homeResponse = await request(app)
        .get('/')
        .expect(200);
      
      expect(homeResponse.text).toContain('24ToolHub');
      
      // Step 2: Navigate to about page
      const aboutResponse = await request(app)
        .get('/about')
        .expect(200);
      
      expect(aboutResponse.text).toContain('About');
      
      // Step 3: Navigate to contact page
      const contactResponse = await request(app)
        .get('/contact')
        .expect(200);
      
      expect(contactResponse.text).toBeDefined();
    });

    test('User can access static assets', async () => {
      // Load CSS
      await request(app)
        .get('/css/styles.css')
        .expect(200);
      
      // Load JS
      await request(app)
        .get('/js/main.js')
        .expect(200);
    });
  });

  // ===================================================
  // API Integration Tests
  // ===================================================
  describe('API Integration Flow', () => {
    test('Chat API complete flow', async () => {
      // First message
      const message1 = await request(app)
        .post('/chat')
        .send({
          message: 'Hello'
        });
      
      // Should either succeed or fail gracefully
      expect([200, 500]).toContain(message1.status);
      
      if (message1.status === 200) {
        expect(message1.body).toHaveProperty('response');
        
        // Second message with history
        const message2 = await request(app)
          .post('/chat')
          .send({
            message: 'What tools do you have?',
            conversationHistory: [
              { role: 'user', content: 'Hello' },
              { role: 'assistant', content: message1.body.response }
            ]
          });
        
        expect([200, 500]).toContain(message2.status);
      }
    });

    test('DNS Lookup complete flow', async () => {
      // Step 1: Query A records
      const aRecords = await request(app)
        .get('/dns-lookup?domain=example.com&recordTypes=A')
        .expect(200);
      
      expect(aRecords.body).toBeDefined();
      
      // Step 2: Query multiple record types
      const multiRecords = await request(app)
        .get('/dns-lookup?domain=example.com&recordTypes=A&recordTypes=MX')
        .expect(200);
      
      expect(multiRecords.body).toBeDefined();
    }, 15000);
  });

  // ===================================================
  // Error Recovery Tests
  // ===================================================
  describe('Error Recovery', () => {
    test('Should recover from missing API key', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      
      const response = await request(app)
        .post('/chat')
        .send({ message: 'Hello' });
      
      // Should return error
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      
      // Restore key
      process.env.GEMINI_API_KEY = originalKey;
      
      // Should work again (or at least not crash)
      const response2 = await request(app)
        .post('/chat')
        .send({ message: 'Hello' });
      
      expect([200, 500]).toContain(response2.status);
    });

    test('Should handle malformed requests gracefully', async () => {
      // Missing required fields
      await request(app)
        .get('/analyze-seo')
        .expect(400);
      
      await request(app)
        .get('/dns-lookup')
        .expect(400);
      
      await request(app)
        .get('/pagespeed')
        .expect(400);
      
      await request(app)
        .post('/chat')
        .send({})
        .expect(400);
    });

    test('Should handle invalid data gracefully', async () => {
      // Invalid URL
      await request(app)
        .get('/analyze-seo?url=not-a-url')
        .expect(500);
      
      // Invalid domain
      const response = await request(app)
        .get('/dns-lookup?domain=invalid..domain&recordTypes=A');
      
      // Should return 200 with empty results or error
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  // ===================================================
  // Data Consistency Tests
  // ===================================================
  describe('Data Consistency', () => {
    test('Tools database should be loadable by server', () => {
      const dbPath = path.join(__dirname, '../../tools-database.json');
      const content = fs.readFileSync(dbPath, 'utf8');
      const data = JSON.parse(content);
      
      expect(data).toHaveProperty('tools');
      expect(Array.isArray(data.tools)).toBe(true);
      expect(data.tools.length).toBeGreaterThan(0);
      
      // Verify each tool has required fields
      data.tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
      });
    });

    test('AI configuration should be consistent', () => {
      const aiConfig = require('../../ai-config.js');
      
      const tiers = aiConfig.getModelTiers();
      const mappings = aiConfig.getEndpointMappings();
      
      // All mappings should reference valid tiers
      Object.values(mappings).forEach(tier => {
        if (tier !== null) {
          expect(tiers).toHaveProperty(tier);
        }
      });
    });
  });

  // ===================================================
  // Performance Tests (Basic)
  // ===================================================
  describe('Performance', () => {
    test('Homepage should load quickly', async () => {
      const start = Date.now();
      await request(app).get('/').expect(200);
      const duration = Date.now() - start;
      
      // Should load in under 1 second
      expect(duration).toBeLessThan(1000);
    });

    test('Static assets should load quickly', async () => {
      const start = Date.now();
      await request(app).get('/css/styles.css').expect(200);
      const duration = Date.now() - start;
      
      // Should load in under 500ms
      expect(duration).toBeLessThan(500);
    });

    test('API endpoints should respond within timeout', async () => {
      const start = Date.now();
      await request(app)
        .get('/analyze-seo')
        .expect(400); // Will fail validation but should respond quickly
      const duration = Date.now() - start;
      
      // Should respond in under 100ms for validation errors
      expect(duration).toBeLessThan(100);
    });
  });

  // ===================================================
  // Security Tests (Basic)
  // ===================================================
  describe('Security', () => {
    test('Should not expose sensitive information in errors', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: 'test' })
        .expect([200, 500]);
      
      if (response.status === 500) {
        // Error message should not contain API keys
        const bodyStr = JSON.stringify(response.body);
        expect(bodyStr).not.toMatch(/sk-[a-zA-Z0-9]{32,}/); // OpenAI key pattern
        expect(bodyStr).not.toMatch(/AIza[a-zA-Z0-9-_]{35}/); // Google API key pattern
      }
    });

    test('Should have CORS enabled for API endpoints', async () => {
      const response = await request(app)
        .get('/analyze-seo?url=https://example.com')
        .expect('Access-Control-Allow-Origin', '*');
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('Should handle OPTIONS requests for CORS', async () => {
      await request(app)
        .options('/chat')
        .expect(204);
    });
  });

  // ===================================================
  // Content Type Tests
  // ===================================================
  describe('Content Types', () => {
    test('HTML pages should have correct content type', async () => {
      await request(app)
        .get('/')
        .expect('Content-Type', /html/);
    });

    test('CSS files should have correct content type', async () => {
      await request(app)
        .get('/css/styles.css')
        .expect('Content-Type', /css/);
    });

    test('JavaScript files should have correct content type', async () => {
      await request(app)
        .get('/js/main.js')
        .expect('Content-Type', /javascript/);
    });

    test('API responses should be JSON', async () => {
      await request(app)
        .get('/analyze-seo')
        .expect('Content-Type', /json/);
    });
  });

  // ===================================================
  // Deployment Readiness Tests
  // ===================================================
  describe('Deployment Readiness', () => {
    test('Server should export app for Vercel', () => {
      const serverCode = fs.readFileSync(
        path.join(__dirname, '../../server.js'),
        'utf8'
      );
      
      expect(serverCode).toContain('module.exports');
    });

    test('Vercel configuration should exist', () => {
      const vercelPath = path.join(__dirname, '../../vercel.json');
      expect(fs.existsSync(vercelPath)).toBe(true);
      
      const content = fs.readFileSync(vercelPath, 'utf8');
      const config = JSON.parse(content);
      
      expect(config).toHaveProperty('version');
    });

    test('Environment example file should exist', () => {
      const envExamplePath = path.join(__dirname, '../../.env.example');
      expect(fs.existsSync(envExamplePath)).toBe(true);
    });

    test('.gitignore should exclude sensitive files', () => {
      const gitignorePath = path.join(__dirname, '../../.gitignore');
      const content = fs.readFileSync(gitignorePath, 'utf8');
      
      expect(content).toContain('.env');
      expect(content).toContain('node_modules');
    });
  });
});
