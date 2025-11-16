#!/usr/bin/env node
/**
 * inject-adsense-meta.js
 * Adds <meta name="google-adsense-account" content="ca-pub-2446710277775155"> to the <head> of all HTML files if missing.
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PROJECT_ROOT = __dirname;
const ACCOUNT_META = {
  name: 'google-adsense-account',
  content: 'ca-pub-2446710277775155'
};

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

function ensureAdsenseMeta(file) {
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  const hasMeta = $(`head meta[name="${ACCOUNT_META.name}"]`).length > 0;
  if (hasMeta) return false;

  const meta = $('<meta>');
  meta.attr('name', ACCOUNT_META.name);
  meta.attr('content', ACCOUNT_META.content);

  const head = $('head');
  if (head.length === 0) return false;

  // Insert after charset/meta viewport if present; else append to head
  const charsetMeta = head.find('meta[charset]').first();
  const viewportMeta = head.find('meta[name="viewport"]').first();

  if (viewportMeta.length) {
    viewportMeta.after('\n    ', meta, '\n');
  } else if (charsetMeta.length) {
    charsetMeta.after('\n    ', meta, '\n');
  } else {
    head.prepend('    ');
    head.append('\n    ', meta, '\n');
  }

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
    try {
      if (ensureAdsenseMeta(f)) changed += 1;
    } catch (_) {}
  });
  console.log(`Injected AdSense meta into ${changed}/${files.length} HTML files.`);
}

if (require.main === module) {
  main();
}
