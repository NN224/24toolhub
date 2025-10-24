# 24ToolHub - Free Online Tools

## Overview
24ToolHub is a comprehensive collection of 70+ free online tools for text processing, conversion, generation, encoding, and more. The project provides both client-side tools that run entirely in the browser and server-side tools that leverage backend APIs for advanced functionality.

**Last Updated**: October 24, 2025

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
├── tools/                   # Individual tool pages (70+ HTML files)
├── js/                      # JavaScript modules for each tool
├── css/                     # Stylesheets
├── images/                  # Images and assets
└── replit.md               # This file
```

### Backend API Endpoints
The Express server provides five API endpoints for advanced features:

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

5. **POST /chat** - AI Chatbot Assistant
   - Powered by Google Gemini AI (free tier)
   - Helps users find the right tool based on natural language queries
   - Supports bilingual responses (English + Arabic)
   - Rate limiting: 5 messages per minute per visitor
   - Increases user engagement and session duration for better AdSense revenue

### Port Configuration
- **Development & Production**: Port 5000
- Server binds to 0.0.0.0 to work in the Replit environment
- Frontend and backend run on the same server

## Recent Changes
- **October 24, 2025**: AI Chatbot Phase 2 - Intelligence & Personalization
  - **Context-Aware Suggestions**:
    - Chatbot detects current tool page and suggests related tools
    - Example: On JSON Formatter page → suggests JSON to CSV, JSON to XML
    - Smart detection of tool categories for better recommendations
  - **Conversation History with localStorage**:
    - Saves conversations throughout the day (cleared at midnight)
    - Shows "📜 Previous conversation" separator when resuming chat
    - Users can continue where they left off on same day
  - **Smart Caching System**:
    - Caches common queries for instant responses
    - Reduces API calls and improves response time
    - Cache persists for the day (same as conversation history)
  - **Multi-Tool Workflow Recommendations**:
    - AI suggests complete workflows for complex tasks
    - Example: "optimize my website" → CSS Minifier → HTML Minifier → Image Compressor → PageSpeed Test
    - Step-by-step guidance with direct tool links
    - Helps users accomplish complex goals efficiently

- **October 24, 2025**: AI Chatbot Phase 1 Enhancements (Quick Wins & UX)
  - **Quick Reply Buttons**:
    - Added 6 category buttons: Text Tools, Converters, Generators, Encryption, Website Analysis, Image Tools
    - One-click access to tool categories
    - Reduces friction and speeds up tool discovery
  - **Enhanced Welcome Message**:
    - Time-based greetings (صباح الخير/مساء الخير based on hour)
    - Shows 3 trending tools: JSON Formatter, Image Compressor, QR Generator
    - More engaging first impression
  - **Rate Limit Counter**:
    - Real-time display of remaining messages (5 per minute)
    - Visual warning when approaching limit
    - Prevents unexpected blocking
  - **Mobile Optimization**:
    - Larger button on mobile (70px vs 60px)
    - Full-screen responsive design
    - Optimized text sizes and spacing
    - Better touch targets for mobile users
  - **Improved Message Formatting**:
    - Proper line breaks and spacing
    - Styled links with hover effects
    - Bold text support
    - Bullet points for lists

- **October 24, 2025**: AI Chatbot Assistant Integration
  - **Chatbot Features**:
    - Powered by Google Gemini AI (free tier - 60 requests/minute)
    - Helps users find tools using natural language queries
    - Bilingual support (English + Arabic)
    - Rate limiting: 5 messages per minute per visitor
    - Deployed across ALL pages (homepage + 101 pages total)
  - **Technical Implementation**:
    - Backend endpoint: POST /chat with Gemini AI integration
    - Frontend: Floating chat button + chat widget UI
    - Tools database (tools-database.json) with all 70+ tools
    - Client-side rate limiting with visitor tracking
    - Professional gradient UI matching site design
  - **Business Impact**:
    - Increases user engagement and session duration
    - Helps users discover relevant tools
    - Improves user experience and navigation
    - Higher session duration = Better AdSense revenue
  - **Files Modified**:
    - css/chatbot.css - Enhanced UI styling with quick replies
    - js/chatbot.js - Added Phase 1 features
    - tools-database.json - Complete tools catalog

- **October 24, 2025**: Tool Expansion - Added 17 New Tools (Phases 1-5)
  - **Total Tools Now**: 70+ free online tools (up from 53)
  - **New Tools by Category**:
    - **Conversion & Calculator Tools** (4 new):
      1. Age Calculator - Calculate exact age in years, months, days, hours, and minutes
      2. Time Zone Converter - Convert time between different time zones worldwide
      3. Tip Calculator - Calculate tip amount and split bills among multiple people
      4. RGB to HEX Converter - Convert colors between RGB and HEX formats with live preview
    - **Generator & Formatter Tools** (8 new):
      1. JSON to CSV Converter - Convert JSON arrays to CSV format with custom delimiters
      2. JSON to XML Converter - Convert JSON data to XML format
      3. XML to JSON Converter - Convert XML data to JSON format
      4. SQL Formatter - Format and beautify SQL queries with syntax highlighting
      5. YAML to JSON Converter - Convert YAML configuration files to JSON (uses js-yaml CDN)
      6. CSS Minifier - Compress CSS code to reduce file size
      7. HTML Minifier - Compress HTML code to reduce file size
      8. JavaScript Minifier - Compress JavaScript code to reduce file size
    - **Website Analysis Tools** (1 new):
      1. Speech to Text - Convert speech to text using browser's Web Speech API
    - **Utility & Misc Tools** (4 new):
      1. Image Format Converter - Convert images between PNG, JPG, and WebP formats
      2. SVG to PNG Converter - Convert SVG vector graphics to PNG raster images
      3. Image Cropper - Crop images with custom dimensions and aspect ratios
      4. What is My IP - Display user's IP address, location, and browser information
  - **Documentation Updates**:
    - Updated index.html meta description to "70+ free online tools"
    - Updated sitemap.xml with all 17 new tool URLs (dated 2025-10-24)
    - All new tools include SEO optimization, Open Graph tags, and AdSense integration
  - **Tool Design Pattern**: All new tools follow established design standards:
    - Client-side processing (no data sent to servers)
    - Professional gradient UI matching existing tools
    - Mobile-responsive design
    - Google Analytics tracking
    - Unified header navigation

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
