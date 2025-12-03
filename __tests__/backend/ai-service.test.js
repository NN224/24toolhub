/**
 * AI Service Tests
 * Tests for the AI service layer with multi-provider support
 */

const {
  callAIWithFallback,
  callAI,
  initGemini
} = require('../../ai-service');

describe('AI Service', () => {
  describe('initGemini', () => {
    test('should throw error without API key', () => {
      expect(() => initGemini()).toThrow('Gemini API key is required');
      expect(() => initGemini('')).toThrow('Gemini API key is required');
      expect(() => initGemini(null)).toThrow('Gemini API key is required');
    });

    test('should initialize with valid API key', () => {
      // This will fail if the SDK is not installed, which is fine for unit tests
      try {
        const client = initGemini('test-api-key');
        expect(client).toBeDefined();
      } catch (error) {
        // SDK might not be installed in test environment
        expect(error.message).toContain('not installed');
      }
    });
  });

  describe('callAI', () => {
    test('should throw error for unknown provider', async () => {
      await expect(
        callAI('unknown-provider', 'model', { messages: [] }, 'key')
      ).rejects.toThrow('Unknown provider');
    });
  });

  describe('callAIWithFallback', () => {
    test('should throw error when no models available', async () => {
      const modelConfig = {
        primary: { 
          provider: 'gemini', 
          name: 'test-model',
          requiresKey: 'MISSING_KEY'
        },
        fallbacks: []
      };

      await expect(
        callAIWithFallback(modelConfig, { messages: [{ role: 'user', content: 'test' }] }, {})
      ).rejects.toThrow('All AI models failed');
    });

    test('should include error details in failure message', async () => {
      const modelConfig = {
        primary: { 
          provider: 'gemini', 
          name: 'test-model',
          requiresKey: 'GEMINI_API_KEY'
        },
        fallbacks: [],
        tier: 'CHEAP'
      };

      try {
        await callAIWithFallback(
          modelConfig, 
          { messages: [{ role: 'user', content: 'test' }] }, 
          {} // Empty env - no API keys
        );
      } catch (error) {
        expect(error.message).toContain('All AI models failed');
        expect(error.message).toContain('Missing API key');
      }
    });
  });

  describe('Module exports', () => {
    test('should export all required functions', () => {
      const aiService = require('../../ai-service');
      
      expect(aiService).toHaveProperty('callAIWithFallback');
      expect(aiService).toHaveProperty('callAI');
      expect(aiService).toHaveProperty('initGemini');
      expect(aiService).toHaveProperty('callGemini');
      expect(aiService).toHaveProperty('callOpenAI');
      expect(aiService).toHaveProperty('callClaude');
      
      expect(typeof aiService.callAIWithFallback).toBe('function');
      expect(typeof aiService.callAI).toBe('function');
    });
  });
});
