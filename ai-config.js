/**
 * AI Model Configuration and Fallback System
 * 
 * This module manages multiple AI providers with cost-optimized model selection
 * and automatic fallback mechanisms.
 */

// Model tier definitions with providers and pricing
const MODEL_TIERS = {
  CHEAP: {
    priority: 1,
    description: 'Low-cost models for simple tasks',
    models: [
      {
        provider: 'gemini',
        name: 'gemini-1.5-flash-8b',
        costPerMillionTokens: { input: 0.0375, output: 0.15 },
        maxTokens: 1000000,
        requiresKey: 'GEMINI_API_KEY'
      },
      {
        provider: 'gemini',
        name: 'gemini-2.0-flash-exp',
        costPerMillionTokens: { input: 0, output: 0 }, // Free during preview
        maxTokens: 1000000,
        requiresKey: 'GEMINI_API_KEY'
      }
    ]
  },
  STANDARD: {
    priority: 2,
    description: 'Balanced models for moderate tasks',
    models: [
      {
        provider: 'gemini',
        name: 'gemini-1.5-flash',
        costPerMillionTokens: { input: 0.075, output: 0.30 },
        maxTokens: 1000000,
        requiresKey: 'GEMINI_API_KEY'
      },
      {
        provider: 'openai',
        name: 'gpt-4o-mini',
        costPerMillionTokens: { input: 0.15, output: 0.60 },
        maxTokens: 128000,
        requiresKey: 'OPENAI_API_KEY'
      },
      {
        provider: 'claude',
        name: 'claude-3-haiku-20240307',
        costPerMillionTokens: { input: 0.25, output: 1.25 },
        maxTokens: 200000,
        requiresKey: 'ANTHROPIC_API_KEY'
      }
    ]
  },
  PREMIUM: {
    priority: 3,
    description: 'High-quality models for complex tasks',
    models: [
      {
        provider: 'gemini',
        name: 'gemini-1.5-pro',
        costPerMillionTokens: { input: 1.25, output: 5.00 },
        maxTokens: 2000000,
        requiresKey: 'GEMINI_API_KEY'
      },
      {
        provider: 'openai',
        name: 'gpt-4-turbo',
        costPerMillionTokens: { input: 10, output: 30 },
        maxTokens: 128000,
        requiresKey: 'OPENAI_API_KEY'
      },
      {
        provider: 'claude',
        name: 'claude-3-5-sonnet-20241022',
        costPerMillionTokens: { input: 3, output: 15 },
        maxTokens: 200000,
        requiresKey: 'ANTHROPIC_API_KEY'
      }
    ]
  }
};

// Endpoint to model tier mapping
const ENDPOINT_MODEL_MAPPING = {
  '/chat': 'CHEAP',           // AI Assistant - simple conversational tasks
  '/analyze-seo': null,       // No AI needed
  '/dns-lookup': null,        // No AI needed
  '/pagespeed': null,         // No AI needed
  '/ping': null,              // No AI needed
  '/summarize': 'PREMIUM',    // Text summarization - complex task (future)
  '/translate': 'STANDARD',   // Translation - moderate task (future)
  '/code-explain': 'PREMIUM'  // Code explanation - complex task (future)
};

/**
 * Get available models for a specific tier
 * @param {string} tier - Model tier (CHEAP, STANDARD, PREMIUM)
 * @param {object} env - Environment variables
 * @returns {Array} Available models with credentials
 */
function getAvailableModels(tier, env = process.env) {
  const tierConfig = MODEL_TIERS[tier];
  if (!tierConfig) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  return tierConfig.models.filter(model => {
    // Check if required API key is available
    return env[model.requiresKey] && env[model.requiresKey].length > 0;
  }).sort((a, b) => {
    // Sort by cost (cheaper first)
    const costA = a.costPerMillionTokens.input + a.costPerMillionTokens.output;
    const costB = b.costPerMillionTokens.input + b.costPerMillionTokens.output;
    return costA - costB;
  });
}

/**
 * Get the best available model for an endpoint with fallback support
 * @param {string} endpoint - API endpoint path
 * @param {object} env - Environment variables
 * @returns {object} Model configuration with fallback chain
 */
function getModelForEndpoint(endpoint, env = process.env) {
  const tier = ENDPOINT_MODEL_MAPPING[endpoint];
  
  if (!tier) {
    return null; // No AI model needed for this endpoint
  }

  // Get models for the requested tier
  const primaryModels = getAvailableModels(tier, env);
  
  // Build fallback chain: try cheaper tiers if primary fails
  const fallbackChain = [];
  
  // Add primary tier models
  if (primaryModels.length > 0) {
    fallbackChain.push(...primaryModels);
  }
  
  // Add fallback tiers (cheaper options)
  const tierOrder = ['CHEAP', 'STANDARD', 'PREMIUM'];
  const currentTierIndex = tierOrder.indexOf(tier);
  
  for (let i = 0; i < tierOrder.length; i++) {
    if (i !== currentTierIndex) {
      const fallbackTier = tierOrder[i];
      const fallbackModels = getAvailableModels(fallbackTier, env);
      
      // Add models that aren't already in the chain
      fallbackModels.forEach(model => {
        const modelKey = `${model.provider}-${model.name}`;
        const alreadyExists = fallbackChain.some(
          m => `${m.provider}-${m.name}` === modelKey
        );
        if (!alreadyExists) {
          fallbackChain.push(model);
        }
      });
    }
  }
  
  if (fallbackChain.length === 0) {
    throw new Error(`No AI models available for endpoint ${endpoint}. Please configure API keys.`);
  }
  
  return {
    primary: fallbackChain[0],
    fallbacks: fallbackChain.slice(1),
    tier: tier,
    endpoint: endpoint
  };
}

/**
 * Get all configured model tiers
 * @returns {object} Model tier configurations
 */
function getModelTiers() {
  return MODEL_TIERS;
}

/**
 * Get endpoint mappings
 * @returns {object} Endpoint to tier mappings
 */
function getEndpointMappings() {
  return ENDPOINT_MODEL_MAPPING;
}

module.exports = {
  getModelForEndpoint,
  getAvailableModels,
  getModelTiers,
  getEndpointMappings,
  MODEL_TIERS
};
