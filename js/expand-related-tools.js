// Expand Related Tools
// Generate comprehensive related tools mappings for all tools

(function() {
  'use strict';

  // Load tools database
  async function loadToolsDatabase() {
    try {
      const response = await fetch('/tools-database.json');
      if (!response.ok) return null;
      const data = await response.json();
      return data.tools || [];
    } catch (e) {
      console.error('Failed to load tools database:', e);
      return null;
    }
  }

  // Get tool key from URL
  function getToolKey(url) {
    if (!url) return '';
    const match = url.match(/\/([^/]+)\.html$/);
    return match ? match[1] : '';
  }

  // Find related tools based on category and keywords
  function findRelatedTools(currentTool, allTools, limit = 4) {
    const currentKey = getToolKey(currentTool.url);
    const currentCategory = currentTool.category;
    const currentKeywords = currentTool.keywords || [];

    // Filter out current tool
    const otherTools = allTools.filter(t => getToolKey(t.url) !== currentKey);

    // Score tools based on similarity
    const scored = otherTools.map(tool => {
      let score = 0;

      // Same category = high score
      if (tool.category === currentCategory) {
        score += 10;
      }

      // Shared keywords = medium score
      const sharedKeywords = (tool.keywords || []).filter(k => 
        currentKeywords.some(ck => 
          k.toLowerCase().includes(ck.toLowerCase()) || 
          ck.toLowerCase().includes(k.toLowerCase())
        )
      );
      score += sharedKeywords.length * 3;

      // Name similarity = low score
      const nameSimilarity = calculateSimilarity(
        currentTool.name.toLowerCase(),
        tool.name.toLowerCase()
      );
      score += nameSimilarity * 2;

      return { tool, score };
    });

    // Sort by score and return top tools
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        name: item.tool.name,
        url: item.tool.url
      }));
  }

  // Simple string similarity (Levenshtein-like)
  function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  // Levenshtein distance
  function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  // Generate related tools for a tool
  async function generateRelatedTools(toolUrl) {
    const allTools = await loadToolsDatabase();
    if (!allTools || allTools.length === 0) return [];

    const currentTool = allTools.find(t => t.url === toolUrl);
    if (!currentTool) return [];

    return findRelatedTools(currentTool, allTools, 4);
  }

  // Expand RELATED_TOOLS in user-journey.js
  async function expandRelatedTools() {
    // Check if user-journey.js has RELATED_TOOLS
    if (!window.RELATED_TOOLS) {
      window.RELATED_TOOLS = {};
    }

    // Load tools database
    const allTools = await loadToolsDatabase();
    if (!allTools || allTools.length === 0) {
      console.warn('Could not load tools database for related tools expansion');
      return;
    }

    // Generate related tools for each tool
    const expanded = {};
    for (const tool of allTools) {
      const key = getToolKey(tool.url);
      if (key && !window.RELATED_TOOLS[key]) {
        const related = findRelatedTools(tool, allTools, 4);
        if (related.length > 0) {
          expanded[key] = related;
        }
      }
    }

    // Merge with existing RELATED_TOOLS
    window.RELATED_TOOLS = {
      ...window.RELATED_TOOLS,
      ...expanded
    };

    console.log(`Expanded related tools: ${Object.keys(expanded).length} new mappings`);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', expandRelatedTools);
  } else {
    expandRelatedTools();
  }

  // Export function for manual use
  window.expandRelatedTools = expandRelatedTools;
  window.generateRelatedTools = generateRelatedTools;

  console.log('Expand related tools initialized');
})();

