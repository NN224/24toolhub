/**
 * Frontend JavaScript Tests
 * Tests client-side utility functions and basic functionality
 */

const fs = require('fs');
const path = require('path');

describe('Frontend JavaScript Tests', () => {
  
  // ===================================================
  // File Existence Tests
  // ===================================================
  describe('JavaScript Files', () => {
    test('Main JavaScript file should exist', () => {
      const mainJsPath = path.join(__dirname, '../../js/main.js');
      expect(fs.existsSync(mainJsPath)).toBe(true);
    });

    test('Chatbot JavaScript file should exist', () => {
      const chatbotJsPath = path.join(__dirname, '../../js/chatbot.js');
      expect(fs.existsSync(chatbotJsPath)).toBe(true);
    });

    test('SEO Analyzer JavaScript file should exist', () => {
      const seoJsPath = path.join(__dirname, '../../js/seo-analyzer.js');
      expect(fs.existsSync(seoJsPath)).toBe(true);
    });

    test('Utils JavaScript file should exist', () => {
      const utilsJsPath = path.join(__dirname, '../../js/utils.js');
      expect(fs.existsSync(utilsJsPath)).toBe(true);
    });
  });

  // ===================================================
  // HTML Files Tests
  // ===================================================
  describe('HTML Pages', () => {
    test('Index page should exist', () => {
      const indexPath = path.join(__dirname, '../../index.html');
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    test('Index page should contain proper structure', () => {
      const indexPath = path.join(__dirname, '../../index.html');
      const content = fs.readFileSync(indexPath, 'utf8');
      
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('<html');
      expect(content).toContain('<head>');
      expect(content).toContain('<body>');
      expect(content).toContain('24ToolHub');
    });

    test('Tool pages should exist', () => {
      const toolPages = [
        'seo-analyzer.html',
        'password-generator.html',
        'json-formatter.html',
        'base64-encoder.html',
        'qr-code-generator.html'
      ];
      
      toolPages.forEach(page => {
        const pagePath = path.join(__dirname, '../../tools', page);
        expect(fs.existsSync(pagePath)).toBe(true);
      });
    });
  });

  // ===================================================
  // CSS Files Tests
  // ===================================================
  describe('CSS Files', () => {
    test('Main stylesheet should exist', () => {
      const cssPath = path.join(__dirname, '../../css/styles.css');
      expect(fs.existsSync(cssPath)).toBe(true);
    });

    test('Main stylesheet should contain styles', () => {
      const cssPath = path.join(__dirname, '../../css/styles.css');
      const content = fs.readFileSync(cssPath, 'utf8');
      
      expect(content.length).toBeGreaterThan(0);
      // Should contain CSS rules
      expect(content).toMatch(/[{;}]/);
    });
  });

  // ===================================================
  // JavaScript Code Quality Tests
  // ===================================================
  describe('JavaScript Code Quality', () => {
    test('Chatbot.js should be valid JavaScript', () => {
      const chatbotPath = path.join(__dirname, '../../js/chatbot.js');
      const content = fs.readFileSync(chatbotPath, 'utf8');
      
      // Check for class definition
      expect(content).toContain('class Chatbot');
      expect(content).toContain('constructor');
      
      // Check for no obvious syntax errors (basic check)
      expect(content).not.toContain('<<<<<<');
      expect(content).not.toContain('>>>>>>');
    });

    test('SEO Analyzer should be valid JavaScript', () => {
      const seoPath = path.join(__dirname, '../../js/seo-analyzer.js');
      const content = fs.readFileSync(seoPath, 'utf8');
      
      // Check for class definition
      expect(content).toContain('class SEOAnalyzer');
      expect(content).toContain('constructor');
      
      // Check for API endpoint definition
      expect(content).toContain('SEO_API_ENDPOINT');
    });

    test('Main.js should be valid JavaScript', () => {
      const mainPath = path.join(__dirname, '../../js/main.js');
      const content = fs.readFileSync(mainPath, 'utf8');
      
      expect(content.length).toBeGreaterThan(0);
      
      // Check for no obvious syntax errors
      expect(content).not.toContain('<<<<<<');
      expect(content).not.toContain('>>>>>>');
    });
  });

  // ===================================================
  // Tool-Specific Tests
  // ===================================================
  describe('Tool-Specific JavaScript', () => {
    const tools = [
      'password-generator.js',
      'json-formatter.js',
      'base64-encoder.js',
      'uuid-generator.js',
      'qr-code-generator.js'
    ];

    tools.forEach(tool => {
      test(`${tool} should exist and be valid`, () => {
        const toolPath = path.join(__dirname, '../../js', tool);
        expect(fs.existsSync(toolPath)).toBe(true);
        
        const content = fs.readFileSync(toolPath, 'utf8');
        expect(content.length).toBeGreaterThan(0);
        
        // Should not have merge conflicts
        expect(content).not.toContain('<<<<<<');
        expect(content).not.toContain('>>>>>>');
      });
    });
  });

  // ===================================================
  // API Endpoint Configuration Tests
  // ===================================================
  describe('API Endpoint Configuration', () => {
    test('SEO Analyzer should point to correct endpoint', () => {
      const seoPath = path.join(__dirname, '../../js/seo-analyzer.js');
      const content = fs.readFileSync(seoPath, 'utf8');
      
      expect(content).toContain('/analyze-seo');
    });

    test('DNS Lookup should point to correct endpoint', () => {
      const dnsPath = path.join(__dirname, '../../js/dns-lookup.js');
      const content = fs.readFileSync(dnsPath, 'utf8');
      
      expect(content).toContain('/dns-lookup');
    });

    test('Chatbot should point to correct endpoint', () => {
      const chatbotPath = path.join(__dirname, '../../js/chatbot.js');
      const content = fs.readFileSync(chatbotPath, 'utf8');
      
      expect(content).toContain('/chat');
    });
  });

  // ===================================================
  // HTML Structure Tests
  // ===================================================
  describe('HTML Structure', () => {
    test('Tool pages should have consistent structure', () => {
      const toolPages = [
        'seo-analyzer.html',
        'password-generator.html',
        'json-formatter.html'
      ];
      
      toolPages.forEach(page => {
        const pagePath = path.join(__dirname, '../../tools', page);
        const content = fs.readFileSync(pagePath, 'utf8');
        
        // Should have doctype
        expect(content).toContain('<!DOCTYPE html>');
        
        // Should load main JS
        expect(content).toMatch(/main\.js|\.js/);
        
        // Should load main CSS (styles.css or style.css)
        expect(content).toMatch(/styles\.css|style\.css|\.css/);
        
        // Should have title
        expect(content).toContain('<title>');
      });
    });

    test('Tool pages should reference correct JavaScript files', () => {
      const toolMapping = {
        'seo-analyzer.html': 'seo-analyzer.js',
        'password-generator.html': 'password-generator.js',
        'json-formatter.html': 'json-formatter.js'
      };
      
      Object.entries(toolMapping).forEach(([htmlFile, jsFile]) => {
        const htmlPath = path.join(__dirname, '../../tools', htmlFile);
        const content = fs.readFileSync(htmlPath, 'utf8');
        
        expect(content).toContain(jsFile);
      });
    });
  });

  // ===================================================
  // Configuration Files Tests
  // ===================================================
  describe('Configuration Files', () => {
    test('tools-database.json should exist and be valid', () => {
      const dbPath = path.join(__dirname, '../../tools-database.json');
      expect(fs.existsSync(dbPath)).toBe(true);
      
      const content = fs.readFileSync(dbPath, 'utf8');
      const data = JSON.parse(content);
      
      expect(data).toHaveProperty('tools');
      expect(Array.isArray(data.tools)).toBe(true);
      expect(data.tools.length).toBeGreaterThan(0);
    });

    test('Each tool in database should have required fields', () => {
      const dbPath = path.join(__dirname, '../../tools-database.json');
      const content = fs.readFileSync(dbPath, 'utf8');
      const data = JSON.parse(content);
      
      data.tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('category');
        
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(tool.name.length).toBeGreaterThan(0);
      });
    });
  });

  // ===================================================
  // Asset Files Tests
  // ===================================================
  describe('Asset Files', () => {
    test('Favicon should exist', () => {
      const faviconPath = path.join(__dirname, '../../favicon.ico');
      expect(fs.existsSync(faviconPath)).toBe(true);
    });

    test('Robots.txt should exist', () => {
      const robotsPath = path.join(__dirname, '../../robots.txt');
      expect(fs.existsSync(robotsPath)).toBe(true);
    });

    test('Sitemap should exist', () => {
      const sitemapPath = path.join(__dirname, '../../sitemap.xml');
      expect(fs.existsSync(sitemapPath)).toBe(true);
    });
  });
});
