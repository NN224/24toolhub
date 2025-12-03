/**
 * AI Configuration Tests
 * Tests for the AI model configuration system
 */

const { 
  getModelForEndpoint, 
  getAvailableModels, 
  getModelTiers,
  getEndpointMappings,
  MODEL_TIERS 
} = require('../../ai-config');

describe('AI Configuration', () => {
  describe('MODEL_TIERS', () => {
    test('should have CHEAP, STANDARD, and PREMIUM tiers', () => {
      expect(MODEL_TIERS).toHaveProperty('CHEAP');
      expect(MODEL_TIERS).toHaveProperty('STANDARD');
      expect(MODEL_TIERS).toHaveProperty('PREMIUM');
    });

    test('each tier should have models array', () => {
      Object.values(MODEL_TIERS).forEach(tier => {
        expect(tier).toHaveProperty('models');
        expect(Array.isArray(tier.models)).toBe(true);
        expect(tier.models.length).toBeGreaterThan(0);
      });
    });

    test('each model should have required properties', () => {
      Object.values(MODEL_TIERS).forEach(tier => {
        tier.models.forEach(model => {
          expect(model).toHaveProperty('provider');
          expect(model).toHaveProperty('name');
          expect(model).toHaveProperty('costPerMillionTokens');
          expect(model).toHaveProperty('maxTokens');
          expect(model).toHaveProperty('requiresKey');
        });
      });
    });
  });

  describe('getModelTiers', () => {
    test('should return all model tiers', () => {
      const tiers = getModelTiers();
      expect(Object.keys(tiers)).toEqual(['CHEAP', 'STANDARD', 'PREMIUM']);
    });
  });

  describe('getEndpointMappings', () => {
    test('should return endpoint mappings', () => {
      const mappings = getEndpointMappings();
      expect(mappings).toHaveProperty('/chat');
      expect(mappings['/chat']).toBe('CHEAP');
    });

    test('should have null for non-AI endpoints', () => {
      const mappings = getEndpointMappings();
      expect(mappings['/dns-lookup']).toBeNull();
      expect(mappings['/ping']).toBeNull();
    });
  });

  describe('getAvailableModels', () => {
    test('should return empty array when no API keys configured', () => {
      const models = getAvailableModels('CHEAP', {});
      expect(models).toEqual([]);
    });

    test('should return models when API key is configured', () => {
      const models = getAvailableModels('CHEAP', { GEMINI_API_KEY: 'test-key' });
      expect(models.length).toBeGreaterThan(0);
      expect(models[0].provider).toBe('gemini');
    });

    test('should throw error for invalid tier', () => {
      expect(() => getAvailableModels('INVALID', {})).toThrow();
    });

    test('should sort models by cost', () => {
      const models = getAvailableModels('STANDARD', { 
        GEMINI_API_KEY: 'test-key',
        OPENAI_API_KEY: 'test-key',
        ANTHROPIC_API_KEY: 'test-key'
      });
      
      if (models.length >= 2) {
        const cost1 = models[0].costPerMillionTokens.input + models[0].costPerMillionTokens.output;
        const cost2 = models[1].costPerMillionTokens.input + models[1].costPerMillionTokens.output;
        expect(cost1).toBeLessThanOrEqual(cost2);
      }
    });
  });

  describe('getModelForEndpoint', () => {
    test('should return null for non-AI endpoints', () => {
      const config = getModelForEndpoint('/dns-lookup', {});
      expect(config).toBeNull();
    });

    test('should throw error when no API keys available', () => {
      expect(() => getModelForEndpoint('/chat', {})).toThrow();
    });

    test('should return primary and fallbacks when configured', () => {
      const config = getModelForEndpoint('/chat', { GEMINI_API_KEY: 'test-key' });
      
      expect(config).toHaveProperty('primary');
      expect(config).toHaveProperty('fallbacks');
      expect(config).toHaveProperty('tier');
      expect(config).toHaveProperty('endpoint');
      expect(config.tier).toBe('CHEAP');
      expect(config.endpoint).toBe('/chat');
    });

    test('should include fallbacks from other tiers', () => {
      const config = getModelForEndpoint('/chat', { 
        GEMINI_API_KEY: 'test-key'
      });
      
      // Primary + fallbacks should have models from the tier
      expect(config.primary).toBeDefined();
      expect(Array.isArray(config.fallbacks)).toBe(true);
    });
  });
});
