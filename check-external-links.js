#!/usr/bin/env node
/**
 * External Links Checker Script
 * Standalone script to validate all external links in HTML and MD files
 * Usage: node check-external-links.js
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Timeout for each link check (10 seconds)
const LINK_CHECK_TIMEOUT = 10000;

// Links to skip (known to have issues with HEAD requests or are dynamic)
const SKIP_LINKS = [
  'https://www.googletagmanager.com/gtm.js?id=', // Dynamic GTM script
  'https://www.googletagmanager.com/gtag/', // Google Analytics
  'https://www.googletagmanager.com/ns.html', // GTM noscript
  'https://pagead2.googlesyndication.com/', // Google Ads
  'https://wa.me/?text=', // WhatsApp share links (dynamic)
  'https://twitter.com/intent/tweet', // Twitter share links (dynamic)
  'https://www.facebook.com/sharer/', // Facebook share links (dynamic)
  'https://www.linkedin.com/sharing/', // LinkedIn share links (dynamic)
  'https://m.youtube.com/watch?v=VIDEO_ID', // Example/placeholder URLs
  'https://www.youtube.com/watch?v=VIDEO_ID',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Example video
  'https://youtu.be/VIDEO_ID',
  'https://api.example.com/endpoint',
  'https://example.com',
  'https://example.com/path?query=value',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/', // Example YouTube thumbnails
  'https://httpbin.org', // Testing endpoints
  'https://jsonplaceholder.typicode.com', // Testing endpoints
  'https://api.github.com/users/octocat', // Example API endpoint
  'https://your-domain-to-skip.com', // Documentation example
  'https://invalid-domain-example.test', // Documentation example
  'https://slow-server-example.test', // Documentation example
];

// Links that belong to the project itself
const INTERNAL_LINKS_PREFIX = [
  'http://localhost',
  'https://24toolhub.com',
];

/**
 * Clean and normalize URL by removing trailing punctuation
 */
function cleanUrl(url) {
  // Remove common trailing punctuation that might be captured
  return url.replace(/[),;:.!?]+$/, '');
}

/**
 * Extract all href and src URLs from HTML files
 */
function extractLinksFromHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(content);
  const links = new Set();

  // Extract href attributes
  $('a[href], link[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      links.add(cleanUrl(href));
    }
  });

  // Extract src attributes
  $('script[src], img[src], iframe[src]').each((_, element) => {
    const src = $(element).attr('src');
    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
      links.add(cleanUrl(src));
    }
  });

  return Array.from(links);
}

/**
 * Extract all URLs from markdown files
 */
function extractLinksFromMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const links = new Set();

  // Match markdown links: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    const url = match[2];
    if (url.startsWith('http://') || url.startsWith('https://')) {
      links.add(cleanUrl(url));
    }
  }

  // Match plain URLs
  const plainUrlRegex = /https?:\/\/[^\s<>"\`]+/g;
  while ((match = plainUrlRegex.exec(content)) !== null) {
    links.add(cleanUrl(match[0]));
  }

  return Array.from(links);
}

/**
 * Find all HTML and MD files in the repository
 */
function findAllFiles(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and hidden directories
        if (item !== 'node_modules' && !item.startsWith('.')) {
          traverse(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Check if a link should be skipped
 */
function shouldSkipLink(url) {
  // Skip internal links (project's own URLs)
  for (const prefix of INTERNAL_LINKS_PREFIX) {
    if (url.startsWith(prefix)) {
      return true;
    }
  }

  // Skip explicitly excluded links
  for (const skipLink of SKIP_LINKS) {
    if (url.startsWith(skipLink) || url.includes(skipLink)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a URL is accessible
 */
async function checkLink(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LINK_CHECK_TIMEOUT);

  try {
    // Try HEAD request first (faster)
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
      },
    });

    clearTimeout(timeout);

    // Accept 200-399 status codes as valid
    if (response.ok || (response.status >= 200 && response.status < 400)) {
      return { url, status: response.status, ok: true };
    }

    // Some servers don't support HEAD, try GET
    if (response.status === 405 || response.status === 404) {
      const getResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
        },
      });

      if (getResponse.ok || (getResponse.status >= 200 && getResponse.status < 400)) {
        return { url, status: getResponse.status, ok: true };
      }

      return { url, status: getResponse.status, ok: false, error: `HTTP ${getResponse.status}` };
    }

    return { url, status: response.status, ok: false, error: `HTTP ${response.status}` };
  } catch (error) {
    clearTimeout(timeout);
    
    if (error.name === 'AbortError') {
      return { url, ok: false, error: 'Timeout' };
    }
    
    return { url, ok: false, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 External Links Checker\n');
  console.log('Scanning repository for external links...\n');

  const rootDir = __dirname;
  
  // Find all HTML files
  const htmlFiles = findAllFiles(rootDir, ['.html']);
  
  // Find all MD files
  const mdFiles = findAllFiles(rootDir, ['.md']);

  console.log(`Found ${htmlFiles.length} HTML files and ${mdFiles.length} Markdown files\n`);

  // Extract links from all files
  const linksSet = new Set();
  
  htmlFiles.forEach(file => {
    const links = extractLinksFromHTML(file);
    links.forEach(link => linksSet.add(link));
  });

  mdFiles.forEach(file => {
    const links = extractLinksFromMarkdown(file);
    links.forEach(link => linksSet.add(link));
  });

  const allLinks = Array.from(linksSet);
  
  // Filter to only external links
  const externalLinks = allLinks.filter(link => !shouldSkipLink(link));

  console.log(`Found ${allLinks.length} total unique links`);
  console.log(`Checking ${externalLinks.length} external links (skipped ${allLinks.length - externalLinks.length} internal/placeholder links)\n`);

  if (externalLinks.length === 0) {
    console.log('✅ No external links to check!');
    return;
  }

  const results = [];
  const failedLinks = [];

  // Check links in batches to avoid overwhelming servers
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < externalLinks.length; i += BATCH_SIZE) {
    const batch = externalLinks.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(link => checkLink(link))
    );
    
    results.push(...batchResults);
    
    // Small delay between batches to be respectful
    if (i + BATCH_SIZE < externalLinks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Report results
  console.log('\n📊 Results:\n');
  
  results.forEach(result => {
    if (!result.ok) {
      failedLinks.push(result);
      console.log(`❌ ${result.url}`);
      console.log(`   Error: ${result.error || `HTTP ${result.status}`}\n`);
    } else {
      console.log(`✅ ${result.url} (HTTP ${result.status})`);
    }
  });

  const successCount = results.filter(r => r.ok).length;
  const failureCount = failedLinks.length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${successCount}/${externalLinks.length} links accessible`);
  console.log(`${'='.repeat(60)}\n`);
  
  if (failedLinks.length > 0) {
    console.log('❌ Failed Links Summary:');
    failedLinks.forEach(link => {
      console.log(`  - ${link.url}`);
      console.log(`    ${link.error || `HTTP ${link.status}`}`);
    });
    console.log('');
    process.exit(1);
  } else {
    console.log('✅ All external links are accessible!\n');
    process.exit(0);
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
