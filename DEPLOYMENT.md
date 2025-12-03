# Deployment Guide for 24ToolHub

This guide covers deploying 24ToolHub to Vercel and other platforms.

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All dependencies are installed (`npm install`)
- [ ] Tests pass (`npm test`)
- [ ] Verification script passes (`npm run verify`)
- [ ] Environment variables are configured
- [ ] No sensitive data in repository

## 🚀 Vercel Deployment

### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

4. **Configure Environment Variables**

In Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `OPENAI_API_KEY` | No | OpenAI fallback |
| `ANTHROPIC_API_KEY` | No | Claude fallback |
| `PAGESPEED_API_KEY` | No | PageSpeed Insights |
| `EXCHANGE_RATE_API_KEY` | No | Exchange rates |
| `APIIP_KEY` | No | IP geolocation |

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Click "Deploy"

## 🔧 Vercel Configuration

The `vercel.json` file configures:

### Functions
```json
{
  "functions": {
    "api/server.js": {
      "includeFiles": "{tools-database.json,public/*.html,...}"
    }
  }
}
```

### Headers (Security)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (HSTS)
- Content Security Policy

### Redirects
- `/index.html` → `/`
- `/blog/index.html` → `/blog/`

### Rewrites
All routes are handled by `api/server.js`

## 🌐 Custom Domain

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `24toolhub.com`)
3. Configure DNS:
   - A Record: `76.76.21.21`
   - Or CNAME: `cname.vercel-dns.com`
4. Wait for SSL certificate provisioning

## 🔍 Post-Deployment Verification

After deployment, verify:

1. **Homepage loads**: `https://your-domain.com`
2. **API endpoints work**:
   ```bash
   curl https://your-domain.com/ai-status
   ```
3. **AI chatbot responds** (test in browser)
4. **All tools function correctly**
5. **SSL certificate is valid**

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel Dashboard → Project → Analytics
- Tracks page views, web vitals, etc.

### Logs
- View in Vercel Dashboard → Project → Deployments → Logs
- Or use CLI: `vercel logs`

### Error Tracking
Consider integrating:
- Sentry
- LogRocket
- Bugsnag

## 💰 Cost Management

### AI API Costs
The system uses tiered models to minimize costs:

| Tier | Model | Input Cost | Output Cost |
|------|-------|------------|-------------|
| CHEAP | Gemini Flash 8B | $0.0375/M | $0.15/M |
| STANDARD | Gemini Flash | $0.075/M | $0.30/M |
| PREMIUM | Gemini Pro | $1.25/M | $5.00/M |

### Vercel Pricing
- **Hobby (Free)**: 100GB bandwidth, serverless functions
- **Pro ($20/mo)**: More bandwidth, team features
- **Enterprise**: Custom pricing

## 🔄 Continuous Deployment

With GitHub integration:
1. Push to `main` → Production deployment
2. Push to other branches → Preview deployment
3. Pull requests get preview URLs

### Recommended Workflow
```
feature-branch → Pull Request → Review → Merge to main → Auto-deploy
```

## 🛠️ Troubleshooting

### Common Issues

**Build fails**
```bash
# Check logs
vercel logs

# Test locally
npm run verify
```

**API not working**
- Verify environment variables are set
- Check function logs in Vercel dashboard
- Test locally with `npm start`

**CORS errors**
- Ensure your domain is in allowed origins
- Check browser console for details

**AI not responding**
- Verify `GEMINI_API_KEY` is set
- Check `/ai-status` endpoint
- Review function logs

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [Google AI Documentation](https://ai.google.dev/docs)

## 📝 Environment-Specific Configuration

### Development
```env
NODE_ENV=development
PORT=5000
```

### Production
```env
NODE_ENV=production
# Set in Vercel Dashboard
```

## 🔐 Security Best Practices

1. **Never commit `.env`** - Use `.env.example` as template
2. **Rotate API keys** regularly
3. **Use environment variables** for all secrets
4. **Enable 2FA** on Vercel account
5. **Review access permissions** for team members
