# External Links Checker

This repository includes automated tools to validate all external links in HTML and Markdown files.

## Overview

The link checker helps ensure that all external references (documentation, APIs, CDNs, etc.) are valid and accessible. It scans through all HTML and Markdown files, extracts external URLs, and validates them by making HTTP requests.

## Features

- 🔍 **Automatic Discovery**: Scans all HTML and Markdown files in the repository
- 🌐 **Smart Filtering**: Skips internal links, placeholder URLs, and dynamic share links
- 🚀 **Batch Processing**: Checks links in batches to avoid overwhelming servers
- ⚡ **Multiple Methods**: Tries HEAD requests first, falls back to GET if needed
- 📊 **Detailed Reporting**: Shows status codes and error messages for each link
- 🔄 **CI/CD Friendly**: Handles environments without internet access gracefully

## Usage

### Option 1: Run as npm script (Recommended)

```bash
# Check all external links
npm run check-links

# Run as part of test suite
npm run test:links
```

### Option 2: Run standalone script

```bash
# Direct execution
node check-external-links.js

# Or if executable
./check-external-links.js
```

### Option 3: Run with npm test

```bash
# Run all tests (includes link checker)
npm test

# Run only integration tests (includes link checker)
npm run test:integration
```

## Configuration

### Links to Skip

The checker automatically skips certain types of links:

#### Internal Links
- `http://localhost:*` - Local development URLs
- `https://24toolhub.com/*` - Project's own URLs

#### Dynamic/Placeholder Links
- Google Analytics and Tag Manager scripts
- Social media share buttons (Twitter, Facebook, LinkedIn, WhatsApp)
- Example/placeholder URLs (e.g., `https://example.com`)
- YouTube example videos
- Testing API endpoints (httpbin, jsonplaceholder, etc.)

### Customizing Skip List

To add more links to skip, edit the `SKIP_LINKS` array in:
- `__tests__/integration/external-links.test.js` (for tests)
- `check-external-links.js` (for standalone script)

Example:
```javascript
const SKIP_LINKS = [
  'https://example-to-skip.com',
  // ... other links
];
```

## Output Examples

### Successful Check

```
🔍 External Links Checker

Scanning repository for external links...

Found 45 HTML files and 8 Markdown files

Found 127 total unique links
Checking 18 external links (skipped 109 internal/placeholder links)

📊 Results:

✅ https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js (HTTP 200)
✅ https://vercel.com (HTTP 200)
✅ https://makersuite.google.com/app/apikey (HTTP 200)
...

============================================================
Summary: 18/18 links accessible
============================================================

✅ All external links are accessible!
```

### Failed Links

```
❌ https://broken-link.com
   Error: HTTP 404

❌ https://timeout-link.com
   Error: Timeout

============================================================
Summary: 16/18 links accessible
============================================================

❌ Failed Links Summary:
  - https://broken-link.com
    HTTP 404
  - https://timeout-link.com
    Timeout
```

## Integration with CI/CD

The test version (`npm run test:links`) is designed to work in CI/CD environments:

1. **With Internet Access**: Tests external links and reports failures
2. **Without Internet Access**: Detects network errors and passes gracefully while listing all links for manual verification

Example GitHub Actions workflow:

```yaml
name: Check Links

on: [push, pull_request]

jobs:
  check-links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Check external links
        run: npm run check-links
```

## Checked Link Types

The checker validates:

1. **CDN Links**: jsdelivr, cdnjs, etc.
2. **Documentation**: API documentation, guides, tutorials
3. **External Services**: Vercel, OpenAI, Google Cloud, Anthropic, etc.
4. **Libraries**: GitHub repositories, npm packages
5. **Reference Sites**: schema.org, MDN, W3C, etc.

## Link Extraction

### From HTML Files

Extracts URLs from:
- `<a href="...">` - Hyperlinks
- `<link href="...">` - Stylesheets, favicons
- `<script src="...">` - JavaScript files
- `<img src="...">` - Images
- `<iframe src="...">` - Embedded content

### From Markdown Files

Extracts URLs from:
- `[text](url)` - Markdown links
- Plain URLs in text

## Timeouts and Rate Limiting

- **Timeout**: 10 seconds per link
- **Batch Size**: 5 links checked concurrently
- **Delay Between Batches**: 1 second (to be respectful to servers)

## Troubleshooting

### All Links Fail with ENOTFOUND

This typically indicates no internet access. The test will pass gracefully and list all links for manual verification.

### Specific Link Always Fails

1. Check if the link should be added to `SKIP_LINKS`
2. Verify the link manually in a browser
3. Some sites block automated requests - this is expected

### Timeout Errors

Some servers are slow or rate-limit requests. Consider:
1. Increasing `LINK_CHECK_TIMEOUT` value
2. Adding the link to `SKIP_LINKS` if it's known to be slow
3. Running the check again (temporary network issues)

## Current External Links

As of the latest check, the repository contains approximately:
- **127 total unique links** across all files
- **18 external links** to check (after filtering)
- **109 internal/skipped links** (project URLs, placeholders, share buttons)

Key external dependencies:
- CDN: jsdelivr, cloudflare (for crypto-js)
- APIs: Google (AI Studio, Cloud Console, PageSpeed), OpenAI, Anthropic
- Services: Vercel, Web3Forms
- Documentation: schema.org

## Best Practices

1. **Run Regularly**: Check links before major releases
2. **Update Skip List**: Add known problematic links to skip list
3. **Monitor Results**: Pay attention to newly failing links
4. **Fix Broken Links**: Update or remove broken references promptly
5. **Use CDN Versions**: Pin CDN library versions to avoid breaking changes

## Contributing

When adding new external links:
1. Ensure they're from reliable sources
2. Use HTTPS when available
3. Pin versions for CDN libraries
4. Run link checker before committing

## Related Documentation

- [TESTING.md](TESTING.md) - General testing documentation
- [README.md](README.md) - Main project documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
