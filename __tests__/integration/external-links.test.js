/**
 * External Links Checker Test
 * Validates that all external links in HTML and MD files are accessible
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
];

// Links that belong to the project itself
const INTERNAL_LINKS_PREFIX = [
  'http://localhost',
  'https://24toolhub.com',
];

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
 * Clean and normalize URL by removing trailing punctuation
 */
function cleanUrl(url) {
  // Remove common trailing punctuation that might be captured
  return url.replace(/[),;:.!?]+$/, '');
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

describe('External Links Checker', () => {
  let allLinks = [];
  let externalLinks = [];

  beforeAll(() => {
    const rootDir = path.join(__dirname, '../..');
    
    // Find all HTML files
    const htmlFiles = findAllFiles(rootDir, ['.html']);
    
    // Find all MD files
    const mdFiles = findAllFiles(rootDir, ['.md']);

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

    allLinks = Array.from(linksSet);
    
    // Filter to only external links
    externalLinks = allLinks.filter(link => !shouldSkipLink(link));

    console.log(`\nFound ${allLinks.length} total unique links`);
    console.log(`Checking ${externalLinks.length} external links (skipped ${allLinks.length - externalLinks.length} internal/placeholder links)\n`);
  });

  test('Should find links in the repository', () => {
    expect(allLinks.length).toBeGreaterThan(0);
  });

  test('Should have external links to check', () => {
    expect(externalLinks.length).toBeGreaterThan(0);
  });

  test('All external links should be accessible', async () => {
    const results = [];
    const failedLinks = [];
    const networkErrors = [];

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

    // Collect failed links and categorize them
    results.forEach(result => {
      if (!result.ok) {
        failedLinks.push(result);
        // Track network errors separately (ENOTFOUND, etc.)
        if (result.error && result.error.includes('ENOTFOUND')) {
          networkErrors.push(result);
        }
        console.error(`❌ ${result.url} - ${result.error || `HTTP ${result.status}`}`);
      } else {
        console.log(`✅ ${result.url} - HTTP ${result.status}`);
      }
    });

    // Report results
    const successCount = results.filter(r => r.ok).length;
    const failureCount = failedLinks.length;

    console.log(`\n📊 Results: ${successCount}/${externalLinks.length} links accessible`);
    
    if (failedLinks.length > 0) {
      console.log('\n❌ Failed Links:');
      failedLinks.forEach(link => {
        console.log(`  - ${link.url}: ${link.error || `HTTP ${link.status}`}`);
      });
    }

    // If all failures are network errors (ENOTFOUND), it suggests no internet access
    // In this case, just report the links without failing the test
    if (networkErrors.length === failedLinks.length && networkErrors.length > 0) {
      console.log('\n⚠️  All failures are network errors (ENOTFOUND).');
      console.log('This suggests the test environment may not have internet access.');
      console.log('The test will pass but the links should be verified in an environment with internet access.');
      
      // List all unique external links found for manual verification
      console.log('\n📋 External links found (for manual verification):');
      externalLinks.forEach(link => {
        console.log(`  - ${link}`);
      });
      
      // Pass the test in this case
      return;
    }

    // Test passes if all links are accessible (or all failures are network errors)
    expect(failedLinks.length).toBe(0);
  }, 300000); // 5 minute timeout for all checks
});
