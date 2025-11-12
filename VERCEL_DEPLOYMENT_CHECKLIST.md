# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

### 1. API Keys Ready
- [ ] Google Gemini API key obtained from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] (Optional) PageSpeed API key from [Google Cloud Console](https://developers.google.com/speed/docs/insights/v5/get-started)
- [ ] (Optional) OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- [ ] (Optional) Anthropic API key from [Anthropic Console](https://console.anthropic.com/)

### 2. Local Testing
- [ ] Run `npm install` successfully
- [ ] Create `.env` file with API keys
- [ ] Run `npm start` and verify server starts
- [ ] Test `/chat` endpoint works with your API key
- [ ] Verify no console errors

### 3. Code Review
- [ ] Review all changes in git
- [ ] Ensure `.env` is NOT committed (only `.env.example`)
- [ ] Verify `vercel.json` configuration
- [ ] Check `ai-config.js` model mappings are correct

## Deployment Steps

### Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```
   - [ ] Vercel CLI installed

2. **Login to Vercel**
   ```bash
   vercel login
   ```
   - [ ] Logged in successfully

3. **Initial Deployment**
   ```bash
   vercel
   ```
   - [ ] Project created on Vercel
   - [ ] Preview deployment successful
   - [ ] Preview URL works

4. **Configure Environment Variables**
   ```bash
   vercel env add GEMINI_API_KEY production
   vercel env add PAGESPEED_API_KEY production
   # Add other keys as needed
   ```
   - [ ] GEMINI_API_KEY added
   - [ ] PAGESPEED_API_KEY added (if applicable)
   - [ ] OPENAI_API_KEY added (if applicable)
   - [ ] ANTHROPIC_API_KEY added (if applicable)

5. **Production Deployment**
   ```bash
   vercel --prod
   ```
   - [ ] Production deployment successful
   - [ ] Production URL received

### Via Vercel Dashboard

1. **Import Repository**
   - [ ] Go to [vercel.com](https://vercel.com)
   - [ ] Click "New Project"
   - [ ] Import your Git repository
   - [ ] Project imported successfully

2. **Configure Build Settings**
   - [ ] Framework Preset: Other (or Auto-detect)
   - [ ] Build Command: (leave empty)
   - [ ] Output Directory: (leave empty)
   - [ ] Install Command: npm install

3. **Add Environment Variables**
   Go to: Project Settings → Environment Variables
   - [ ] Add `GEMINI_API_KEY` (Production, Preview, Development)
   - [ ] Add `PAGESPEED_API_KEY` (if applicable)
   - [ ] Add `OPENAI_API_KEY` (if applicable)
   - [ ] Add `ANTHROPIC_API_KEY` (if applicable)

4. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Deployment successful
   - [ ] Site is live

## Post-Deployment Verification

### 1. Test Static Pages
- [ ] Visit production URL
- [ ] Homepage loads correctly
- [ ] Tools pages load correctly
- [ ] CSS and images load properly
- [ ] No 404 errors in browser console

### 2. Test API Endpoints

**Non-AI Endpoints:**
- [ ] Test `/analyze-seo?url=https://example.com`
- [ ] Test `/dns-lookup?domain=google.com&recordTypes=A`
- [ ] Test `/pagespeed?url=https://example.com` (if key configured)
- [ ] Test `/ping?host=google.com`

**AI Endpoints:**
- [ ] Test `/chat` endpoint with a simple message
- [ ] Verify AI response is received
- [ ] Check `modelUsed` in response shows correct model
- [ ] Verify no errors in Vercel logs

### 3. Check Vercel Logs
- [ ] Go to Vercel Dashboard → Your Project → Functions
- [ ] Check logs for any errors
- [ ] Verify AI model selection is working
- [ ] No "Missing API key" errors

### 4. Monitor Performance
- [ ] Check function execution time (should be <5s for chat)
- [ ] Verify no timeout errors
- [ ] Test from different regions if possible

## Cost Monitoring Setup

### 1. Google Cloud (Gemini)
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Navigate to Billing → Budgets & alerts
- [ ] Create budget alert for Gemini API
- [ ] Set threshold (e.g., $10, $50, $100)

### 2. OpenAI (if using)
- [ ] Go to [OpenAI Dashboard](https://platform.openai.com/)
- [ ] Navigate to Settings → Usage limits
- [ ] Set monthly usage limit
- [ ] Configure email alerts

### 3. Anthropic (if using)
- [ ] Go to [Anthropic Console](https://console.anthropic.com/)
- [ ] Navigate to Billing
- [ ] Set spending limits
- [ ] Configure alerts

### 4. Vercel
- [ ] Go to Vercel Dashboard → Your Project → Analytics
- [ ] Enable Analytics (if on Pro plan)
- [ ] Monitor function invocations
- [ ] Set up bandwidth alerts

## Troubleshooting

### "No AI models available" Error
- [ ] Verify API keys are set in Vercel environment variables
- [ ] Check API key format (no extra spaces, correct value)
- [ ] Redeploy after adding environment variables
- [ ] Check Vercel logs for specific error messages

### "All AI models failed" Error
- [ ] Check API key validity and billing status
- [ ] Verify API quota hasn't been exceeded
- [ ] Check provider service status pages
- [ ] Review Vercel function logs for detailed errors

### Deployment Fails
- [ ] Check Vercel build logs
- [ ] Verify all dependencies in package.json
- [ ] Ensure Node.js version compatibility
- [ ] Check for syntax errors in code

### Rate Limiting Issues
- [ ] Current: 5 requests/minute/IP
- [ ] Consider upgrading to external rate limiting for production
- [ ] Options: Vercel KV, Upstash Redis, or custom solution

## Optimization Checklist

After deployment, consider these optimizations:

### Performance
- [ ] Enable Vercel Analytics
- [ ] Monitor function execution times
- [ ] Consider caching for repeated queries
- [ ] Optimize images and static assets

### Cost
- [ ] Monitor AI API usage weekly
- [ ] Review model selection strategy
- [ ] Implement request caching if needed
- [ ] Set up budget alerts

### Security
- [ ] Review rate limiting effectiveness
- [ ] Monitor for unusual traffic patterns
- [ ] Rotate API keys regularly (quarterly)
- [ ] Keep dependencies updated

### Reliability
- [ ] Test fallback chain periodically
- [ ] Monitor error rates
- [ ] Set up uptime monitoring
- [ ] Have rollback plan ready

## Success Criteria

Your deployment is successful when:
- [ ] All static pages load correctly
- [ ] Non-AI endpoints return expected data
- [ ] Chat endpoint responds with AI-generated content
- [ ] `modelUsed` shows correct model selection
- [ ] No errors in Vercel function logs
- [ ] Response times are acceptable (<5s for AI)
- [ ] Cost monitoring is set up
- [ ] Backup API keys configured (for fallback)

## Documentation

- [ ] Update project README with production URL
- [ ] Document any custom configuration
- [ ] Share API usage guidelines with team
- [ ] Set up alerting for budget overruns

## Next Steps

After successful deployment:
1. Monitor costs for first week
2. Adjust model selection based on usage patterns
3. Consider adding more AI-powered features
4. Implement caching if needed
5. Gather user feedback
6. Plan for scaling

---

**Questions or Issues?**
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
- Review Vercel documentation
- Check provider status pages
- Review function logs in Vercel dashboard

**Last Updated:** [Current Date]
**Checklist Version:** 1.0
