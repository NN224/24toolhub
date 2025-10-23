# 24ToolHub - Free Online Tools

## Overview
24ToolHub is a comprehensive collection of 50+ free online tools for text processing, conversion, generation, encoding, and more. The project provides both client-side tools that run entirely in the browser and server-side tools that leverage backend APIs for advanced functionality.

**Last Updated**: October 22, 2025

## Project Architecture

### Technology Stack
- **Frontend**: Static HTML, CSS, and vanilla JavaScript
- **Backend**: Node.js with Express.js
- **Dependencies**: 
  - cheerio (web scraping for SEO analysis)
  - cors (cross-origin resource sharing)
  - node-fetch (HTTP requests)
  - ping (network ping functionality)

### Project Structure
```
.
├── server.js                 # Express server (serves static files + APIs)
├── index.html               # Homepage
├── package.json             # Node.js dependencies
├── tools/                   # Individual tool pages (50+ HTML files)
├── js/                      # JavaScript modules for each tool
├── css/                     # Stylesheets
├── images/                  # Images and assets
└── replit.md               # This file
```

### Backend API Endpoints
The Express server provides four API endpoints for advanced features:

1. **GET /analyze-seo** - SEO analysis tool
   - Analyzes website meta tags, headings, images, and structure
   - Uses cheerio for HTML parsing
   
2. **GET /dns-lookup** - DNS lookup tool
   - Queries DNS records (A, AAAA, MX, TXT, NS, CNAME, SOA)
   - Uses Node.js dns.promises module
   
3. **GET /ping** - Network ping test
   - Tests connectivity to hosts via HTTP/HTTPS (alternative to ICMP)
   - Uses node-fetch for connection testing
   
4. **GET /pagespeed** - PageSpeed Insights proxy
   - Securely proxies requests to Google PageSpeed Insights API
   - Protects API key from client-side exposure
   - Supports both mobile and desktop strategies

### Port Configuration
- **Development & Production**: Port 5000
- Server binds to 0.0.0.0 to work in the Replit environment
- Frontend and backend run on the same server

## Recent Changes
- **October 23, 2025**: PageSpeed Tool Enhancements & Contact Page Fixes
  - **Website Speed Test - Major Feature Update**:
    - **Detailed Results Like Google PageSpeed**: Added comprehensive audit sections (Opportunities, Diagnostics, Passed Audits)
    - **Professional Number Formatting**: Times show as 1.02s instead of 1015ms; CLS displays as 0.001
    - **Color-Coded Score Circle**: Green for 90+, orange for 50-89, red for <50
    - **Complete Audit Data**: Extracts all opportunities with potential savings, all diagnostics (including informational), and all passed audits
    - **Collapsible Sections**: Passed audits start collapsed; all sections show audit count badges
    - **Professional UI**: Matches Google PageSpeed design with icons, color coding, and hover effects
  - **Contact Page Fixes**:
    - Removed public-facing setup instructions (📧 إعداد نموذج الاتصال section)
    - Added Google Analytics tracking
    - Fixed duplicate field names (changed 'subject' to 'inquiry_topic')
  - **Security Enhancement**:
    - Removed hardcoded PageSpeed API key from server.js
    - Now uses PAGESPEED_API_KEY environment variable only
    - Added proper error message when API key is missing
  
- **October 22, 2025**: Initial import from GitHub and Replit setup
  - Updated server.js to serve static files and bind to port 5000
  - Changed API endpoint URLs in JavaScript files from localhost:3000 to relative paths
  - Created .gitignore for Node.js project
  - Configured workflow to run the Express server
  - Configured deployment settings for VM deployment
  - **Security Fix**: Moved Google PageSpeed Insights API key from client-side to server-side
  - Updated Ping tool to work in Replit environment (HTTP/HTTPS instead of ICMP)
  - Added /pagespeed endpoint for secure PageSpeed API access
  - **SEO Enhancement**: Added Open Graph meta tags to all main pages
  - **Social Media Image**: Added custom og:image (images/og-image.jpg) for better social sharing appearance
  - **New High-Traffic Tools Added**:
    1. YouTube Thumbnail Downloader - Extract thumbnails from YouTube videos
    2. Image Compressor - Compress images with quality control
    3. PDF Merger - Combine multiple PDF files using pdf-lib CDN
    4. Grammar Checker - Check grammar, spelling, and punctuation errors
  - All new tools are client-side, SEO-optimized with Open Graph tags, and include AdSense ad slots
  - Removed Background Remover tool after review (algorithm too basic for production quality)
  - **Google Analytics Integration**: Added Google Analytics tracking (G-2ELW7FZKDW) to all 71 pages (homepage + 70 tool pages)
  - **Blog System**: Created blog section with article template, 5 comprehensive articles, and SEO optimization
    - Blog homepage at /blog/index.html
    - Reusable article template with Schema markup
    - 5 articles: YouTube Thumbnails, Image Compression, PDF Merging, Web Dev Tools Guide, Digital Security (Arabic)
    - All articles SEO-optimized with Open Graph tags and social sharing buttons
    - Arabic article with full RTL support
  - **Navigation Enhancement**: Added unified header navigation (Home, Blog, Contact, About, العربية) across all 87 pages
    - Consistent navigation across homepage, tools, blog articles, and info pages
    - Easy access to key sections from anywhere in the site
  - **Latest Blog Articles** (October 22, 2025):
    - "The Ultimate Guide to Web Development Tools and Utilities" (12-min read, English)
    - "الدليل الشامل للأمن الرقمي: حماية هويتك وبياناتك في العصر الرقمي" (15-min read, Arabic with RTL)
  - **Mobile Optimization**: Enhanced responsive design with comprehensive media queries
    - Header navigation adapts for mobile screens (stacked layout, smaller buttons)
    - Blog grid switches to single column on mobile
    - Article content optimized for mobile reading
    - Social share buttons full-width on mobile
    - All 87 pages fully responsive with viewport meta tags

## Running the Application

### Development
The application runs automatically via the configured workflow:
- Workflow name: "Server"
- Command: `node server.js`
- Port: 5000

### Deployment
Deployment is configured for VM (always-on) mode since the application provides network tools that need persistent server access.

## Tool Categories

1. **Text & String Tools** (word counter, case converter, string reverser, etc.)
2. **Conversion & Calculator Tools** (temperature, weight, currency, etc.)
3. **Generator & Formatter Tools** (UUID, password, JSON formatter, etc.)
4. **Encoder & Crypto Tools** (Base64, MD5, SHA256, etc.)
5. **Website Analysis Tools** (SEO analyzer, DNS lookup, ping test - require backend)
6. **Utility & Misc Tools** (QR code, image resizer, etc.)

## Notes
- Most tools run entirely in the browser (client-side JavaScript)
- Three tools require the backend server: SEO Analyzer, DNS Lookup, and Ping Test
- AdSense is configured but may show errors in development environment
- The site supports Arabic language switching (العربية)
