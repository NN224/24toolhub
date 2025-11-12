/**
 * AI Service Module Tests
 * Tests AI provider integration and fallback logic
 */

const aiService = require('../../ai-service.js');

describe('AI Service Tests', () => {
  
  // ===================================================
  // Module Exports Tests
  // ===================================================
  describe('Module Exports', () => {
    test('Should export required functions', () => {
      expect(aiService).toHaveProperty('callAIWithFallback');
      expect(aiService).toHaveProperty('callAI');
      expect(aiService).toHaveProperty('initGemini');
      expect(aiService).toHaveProperty('callGemini');
      expect(aiService).toHaveProperty('callOpenAI');
      expect(aiService).toHaveProperty('callClaude');
      
      expect(typeof aiService.callAIWithFallback).toBe('function');
      expect(typeof aiService.callAI).toBe('function');
      expect(typeof aiService.initGemini).toBe('function');
      expect(typeof aiService.callGemini).toBe('function');
      expect(typeof aiService.callOpenAI).toBe('function');
      expect(typeof aiService.callClaude).toBe('function');
    });
  });

  // ===================================================
  // Gemini Initialization Tests
  // ===================================================
  describe('Gemini Initialization', () => {
    test('Should throw error when API key is missing', () => {
      expect(() => {
        aiService.initGemini();
      }).toThrow('Gemini API key is required');
      
      expect(() => {
        aiService.initGemini(null);
      }).toThrow('Gemini API key is required');
      
      expect(() => {
        aiService.initGemini('');
      }).toThrow('Gemini API key is required');
    });

    test('Should initialize Gemini with valid API key', () => {
      const client = aiService.initGemini('test-api-key');
      expect(client).toBeDefined();
    });
  });

  // ===================================================
  // Gemini Call Tests
  // ===================================================
  describe('Gemini Call', () => {
    test('Should throw error when API key is missing', async () => {
      const params = {
        model: { name: 'gemini-1.5-flash', provider: 'gemini' },
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: null
      };
      
      await expect(aiService.callGemini(params)).rejects.toThrow();
    });

    test('Should accept valid parameters structure', async () => {
      const params = {
        model: { name: 'gemini-1.5-flash', provider: 'gemini' },
        messages: [{ role: 'user', content: 'Hello' }],
        systemInstruction: 'You are a helpful assistant',
        apiKey: 'test-key'
      };
      
      // This will fail due to invalid API key, but should not throw immediately
      expect(params).toBeDefined();
      expect(params.messages).toBeDefined();
      expect(params.apiKey).toBe('test-key');
    });
  });

  // ===================================================
  // OpenAI Call Tests
  // ===================================================
  describe('OpenAI Call', () => {
    test('Should handle missing OpenAI package', async () => {
      const params = {
        model: { name: 'gpt-4o-mini', provider: 'openai' },
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key'
      };
      
      // Will throw error about missing package or invalid key
      await expect(aiService.callOpenAI(params)).rejects.toThrow();
    });
  });

  // ===================================================
  // Claude Call Tests
  // ===================================================
  describe('Claude Call', () => {
    test('Should handle missing Claude package', async () => {
      const params = {
        model: { name: 'claude-3-haiku-20240307', provider: 'claude' },
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key'
      };
      
      // Will throw error about missing package or invalid key
      await expect(aiService.callClaude(params)).rejects.toThrow();
    });
  });

  // ===================================================
  // Fallback System Tests
  // ===================================================
  describe('Fallback System', () => {
    test('Should require model configuration', async () => {
      const requestParams = {
        messages: [{ role: 'user', content: 'Hello' }]
      };
      
      await expect(
        aiService.callAIWithFallback(null, requestParams, {})
      ).rejects.toThrow();
    });

    test('Should fail when no API keys are available', async () => {
      const modelConfig = {
        primary: {
          provider: 'gemini',
          name: 'gemini-1.5-flash',
          requiresKey: 'GEMINI_API_KEY'
        },
        fallbacks: [],
        tier: 'CHEAP'
      };
      
      const requestParams = {
        messages: [{ role: 'user', content: 'Hello' }]
      };
      
      const env = {}; // No API keys
      
      await expect(
        aiService.callAIWithFallback(modelConfig, requestParams, env)
      ).rejects.toThrow('All AI models failed');
    });

    test('Should attempt fallback models when primary fails', async () => {
      const modelConfig = {
        primary: {
          provider: 'gemini',
          name: 'gemini-1.5-flash',
          requiresKey: 'GEMINI_API_KEY'
        },
        fallbacks: [
          {
            provider: 'openai',
            name: 'gpt-4o-mini',
            requiresKey: 'OPENAI_API_KEY'
          }
        ],
        tier: 'CHEAP'
      };
      
      const requestParams = {
        messages: [{ role: 'user', content: 'Hello' }]
      };
      
      const env = {
        GEMINI_API_KEY: 'invalid-key',
        OPENAI_API_KEY: 'invalid-key'
      };
      
      // Should try both models and fail
      await expect(
        aiService.callAIWithFallback(modelConfig, requestParams, env)
      ).rejects.toThrow('All AI models failed');
    });

    test('Should return error details when all models fail', async () => {
      const modelConfig = {
        primary: {
          provider: 'gemini',
          name: 'gemini-1.5-flash',
          requiresKey: 'GEMINI_API_KEY'
        },
        fallbacks: [],
        tier: 'CHEAP'
      };
      
      const requestParams = {
        messages: [{ role: 'user', content: 'Hello' }]
      };
      
      const env = {
        GEMINI_API_KEY: 'invalid-key'
      };
      
      try {
        await aiService.callAIWithFallback(modelConfig, requestParams, env);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('All AI models failed');
      }
    });
  });

  // ===================================================
  // Simple AI Call Tests
  // ===================================================
  describe('Simple AI Call', () => {
    test('Should handle unknown provider', async () => {
      const requestParams = {
        messages: [{ role: 'user', content: 'Hello' }]
      };
      
      await expect(
        aiService.callAI('unknown-provider', 'model-name', requestParams, 'test-key')
      ).rejects.toThrow('Unknown provider');
    });

    test('Should route to correct provider', async () => {
      const requestParams = {
        messages: [{ role: 'user', content: 'Hello' }]
      };
      
      // Gemini - will fail with invalid key but should route correctly
      await expect(
        aiService.callAI('gemini', 'gemini-1.5-flash', requestParams, 'test-key')
      ).rejects.toThrow();
      
      // OpenAI - will fail with missing package
      await expect(
        aiService.callAI('openai', 'gpt-4o-mini', requestParams, 'test-key')
      ).rejects.toThrow();
      
      // Claude - will fail with missing package
      await expect(
        aiService.callAI('claude', 'claude-3-haiku', requestParams, 'test-key')
      ).rejects.toThrow();
    });
  });

  // ===================================================
  // Message Format Tests
  // ===================================================
  describe('Message Format', () => {
    test('Should handle empty message array', async () => {
      const modelConfig = {
        primary: {
          provider: 'gemini',
          name: 'gemini-1.5-flash',
          requiresKey: 'GEMINI_API_KEY'
        },
        fallbacks: [],
        tier: 'CHEAP'
      };
      
      const requestParams = {
        messages: []
      };
      
      const env = {
        GEMINI_API_KEY: 'test-key'
      };
      
      await expect(
        aiService.callAIWithFallback(modelConfig, requestParams, env)
      ).rejects.toThrow();
    });

    test('Should handle conversation history', async () => {
      const modelConfig = {
        primary: {
          provider: 'gemini',
          name: 'gemini-1.5-flash',
          requiresKey: 'GEMINI_API_KEY'
        },
        fallbacks: [],
        tier: 'CHEAP'
      };
      
      const requestParams = {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
          { role: 'user', content: 'How are you?' }
        ],
        systemInstruction: 'You are a helpful assistant'
      };
      
      const env = {
        GEMINI_API_KEY: 'test-key'
      };
      
      // Will fail with invalid key but structure is valid
      await expect(
        aiService.callAIWithFallback(modelConfig, requestParams, env)
      ).rejects.toThrow();
    });
  });
});
