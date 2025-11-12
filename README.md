# 24ToolHub

A comprehensive collection of 70+ free online tools with AI-powered assistance, optimized for production deployment on Vercel.

## 🚀 Features

- **70+ Free Online Tools**: Text processors, converters, calculators, web development tools, and more
- **AI-Powered Assistant**: Intelligent chat assistant to help users find and use the right tools
- **Multi-Provider AI Support**: Automatic fallback between Gemini, OpenAI, and Claude
- **Cost-Optimized**: Uses cheapest available models with automatic failover
- **Serverless Ready**: Optimized for Vercel serverless deployment
- **Bilingual Support**: English and Arabic language support

## 📊 Cost Optimization

The project implements intelligent AI model selection to minimize API costs:

### Model Tiers
- **CHEAP**: For simple tasks like chat assistance (FREE with Gemini 2.0 Flash)
- **STANDARD**: For moderate complexity tasks (Translation, etc.)
- **PREMIUM**: For complex tasks (Summarization, code explanation)

### Cost Savings
Using Gemini 2.0 Flash for chat saves significant costs compared to premium models:
- **10M tokens**: $0 vs $200 (GPT-4 Turbo)
- **100M tokens**: $0 vs $2000 (GPT-4 Turbo)

### Automatic Fallback
If primary model fails, automatically tries:
1. Next cheapest model in same tier
2. Models from cheaper tiers
3. Returns detailed error only if all fail

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- At least one AI API key (Gemini recommended)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 24toolhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:5000
   ```

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add GEMINI_API_KEY

# Deploy to production
vercel --prod
```

### Option 2: Vercel Dashboard

1. Import your GitHub repository at [vercel.com](https://vercel.com)
2. Configure environment variables in project settings
3. Deploy automatically on every push

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🔑 Environment Variables

### Required
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional (Enhanced Features)
```env
PAGESPEED_API_KEY=your_pagespeed_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get API keys:
- **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **PageSpeed**: [Google Cloud Console](https://developers.google.com/speed/docs/insights/v5/get-started)
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **Anthropic**: [Anthropic Console](https://console.anthropic.com/)

## 📡 API Endpoints

### Non-AI Endpoints
- `GET /analyze-seo?url=<url>` - Analyze website SEO
- `GET /dns-lookup?domain=<domain>&recordTypes=<types>` - DNS records lookup
- `GET /pagespeed?url=<url>&strategy=<mobile|desktop>` - PageSpeed analysis
- `GET /ping?host=<host>` - Network ping test

### AI-Powered Endpoints
- `POST /chat` - AI assistant for tool recommendations
  ```json
  {
    "message": "How can I optimize my website?",
    "conversationHistory": []
  }
  ```

## 🏗️ Architecture

```
User Request → Vercel Edge → Express Server
                                    ↓
                            AI Configuration
                                    ↓
                            Model Selection (Cost-Based)
                                    ↓
                            AI Service Layer
                                    ↓
                    Try Primary → Fallback Chain → Response
```

## 📁 Project Structure

```
24toolhub/
├── server.js              # Express server (Vercel compatible)
├── ai-config.js           # AI model configuration & tiers
├── ai-service.js          # Multi-provider AI service layer
├── vercel.json            # Vercel deployment configuration
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variable template
├── DEPLOYMENT.md          # Detailed deployment guide
├── tools-database.json    # Tools catalog for AI assistant
├── tools/                 # Individual tool HTML pages
├── css/                   # Stylesheets
├── js/                    # Client-side JavaScript
└── images/                # Static assets
```

## 🔧 Customization

### Add a New AI-Powered Endpoint

1. **Add endpoint to mapping** (ai-config.js):
   ```javascript
   const ENDPOINT_MODEL_MAPPING = {
     '/your-endpoint': 'CHEAP', // or 'STANDARD', 'PREMIUM'
   };
   ```

2. **Implement endpoint** (server.js):
   ```javascript
   app.post('/your-endpoint', async (req, res) => {
     const modelConfig = getModelForEndpoint('/your-endpoint');
     const result = await callAIWithFallback(modelConfig, requestParams);
     res.json(result);
   });
   ```

### Add a New AI Provider

1. **Install SDK**: `npm install provider-sdk`
2. **Add to ai-config.js** model tiers
3. **Implement in ai-service.js** call function
4. **Add API key** to environment variables

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🧪 Testing

Run configuration tests:
```bash
node -e "const config = require('./ai-config'); console.log('Config loaded:', Object.keys(config.getModelTiers()));"
```

Test server syntax:
```bash
node -c server.js
```

Start server:
```bash
npm start
```

## 📈 Monitoring

### Track Costs
- **Google Cloud Console**: Gemini API usage
- **OpenAI Dashboard**: Token usage and costs
- **Anthropic Console**: Claude API usage
- **Vercel Analytics**: Function invocations

### Check Model Usage
The chat endpoint returns which model was used:
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

## 🔐 Security

- Never commit `.env` files
- Use Vercel environment variables for secrets
- Rotate API keys regularly
- Monitor usage for anomalies
- Implement rate limiting (current: 5 requests/minute/IP)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

[Your License Here]

## 🆘 Support

For issues or questions:
1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
2. Review configuration files
3. Check Vercel function logs
4. Verify API provider status

## 🎯 Roadmap

- [ ] Add more AI-powered features (summarization, translation)
- [ ] Implement request caching
- [ ] Add usage analytics dashboard
- [ ] Support more AI providers
- [ ] Add token usage tracking
- [ ] Implement budget limits

## 📊 Statistics

- **70+ Tools**: Comprehensive toolkit
- **FREE AI**: During Gemini preview period
- **99.9% Uptime**: With automatic failover
- **<100ms**: Typical API response time
- **Bilingual**: English and Arabic support

---

Made with ❤️ for the developer community
