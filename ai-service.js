/**
 * AI Service Layer with Multi-Provider Support and Fallback
 * 
 * Handles communication with multiple AI providers (Gemini, OpenAI, Claude)
 * with automatic fallback and error handling.
 */

// Note: Do not require provider SDKs at module load time — lazy-load inside init functions

/**
 * Initialize Gemini AI client
 * @param {string} apiKey - Gemini API key
 * @returns {object} Gemini client instance
 */
function initGemini(apiKey) {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }
  // Lazy-require the Gemini SDK to avoid import-time crashes in serverless environments
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    return new GoogleGenerativeAI(apiKey);
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') {
      throw new Error('Gemini SDK is not installed. Run: npm install @google/generative-ai');
    }
    throw err;
  }
}

/**
 * Call Gemini AI model
 * @param {object} params - Request parameters
 * @returns {Promise<string>} AI response
 */
async function callGemini(params) {
  const { model, messages, systemInstruction, apiKey } = params;
  
  const genAI = initGemini(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model: model.name });
  
  // Build conversation history
  const history = [];
  
  if (systemInstruction) {
    history.push(
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'I understand.' }] }
    );
  }
  
  // Add conversation history (all messages except the last one)
  if (messages.length > 1) {
    messages.slice(0, -1).forEach(msg => {
      history.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });
  }
  
  // Get the last message
  const lastMessage = messages[messages.length - 1];
  
  // Start chat with history
  const chat = geminiModel.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response.text();
  
  return response;
}

/**
 * Call OpenAI model (placeholder - requires openai package)
 * @param {object} params - Request parameters
 * @returns {Promise<string>} AI response
 */
async function callOpenAI(params) {
  // Note: This requires the 'openai' package to be installed
  // npm install openai
  
  try {
    const OpenAI = require('openai');
    const { model, messages, systemInstruction, apiKey } = params;
    
    const openai = new OpenAI({ apiKey });
    
    const chatMessages = [];
    
    if (systemInstruction) {
      chatMessages.push({ role: 'system', content: systemInstruction });
    }
    
    messages.forEach(msg => {
      chatMessages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    });
    
    const completion = await openai.chat.completions.create({
      model: model.name,
      messages: chatMessages,
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error('OpenAI package not installed. Run: npm install openai');
    }
    throw error;
  }
}

/**
 * Call Claude/Anthropic model (placeholder - requires @anthropic-ai/sdk package)
 * @param {object} params - Request parameters
 * @returns {Promise<string>} AI response
 */
async function callClaude(params) {
  // Note: This requires the '@anthropic-ai/sdk' package to be installed
  // npm install @anthropic-ai/sdk
  
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const { model, messages, systemInstruction, apiKey } = params;
    
    const anthropic = new Anthropic({ apiKey });
    
    const claudeMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));
    
    const message = await anthropic.messages.create({
      model: model.name,
      max_tokens: 1024,
      system: systemInstruction || undefined,
      messages: claudeMessages,
    });
    
    return message.content[0].text;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error('Anthropic package not installed. Run: npm install @anthropic-ai/sdk');
    }
    throw error;
  }
}

/**
 * Call AI model with automatic fallback
 * @param {object} modelConfig - Model configuration from ai-config.js
 * @param {object} requestParams - Request parameters (messages, systemInstruction)
 * @param {object} env - Environment variables
 * @returns {Promise<object>} AI response with metadata
 */
async function callAIWithFallback(modelConfig, requestParams, env = process.env) {
  const { primary, fallbacks } = modelConfig;
  const allModels = [primary, ...fallbacks];
  
  const errors = [];
  
  for (let i = 0; i < allModels.length; i++) {
    const model = allModels[i];
    const apiKey = env[model.requiresKey];
    
    if (!apiKey) {
      errors.push({
        model: `${model.provider}/${model.name}`,
        error: `Missing API key: ${model.requiresKey}`
      });
      continue;
    }
    
    try {
      console.log(`Attempting AI call with ${model.provider}/${model.name} (attempt ${i + 1}/${allModels.length})`);
      
      let response;
      const params = { ...requestParams, model, apiKey };
      
      switch (model.provider) {
        case 'gemini':
          response = await callGemini(params);
          break;
        case 'openai':
          response = await callOpenAI(params);
          break;
        case 'claude':
          response = await callClaude(params);
          break;
        default:
          throw new Error(`Unknown provider: ${model.provider}`);
      }
      
      console.log(`✓ Success with ${model.provider}/${model.name}`);
      
      return {
        response,
        modelUsed: {
          provider: model.provider,
          name: model.name,
          tier: modelConfig.tier,
          wasFallback: i > 0,
          attemptNumber: i + 1
        }
      };
      
    } catch (error) {
      console.error(`✗ Failed with ${model.provider}/${model.name}:`, error.message);
      errors.push({
        model: `${model.provider}/${model.name}`,
        error: error.message
      });
      
      // Continue to next model in fallback chain
      if (i < allModels.length - 1) {
        console.log(`Falling back to next model...`);
      }
    }
  }
  
  // All models failed
  throw new Error(
    `All AI models failed. Errors: ${JSON.stringify(errors, null, 2)}`
  );
}

/**
 * Simple AI call without fallback (for backwards compatibility)
 * @param {string} provider - Provider name
 * @param {string} modelName - Model name
 * @param {object} requestParams - Request parameters
 * @param {string} apiKey - API key
 * @returns {Promise<string>} AI response
 */
async function callAI(provider, modelName, requestParams, apiKey) {
  const model = { name: modelName, provider };
  const params = { ...requestParams, model, apiKey };
  
  switch (provider) {
    case 'gemini':
      return await callGemini(params);
    case 'openai':
      return await callOpenAI(params);
    case 'claude':
      return await callClaude(params);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

module.exports = {
  callAIWithFallback,
  callAI,
  initGemini,
  callGemini,
  callOpenAI,
  callClaude
};
