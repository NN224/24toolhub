# 24ToolHub - Vercel Deployment Guide

## Overview

24ToolHub has been optimized for production deployment on Vercel with intelligent AI cost optimization through multi-provider support and automatic fallback mechanisms.

## Key Features

### 1. **Multi-Provider AI Support**
- **Gemini** (Google): Primary provider with lowest costs
- **OpenAI** (GPT): Optional fallback provider
- **Claude** (Anthropic): Optional fallback provider

### 2. **Cost-Optimized Model Tiers**

#### CHEAP Tier (Simple Tasks)
- **gemini-1.5-flash-8b**: $0.0375/$0.15 per million tokens
- **gemini-2.0-flash-exp**: FREE during preview period ✨
- **Usage**: Chat assistant, simple queries

#### STANDARD Tier (Moderate Tasks)
- **gemini-1.5-flash**: $0.075/$0.30 per million tokens
- **gpt-4o-mini**: $0.15/$0.60 per million tokens
- **claude-3-haiku**: $0.25/$1.25 per million tokens
- **Usage**: Translation, moderate complexity tasks

#### PREMIUM Tier (Complex Tasks)
- **gemini-1.5-pro**: $1.25/$5.00 per million tokens
- **gpt-4-turbo**: $10/$30 per million tokens
- **claude-3.5-sonnet**: $3/$15 per million tokens
- **Usage**: Text summarization, code explanation, complex analysis

### 3. **Automatic Fallback System**
If the primary model fails or is unavailable:
1. Tries next cheapest model in the same tier
2. Falls back to cheaper tiers if needed
3. Logs which model was used for monitoring
4. Ensures high availability

### 4. **Modular Configuration**
All AI settings are centralized in `ai-config.js`:
- Easy to add new providers
- Simple to adjust model assignments
- Update pricing without touching business logic
- Add new endpoints with AI support

## Quick Start

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd 24toolhub
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   Server runs at `http://localhost:5000`

### Vercel Deployment

#### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add PAGESPEED_API_KEY
   # Add other API keys as needed
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Method 2: Vercel Dashboard

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add required variables:
     - `GEMINI_API_KEY` (required)
     - `PAGESPEED_API_KEY` (optional)
     - `OPENAI_API_KEY` (optional, for fallback)
     - `ANTHROPIC_API_KEY` (optional, for fallback)

3. **Deploy**
   - Vercel automatically deploys on Git push
   - Or click "Deploy" in the dashboard

## Environment Variables

### Required
- `GEMINI_API_KEY`: Google Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Optional (for enhanced features)
- `PAGESPEED_API_KEY`: Google PageSpeed Insights API key
- `OPENAI_API_KEY`: OpenAI API key (for fallback)
- `ANTHROPIC_API_KEY`: Anthropic Claude API key (for fallback)

### Development Only
- `PORT`: Local server port (default: 5000)

## API Endpoints

### Non-AI Endpoints (No API key needed)
- `GET /analyze-seo?url=<url>` - SEO analysis
- `GET /dns-lookup?domain=<domain>&recordTypes=<types>` - DNS lookup
- `GET /pagespeed?url=<url>&strategy=<mobile|desktop>` - PageSpeed test (requires PAGESPEED_API_KEY)
- `GET /ping?host=<host>` - Network ping test

### AI-Powered Endpoints
- `POST /chat` - AI Assistant (uses CHEAP tier)
  ```json
  {
    "message": "How can I optimize my website?",
    "conversationHistory": []
  }
  ```

## Cost Optimization Strategy

### Current Implementation
1. **Chat endpoint** uses CHEAP tier (Gemini Flash - FREE during preview)
2. **Automatic fallback** to next available model if primary fails
3. **Modular config** allows easy updates to model selection

### Future Optimization Ideas
1. Add request caching for repeated queries
2. Implement token usage tracking
3. Add budget limits per user/IP
4. Use smaller models for simpler queries
5. Batch requests where possible

## Customizing Model Assignment

Edit `ai-config.js` to customize which endpoints use which model tiers:

```javascript
const ENDPOINT_MODEL_MAPPING = {
  '/chat': 'CHEAP',           // Use cheapest models
  '/summarize': 'PREMIUM',    // Use high-quality models
  '/translate': 'STANDARD',   // Use balanced models
  // Add your custom endpoints here
};
```

## Adding a New AI Provider

1. **Install SDK**
   ```bash
   npm install provider-sdk
   ```

2. **Add to ai-config.js**
   ```javascript
   {
     provider: 'newprovider',
     name: 'model-name',
     costPerMillionTokens: { input: 0.10, output: 0.40 },
     maxTokens: 100000,
     requiresKey: 'NEW_PROVIDER_API_KEY'
   }
   ```

3. **Implement in ai-service.js**
   ```javascript
   async function callNewProvider(params) {
     // Implementation
   }
   ```

4. **Add to callAIWithFallback switch**
   ```javascript
   case 'newprovider':
     response = await callNewProvider(params);
     break;
   ```

## Monitoring and Debugging

### Check Which Model Was Used
The `/chat` endpoint returns `modelUsed` in the response:
```json
{
  "response": "...",
  "modelUsed": {
    "provider": "gemini",
    "name": "gemini-2.0-flash-exp",
    "tier": "CHEAP",
    "wasFallback": false,
    "attemptNumber": 1
  }
}
```

### View Logs in Vercel
1. Go to your project in Vercel Dashboard
2. Click "Deployments" → Select deployment
3. Click "Functions" → View logs
4. Check for fallback messages and errors

## Performance Considerations

### Rate Limiting
- Current: 5 messages per minute per IP (in-memory)
- **For production at scale**: Consider using:
  - Vercel KV (Redis)
  - Upstash Redis
  - External rate limiting service

### Serverless Limitations
- 30-second execution timeout (configured in vercel.json)
- Stateless execution (rate limiting resets across functions)
- Consider external storage for persistent state

### Caching
- Static assets cached by Vercel CDN
- HTML files set to no-cache for freshness
- Consider adding response caching for API endpoints

## Security

### Best Practices
1. **Never commit .env files**
2. **Use environment variables in Vercel** for all secrets
3. **Rotate API keys regularly**
4. **Monitor usage** to detect abuse
5. **Implement rate limiting** to prevent abuse

### Rate Limiting
Currently implements basic IP-based rate limiting:
- 5 requests per minute per IP
- Consider upgrading to more sophisticated limiting for production

## Troubleshooting

### "No AI models available" Error
- Ensure at least one AI API key is configured
- Check API key validity
- Verify environment variables in Vercel dashboard

### "All AI models failed" Error
- Check API key quotas and billing
- Review Vercel function logs for specific errors
- Verify network connectivity
- Check if API providers are operational

### Deployment Fails
- Verify `vercel.json` is valid JSON
- Check all dependencies are in package.json
- Ensure Node.js version compatibility
- Review build logs in Vercel dashboard

## Cost Monitoring

### Track Usage
1. **Google Cloud Console**: Monitor Gemini API usage
2. **OpenAI Dashboard**: Track token usage and costs
3. **Anthropic Console**: Monitor Claude API usage
4. **Vercel Analytics**: Track function invocations

### Set Budgets
- Google Cloud: Set budget alerts
- OpenAI: Set usage limits in dashboard
- Anthropic: Set spending limits

## Migration Checklist

- [x] Created modular AI configuration system
- [x] Implemented multi-provider support
- [x] Added automatic fallback mechanism
- [x] Created Vercel serverless configuration
- [x] Added environment variable support
- [x] Documented deployment process
- [ ] Deploy to Vercel
- [ ] Set environment variables in Vercel
- [ ] Test all endpoints in production
- [ ] Monitor costs and performance
- [ ] Set up budget alerts

## Next Steps

1. **Deploy to Vercel** using the guide above
2. **Configure environment variables** in Vercel dashboard
3. **Test the chat endpoint** to verify AI works
4. **Monitor usage** in first week
5. **Adjust model tiers** based on actual usage patterns
6. **Add new AI-powered features** as needed

## Support

For issues or questions:
1. Check Vercel function logs
2. Review this documentation
3. Check API provider status pages
4. Review configuration files

## Architecture Diagram

```
User Request → Vercel Edge → Express Server → AI Config → AI Service
                                                 ↓            ↓
                                            Model Tier    Provider
                                            Selection      Selection
                                                 ↓            ↓
                                            Primary      Try Model
                                             Model          ↓
                                                         Success? Yes → Return
                                                            ↓ No
                                                         Fallback
                                                         Models
```

## License

Same as main project license.
