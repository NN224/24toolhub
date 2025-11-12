/**
 * AI Configuration Module Tests
 * Tests model tier selection and fallback logic
 */

const aiConfig = require('../../ai-config.js');

describe('AI Configuration Tests', () => {
  
  // ===================================================
  // Model Tier Tests
  // ===================================================
  describe('Model Tiers', () => {
    test('Should have all required model tiers', () => {
      const tiers = aiConfig.getModelTiers();
      
      expect(tiers).toHaveProperty('CHEAP');
      expect(tiers).toHaveProperty('STANDARD');
      expect(tiers).toHaveProperty('PREMIUM');
    });

    test('CHEAP tier should have models', () => {
      const tiers = aiConfig.getModelTiers();
      const cheapTier = tiers.CHEAP;
      
      expect(cheapTier).toHaveProperty('models');
      expect(Array.isArray(cheapTier.models)).toBe(true);
      expect(cheapTier.models.length).toBeGreaterThan(0);
      
      // Check model structure
      const model = cheapTier.models[0];
      expect(model).toHaveProperty('provider');
      expect(model).toHaveProperty('name');
      expect(model).toHaveProperty('costPerMillionTokens');
      expect(model).toHaveProperty('requiresKey');
    });

    test('All models should have required properties', () => {
      const tiers = aiConfig.getModelTiers();
      
      Object.values(tiers).forEach(tier => {
        tier.models.forEach(model => {
          expect(model).toHaveProperty('provider');
          expect(model).toHaveProperty('name');
          expect(model).toHaveProperty('costPerMillionTokens');
          expect(model.costPerMillionTokens).toHaveProperty('input');
          expect(model.costPerMillionTokens).toHaveProperty('output');
          expect(model).toHaveProperty('maxTokens');
          expect(model).toHaveProperty('requiresKey');
          
          expect(typeof model.provider).toBe('string');
          expect(typeof model.name).toBe('string');
          expect(typeof model.maxTokens).toBe('number');
          expect(typeof model.requiresKey).toBe('string');
        });
      });
    });
  });

  // ===================================================
  // Endpoint Mapping Tests
  // ===================================================
  describe('Endpoint Mappings', () => {
    test('Should have endpoint mappings', () => {
      const mappings = aiConfig.getEndpointMappings();
      
      expect(mappings).toBeDefined();
      expect(typeof mappings).toBe('object');
    });

    test('Chat endpoint should be mapped to CHEAP tier', () => {
      const mappings = aiConfig.getEndpointMappings();
      
      expect(mappings).toHaveProperty('/chat');
      expect(mappings['/chat']).toBe('CHEAP');
    });

    test('Non-AI endpoints should be null', () => {
      const mappings = aiConfig.getEndpointMappings();
      
      expect(mappings['/analyze-seo']).toBeNull();
      expect(mappings['/dns-lookup']).toBeNull();
      expect(mappings['/pagespeed']).toBeNull();
    });
  });

  // ===================================================
  // Available Models Tests
  // ===================================================
  describe('Available Models', () => {
    test('Should return empty array when no API keys available', () => {
      const env = {}; // No API keys
      const models = aiConfig.getAvailableModels('CHEAP', env);
      
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(0);
    });

    test('Should return models when API key is available', () => {
      const env = {
        GEMINI_API_KEY: 'test-key'
      };
      const models = aiConfig.getAvailableModels('CHEAP', env);
      
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      
      // Should return Gemini models
      const hasGemini = models.some(m => m.provider === 'gemini');
      expect(hasGemini).toBe(true);
    });

    test('Should filter models by available API keys', () => {
      const env = {
        OPENAI_API_KEY: 'test-openai-key'
      };
      const models = aiConfig.getAvailableModels('STANDARD', env);
      
      expect(Array.isArray(models)).toBe(true);
      
      // Should only return OpenAI models
      const allOpenAI = models.every(m => m.requiresKey === 'OPENAI_API_KEY');
      expect(allOpenAI).toBe(true);
    });

    test('Should sort models by cost (cheapest first)', () => {
      const env = {
        GEMINI_API_KEY: 'test-key',
        OPENAI_API_KEY: 'test-key',
        ANTHROPIC_API_KEY: 'test-key'
      };
      const models = aiConfig.getAvailableModels('STANDARD', env);
      
      if (models.length > 1) {
        for (let i = 0; i < models.length - 1; i++) {
          const costA = models[i].costPerMillionTokens.input + models[i].costPerMillionTokens.output;
          const costB = models[i + 1].costPerMillionTokens.input + models[i + 1].costPerMillionTokens.output;
          expect(costA).toBeLessThanOrEqual(costB);
        }
      }
    });

    test('Should throw error for invalid tier', () => {
      expect(() => {
        aiConfig.getAvailableModels('INVALID_TIER', {});
      }).toThrow('Invalid tier');
    });
  });

  // ===================================================
  // Model for Endpoint Tests
  // ===================================================
  describe('Model for Endpoint', () => {
    test('Should return null for endpoints that do not need AI', () => {
      const result = aiConfig.getModelForEndpoint('/analyze-seo');
      expect(result).toBeNull();
      
      const result2 = aiConfig.getModelForEndpoint('/dns-lookup');
      expect(result2).toBeNull();
    });

    test('Should throw error when no API keys are available', () => {
      const env = {}; // No API keys
      
      expect(() => {
        aiConfig.getModelForEndpoint('/chat', env);
      }).toThrow('No AI models available');
    });

    test('Should return primary and fallback models for chat endpoint', () => {
      const env = {
        GEMINI_API_KEY: 'test-key'
      };
      
      const result = aiConfig.getModelForEndpoint('/chat', env);
      
      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('fallbacks');
      expect(result).toHaveProperty('tier');
      expect(result).toHaveProperty('endpoint');
      
      expect(result.endpoint).toBe('/chat');
      expect(result.tier).toBe('CHEAP');
      expect(result.primary.provider).toBe('gemini');
      expect(Array.isArray(result.fallbacks)).toBe(true);
    });

    test('Should build fallback chain with multiple providers', () => {
      const env = {
        GEMINI_API_KEY: 'test-gemini',
        OPENAI_API_KEY: 'test-openai',
        ANTHROPIC_API_KEY: 'test-anthropic'
      };
      
      const result = aiConfig.getModelForEndpoint('/chat', env);
      
      expect(result.primary).toBeDefined();
      expect(result.fallbacks.length).toBeGreaterThan(0);
      
      // Primary should be Gemini (cheapest for CHEAP tier)
      expect(result.primary.provider).toBe('gemini');
    });

    test('Should not duplicate models in fallback chain', () => {
      const env = {
        GEMINI_API_KEY: 'test-key',
        OPENAI_API_KEY: 'test-key'
      };
      
      const result = aiConfig.getModelForEndpoint('/chat', env);
      
      const allModels = [result.primary, ...result.fallbacks];
      const modelKeys = allModels.map(m => `${m.provider}-${m.name}`);
      const uniqueKeys = new Set(modelKeys);
      
      expect(modelKeys.length).toBe(uniqueKeys.size);
    });
  });

  // ===================================================
  // Cost Optimization Tests
  // ===================================================
  describe('Cost Optimization', () => {
    test('CHEAP tier should use free or low-cost models', () => {
      const tiers = aiConfig.getModelTiers();
      const cheapModels = tiers.CHEAP.models;
      
      cheapModels.forEach(model => {
        const totalCost = model.costPerMillionTokens.input + model.costPerMillionTokens.output;
        // CHEAP tier should be under $1 per million tokens
        expect(totalCost).toBeLessThan(1.0);
      });
    });

    test('PREMIUM tier should have higher cost models', () => {
      const tiers = aiConfig.getModelTiers();
      const premiumModels = tiers.PREMIUM.models;
      
      premiumModels.forEach(model => {
        const totalCost = model.costPerMillionTokens.input + model.costPerMillionTokens.output;
        // PREMIUM tier should be more expensive
        expect(totalCost).toBeGreaterThan(1.0);
      });
    });
  });
});
