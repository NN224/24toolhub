#!/usr/bin/env node
/**
 * fix-internal-links.js
 * Normalize internal <a href> links across all HTML files to point directly to canonical 200-OK URLs.
 * - Converts absolute internal links to root-relative
 * - Removes tracking params (utm_*, fbclid)
 * - Normalizes index paths:
 *    /index.html or /index -> /
 *    /blog or /blog/index.html -> /blog/
 *    any /path/index.html -> /path/
 * - Leaves external links untouched
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PROJECT_ROOT = __dirname;
const PRIMARY_HOST = '24toolhub.com';

function listHtmlFiles(dir) {
  const results = [];
  const skip = new Set(['node_modules', '.git']);
  (function walk(d) {
    for (const item of fs.readdirSync(d)) {
      const full = path.join(d, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (!skip.has(item)) walk(full);
      } else if (stat.isFile() && item.endsWith('.html')) {
        results.push(full);
      }
    }
  })(dir);
  return results;
}

function servedPathForFile(filePath) {
  const rel = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/index.html';
  if (rel.startsWith('tools/')) return '/' + rel;
  if (rel.startsWith('blog/')) return '/' + rel; // blog/index.html -> /blog/index.html
  if (rel.startsWith('public/')) return '/' + rel.replace(/^public\//, '');
  return '/' + rel;
}

function normalizeInternalUrl(targetUrl) {
  // Force https://PRIMARY_HOST as base for URL ops
  let url = new URL(targetUrl, `https://${PRIMARY_HOST}`);

  // Strip tracking params
  const toRemove = [];
  url.searchParams.forEach((_v, k) => {
    if (k.toLowerCase().startsWith('utm_') || k.toLowerCase() === 'fbclid') toRemove.push(k);
  });
  toRemove.forEach((k) => url.searchParams.delete(k));

  // Index normalizations
  if (url.pathname === '/index.html' || url.pathname === '/index') url.pathname = '/';
  if (url.pathname === '/blog' || url.pathname === '/blog/index.html') url.pathname = '/blog/';
  if (url.pathname.endsWith('/index.html')) url.pathname = url.pathname.replace(/\/index\.html$/, '/');

  // Return root-relative canonical
  const qs = url.searchParams.toString();
  return url.pathname + (qs ? `?${qs}` : '') + url.hash;
}

function processFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  const pageServedPath = servedPathForFile(file); // e.g., /tools/foo.html or /blog/index.html

  $('a[href]').each((_, el) => {
    const $a = $(el);
    const href = $a.attr('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    let abs;
    try {
      abs = new URL(href, `https://${PRIMARY_HOST}${pageServedPath}`);
    } catch {
      return;
    }

    // Only normalize internal links
    const isInternal = abs.hostname === PRIMARY_HOST || (!abs.hostname && !href.startsWith('http'));
    if (!isInternal) return;

    const canonical = normalizeInternalUrl(abs.href);
    if (canonical !== href) {
      $a.attr('href', canonical);
    }
  });

  const output = $.html();
  if (output !== html) {
    fs.writeFileSync(file, output, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const files = listHtmlFiles(PROJECT_ROOT);
  let changed = 0;
  files.forEach((f) => {
    if (processFile(f)) changed += 1;
  });
  console.log(`Normalized internal links in ${changed}/${files.length} HTML files.`);
}

if (require.main === module) {
  main();
}
