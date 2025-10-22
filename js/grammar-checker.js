// Grammar Checker Logic
;(() => {
  const textInput = document.getElementById('textInput');
  const issuesContainer = document.getElementById('issuesContainer');
  const wordCount = document.getElementById('wordCount');
  const charCount = document.getElementById('charCount');
  const sentenceCount = document.getElementById('sentenceCount');
  const issueCount = document.getElementById('issueCount');

  // Common grammar rules and patterns
  const grammarRules = [
    // Spelling mistakes
    { pattern: /\bteh\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'the' },
    { pattern: /\brecieve\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'receive' },
    { pattern: /\bwierd\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'weird' },
    { pattern: /\boccured\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'occurred' },
    { pattern: /\bacheive\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'achieve' },
    { pattern: /\bseperate\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'separate' },
    { pattern: /\bdefinately\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'definitely' },
    { pattern: /\bneccessary\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'necessary' },
    { pattern: /\baccomodate\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'accommodate' },
    { pattern: /\boccassion\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'occasion' },
    
    // Grammar issues
    { pattern: /\byour welcome\b/gi, type: 'grammar', message: 'Grammar error', suggestion: "you're welcome" },
    { pattern: /\bshould of\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'should have' },
    { pattern: /\bcould of\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'could have' },
    { pattern: /\bwould of\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'would have' },
    { pattern: /\bits a\b/gi, type: 'grammar', message: 'Possible contraction error', suggestion: "it's" },
    { pattern: /\btheir is\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'there is' },
    { pattern: /\btheir are\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'there are' },
    { pattern: /\ba lot\b/gi, type: 'grammar', message: 'Note', suggestion: 'a lot (two words)' },
    
    // Double spaces
    { pattern: /  +/g, type: 'punctuation', message: 'Extra spaces', suggestion: 'single space' },
    
    // Missing space after punctuation
    { pattern: /([.!?,;:])([A-Z])/g, type: 'punctuation', message: 'Missing space after punctuation', suggestion: '$1 $2' },
    
    // Capitalization
    { pattern: /\bi\b(?=\s)/g, type: 'capitalization', message: 'Capitalization error', suggestion: 'I' },
    { pattern: /^([a-z])/gm, type: 'capitalization', message: 'Sentence should start with capital letter', suggestion: 'Capitalize' }
  ];

  // Update stats
  function updateStats(text) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const sentences = text ? (text.match(/[.!?]+/g) || []).length : 0;
    
    wordCount.textContent = words;
    charCount.textContent = chars;
    sentenceCount.textContent = sentences || 0;
  }

  // Check grammar
  window.checkGrammar = function() {
    const text = textInput.value;
    
    if (!text.trim()) {
      if (window.Utils && window.Utils.showNotification) {
        window.Utils.showNotification('Please enter some text to check', 'error');
      }
      return;
    }

    const issues = [];

    // Check each rule
    grammarRules.forEach(rule => {
      let match;
      const regex = new RegExp(rule.pattern);
      
      while ((match = regex.exec(text)) !== null) {
        issues.push({
          type: rule.type,
          message: rule.message,
          suggestion: rule.suggestion,
          match: match[0],
          index: match.index
        });
      }
    });

    displayIssues(issues);
    updateStats(text);
  };

  // Display issues
  function displayIssues(issues) {
    issueCount.textContent = issues.length;

    if (issues.length === 0) {
      issuesContainer.innerHTML = `
        <div class="no-issues">
          <div class="no-issues-icon">✅</div>
          <p><strong>Great job!</strong> No grammar or spelling issues found.</p>
        </div>
      `;
      return;
    }

    issuesContainer.innerHTML = issues.map((issue, index) => `
      <div class="issue-item">
        <span class="issue-type ${issue.type}">${issue.type.toUpperCase()}</span>
        <div class="issue-text">
          Found: <strong>"${issue.match}"</strong>
        </div>
        <div class="issue-suggestion">
          ${issue.message}: <strong>${issue.suggestion}</strong>
        </div>
      </div>
    `).join('');
  }

  // Clear all
  window.clearAll = function() {
    textInput.value = '';
    issuesContainer.innerHTML = `
      <div class="no-issues">
        <div class="no-issues-icon">✅</div>
        <p>No issues found yet. Start typing to check your grammar!</p>
      </div>
    `;
    wordCount.textContent = '0';
    charCount.textContent = '0';
    sentenceCount.textContent = '0';
    issueCount.textContent = '0';
  };

  // Auto-update stats on input
  textInput.addEventListener('input', () => {
    updateStats(textInput.value);
  });

  // Initial stats
  updateStats('');
})();
