# 24ToolHub

A comprehensive collection of 37+ free online tools for developers, designers, and content creators.

## 🚀 Features

- **Text Tools**: JSON Formatter, Base64 Encoder/Decoder, Markdown to HTML, etc.
- **Image Tools**: Image Compressor, Resizer, Format Converter
- **Developer Tools**: Code Formatter, CSS/JS Minifier, API Tester
- **SEO Tools**: SEO Analyzer, DNS Lookup, PageSpeed Insights
- **Security Tools**: Password Generator, Hash Generators, JWT Decoder
- **Calculators**: BMI Calculator, Loan Calculator, Unit Converters
- **AI Assistant**: Intelligent chatbot powered by Gemini AI

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- API Keys (see Configuration)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/NN224/24toolhub.git
cd 24toolhub
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your API keys in `.env` (see Configuration section)

5. Start the development server:
```bash
npm start
```

6. Open http://localhost:5000 in your browser

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure the following variables:

### Required
- `GEMINI_API_KEY` - Google Gemini API key for AI chatbot

### Optional
- `OPENAI_API_KEY` - OpenAI API key (fallback)
- `ANTHROPIC_API_KEY` - Anthropic Claude API key (fallback)
- `PAGESPEED_API_KEY` - Google PageSpeed Insights API key
- `EXCHANGE_RATE_API_KEY` - Exchange rate API key
- `APIIP_KEY` - IP geolocation API key

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:backend
npm run test:frontend
npm run test:integration
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configure environment variables in Vercel dashboard

## 📁 Project Structure

```
24toolhub/
├── api/
│   └── server.js       # Express API server
├── blog/               # Blog articles (HTML)
├── css/                # Stylesheets
├── images/             # Static images
├── js/                 # Frontend JavaScript
├── public/             # Static pages (about, contact, etc.)
├── tools/              # Individual tool pages
├── ai-config.js        # AI model configuration
├── ai-service.js       # AI service layer
├── server.js           # Server entry point
├── tools-database.json # Tools metadata
└── vercel.json         # Vercel configuration
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm test` | Run test suite |
| `npm run verify` | Verify deployment readiness |
| `npm run check-links` | Check external links |

## 🤖 AI System

The project uses a multi-provider AI system with automatic fallback:

1. **Primary**: Gemini Flash 8B (cost-effective)
2. **Fallback 1**: Gemini Flash
3. **Fallback 2**: OpenAI GPT-4o Mini
4. **Fallback 3**: Claude Haiku

Configure API keys for providers you want to use.

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | AI chatbot |
| `/analyze-seo` | GET | SEO analysis |
| `/dns-lookup` | GET | DNS records lookup |
| `/ip-info` | GET | IP geolocation |
| `/pagespeed` | GET | PageSpeed Insights |
| `/ping` | GET | Ping test |
| `/exchange-rates` | GET | Currency exchange rates |
| `/ai-status` | GET | AI availability status |

## 🔒 Security

- CORS configured for specific origins in production
- Environment variables for sensitive data
- Content Security Policy headers
- HTTPS enforced in production

## 📄 License

ISC License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Contact

For questions or support, please open an issue on GitHub.
