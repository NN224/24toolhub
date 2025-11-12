#!/usr/bin/env node

/**
 * Deployment Readiness Verification Script
 * 
 * Checks if the project is ready for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   24ToolHub - Deployment Readiness Verification          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let allChecksPassed = true;
const warnings = [];

// Helper function to check file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, filePath));
}

// Helper function to read JSON file
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, filePath), 'utf8'));
  } catch (error) {
    return null;
  }
}

// Check 1: Essential files exist
console.log('📁 Checking Essential Files...');
const requiredFiles = [
  'server.js',
  'package.json',
  'vercel.json',
  '.env.example',
  'ai-config.js',
  'ai-service.js',
  'tools-database.json',
  'DEPLOYMENT.md',
  'README.md'
];

requiredFiles.forEach(file => {
  if (fileExists(file)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} - MISSING`);
    allChecksPassed = false;
  }
});

// Check 2: .env should NOT exist in git
console.log('\n🔒 Checking Security...');
if (fileExists('.env')) {
  warnings.push('.env file exists - Make sure it is in .gitignore');
  console.log('  ⚠ .env file found (ensure it is in .gitignore)');
} else {
  console.log('  ✓ No .env file in repository (good)');
}

// Check 3: .gitignore includes .env
if (fileExists('.gitignore')) {
  const gitignore = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');
  if (gitignore.includes('.env')) {
    console.log('  ✓ .env is in .gitignore');
  } else {
    console.log('  ✗ .env is NOT in .gitignore - Add it!');
    allChecksPassed = false;
  }
}

// Check 4: package.json validation
console.log('\n📦 Checking package.json...');
const packageJson = readJSON('package.json');
if (packageJson) {
  console.log(`  ✓ Valid JSON`);
  console.log(`  ✓ Name: ${packageJson.name}`);
  console.log(`  ✓ Version: ${packageJson.version}`);
  
  // Check essential dependencies
  const deps = packageJson.dependencies || {};
  const requiredDeps = [
    'express',
    'cors',
    'node-fetch',
    'cheerio',
    '@google/generative-ai'
  ];
  
  requiredDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`  ✓ Dependency: ${dep}@${deps[dep]}`);
    } else {
      console.log(`  ✗ Missing dependency: ${dep}`);
      allChecksPassed = false;
    }
  });
} else {
  console.log('  ✗ Invalid or missing package.json');
  allChecksPassed = false;
}

// Check 5: vercel.json validation
console.log('\n🚀 Checking vercel.json...');
const vercelConfig = readJSON('vercel.json');
if (vercelConfig) {
  console.log(`  ✓ Valid JSON`);
  console.log(`  ✓ Version: ${vercelConfig.version}`);
  
  if (vercelConfig.builds && vercelConfig.builds.length > 0) {
    console.log(`  ✓ Builds configured: ${vercelConfig.builds.length}`);
  } else {
    console.log(`  ⚠ No builds specified (may use defaults)`);
  }
  
  if (vercelConfig.routes && vercelConfig.routes.length > 0) {
    console.log(`  ✓ Routes configured: ${vercelConfig.routes.length}`);
  } else {
    warnings.push('No routes specified in vercel.json');
  }
} else {
  console.log('  ✗ Invalid or missing vercel.json');
  allChecksPassed = false;
}

// Check 6: AI Configuration
console.log('\n🤖 Checking AI Configuration...');
try {
  const aiConfig = require('./ai-config.js');
  console.log('  ✓ ai-config.js loads successfully');
  
  const tiers = aiConfig.getModelTiers();
  console.log(`  ✓ Model tiers defined: ${Object.keys(tiers).join(', ')}`);
  
  const mappings = aiConfig.getEndpointMappings();
  const chatMapping = mappings['/chat'];
  if (chatMapping) {
    console.log(`  ✓ Chat endpoint mapped to: ${chatMapping} tier`);
  } else {
    console.log('  ✗ Chat endpoint not mapped to any tier');
    allChecksPassed = false;
  }
} catch (error) {
  console.log(`  ✗ Error loading ai-config.js: ${error.message}`);
  allChecksPassed = false;
}

// Check 7: AI Service
console.log('\n⚙️  Checking AI Service...');
try {
  const aiService = require('./ai-service.js');
  console.log('  ✓ ai-service.js loads successfully');
  
  const functions = Object.keys(aiService);
  console.log(`  ✓ Exported functions: ${functions.length}`);
  
  if (functions.includes('callAIWithFallback')) {
    console.log('  ✓ callAIWithFallback function exists');
  } else {
    console.log('  ✗ callAIWithFallback function missing');
    allChecksPassed = false;
  }
} catch (error) {
  console.log(`  ✗ Error loading ai-service.js: ${error.message}`);
  allChecksPassed = false;
}

// Check 8: Server.js
console.log('\n🖥️  Checking server.js...');
try {
  const serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  
  if (serverCode.includes('module.exports')) {
    console.log('  ✓ Exports app for Vercel');
  } else {
    console.log('  ✗ Missing "module.exports = app" for Vercel');
    allChecksPassed = false;
  }
  
  if (serverCode.includes('getModelForEndpoint')) {
    console.log('  ✓ Uses new AI configuration system');
  } else {
    console.log('  ⚠ May not be using new AI system');
    warnings.push('Server.js may not use new AI configuration');
  }
  
  if (serverCode.includes('callAIWithFallback')) {
    console.log('  ✓ Uses AI fallback system');
  } else {
    console.log('  ⚠ May not use AI fallback system');
    warnings.push('Server.js may not use AI fallback');
  }
} catch (error) {
  console.log(`  ✗ Error reading server.js: ${error.message}`);
  allChecksPassed = false;
}

// Check 9: Tools Database
console.log('\n🛠️  Checking Tools Database...');
const toolsDb = readJSON('tools-database.json');
if (toolsDb && toolsDb.tools) {
  console.log(`  ✓ Valid JSON with ${toolsDb.tools.length} tools`);
} else {
  console.log('  ⚠ tools-database.json may be invalid');
  warnings.push('tools-database.json validation failed');
}

// Check 10: Environment Variable Documentation
console.log('\n📝 Checking .env.example...');
if (fileExists('.env.example')) {
  const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
  
  const requiredVars = [
    'GEMINI_API_KEY',
    'PAGESPEED_API_KEY'
  ];
  
  requiredVars.forEach(varName => {
    if (envExample.includes(varName)) {
      console.log(`  ✓ ${varName} documented`);
    } else {
      console.log(`  ✗ ${varName} not documented`);
      allChecksPassed = false;
    }
  });
} else {
  console.log('  ✗ .env.example missing');
  allChecksPassed = false;
}

// Summary
console.log('\n' + '═'.repeat(60));
console.log('\n📊 VERIFICATION SUMMARY\n');

if (allChecksPassed) {
  console.log('✅ All critical checks passed!');
  console.log('   Your project is ready for Vercel deployment.\n');
} else {
  console.log('❌ Some critical checks failed!');
  console.log('   Please fix the issues above before deploying.\n');
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(warning => {
    console.log(`   - ${warning}`);
  });
  console.log();
}

console.log('📋 Next Steps:');
console.log('   1. Review VERCEL_DEPLOYMENT_CHECKLIST.md');
console.log('   2. Configure environment variables');
console.log('   3. Run: vercel (or deploy via dashboard)');
console.log('   4. Test all endpoints after deployment');
console.log('   5. Monitor costs and performance\n');

console.log('📚 Documentation:');
console.log('   - README.md - Quick start guide');
console.log('   - DEPLOYMENT.md - Detailed deployment guide');
console.log('   - VERCEL_DEPLOYMENT_CHECKLIST.md - Step-by-step checklist\n');

console.log('═'.repeat(60) + '\n');

// Exit with appropriate code
process.exit(allChecksPassed ? 0 : 1);
