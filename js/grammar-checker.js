// Grammar Checker Logic
;(() => {
  const textInput = document.getElementById('textInput');
  const issuesContainer = document.getElementById('issuesContainer');
  const wordCount = document.getElementById('wordCount');
  const charCount = document.getElementById('charCount');
  const sentenceCount = document.getElementById('sentenceCount');
  const issueCount = document.getElementById('issueCount');

  // Common grammar rules and patterns (expanded)
  const grammarRules = [
    // Spelling mistakes - Common misspellings
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
    { pattern: /\bembarass\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'embarrass' },
    { pattern: /\bexistance\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'existence' },
    { pattern: /\bexcersise\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'exercise' },
    { pattern: /\bguarentee\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'guarantee' },
    { pattern: /\bindependant\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'independent' },
    { pattern: /\blisence\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'license' },
    { pattern: /\bmispell\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'misspell' },
    { pattern: /\bpriviledge\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'privilege' },
    { pattern: /\bpublicly\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'publicly' },
    { pattern: /\brecomend\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'recommend' },
    { pattern: /\brelevent\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'relevant' },
    { pattern: /\brythm\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'rhythm' },
    { pattern: /\bsuprise\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'surprise' },
    { pattern: /\bthier\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'their' },
    { pattern: /\buntill\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'until' },
    { pattern: /\bwritting\b/gi, type: 'spelling', message: 'Misspelling', suggestion: 'writing' },
    
    // Grammar issues - Common mistakes
    { pattern: /\byour welcome\b/gi, type: 'grammar', message: 'Grammar error', suggestion: "you're welcome" },
    { pattern: /\bshould of\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'should have' },
    { pattern: /\bcould of\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'could have' },
    { pattern: /\bwould of\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'would have' },
    { pattern: /\bmight of\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'might have' },
    { pattern: /\bmust of\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'must have' },
    { pattern: /\bits a\b/gi, type: 'grammar', message: 'Possible contraction error', suggestion: "it's" },
    { pattern: /\bits the\b/gi, type: 'grammar', message: 'Possible contraction error', suggestion: "it's the" },
    { pattern: /\bits not\b/gi, type: 'grammar', message: 'Possible contraction error', suggestion: "it's not" },
    { pattern: /\btheir is\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'there is' },
    { pattern: /\btheir are\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'there are' },
    { pattern: /\bthey're is\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'there is' },
    { pattern: /\bthey're are\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'there are' },
    { pattern: /\ba lot\b/gi, type: 'grammar', message: 'Note', suggestion: 'a lot (two words)' },
    { pattern: /\ballot\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'a lot' },
    { pattern: /\bless then\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'less than' },
    { pattern: /\bmore then\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'more than' },
    { pattern: /\bwho's\b/gi, type: 'grammar', message: 'Possible error', suggestion: "who is or whose" },
    { pattern: /\bwhos\b/gi, type: 'grammar', message: 'Grammar error', suggestion: "who's or whose" },
    { pattern: /\bwho's responsibility\b/gi, type: 'grammar', message: 'Grammar error', suggestion: "whose responsibility" },
    { pattern: /\bwho's fault\b/gi, type: 'grammar', message: 'Grammar error', suggestion: "whose fault" },
    { pattern: /\baffect vs effect\b/gi, type: 'grammar', message: 'Note', suggestion: 'affect (verb) vs effect (noun)' },
    { pattern: /\bcomplement vs compliment\b/gi, type: 'grammar', message: 'Note', suggestion: 'complement (complete) vs compliment (praise)' },
    { pattern: /\bprinciple vs principal\b/gi, type: 'grammar', message: 'Note', suggestion: 'principle (rule) vs principal (main)' },
    
    // Subject-verb agreement
    { pattern: /\b(he|she|it) (are|were)\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: '$1 is/was' },
    { pattern: /\b(they|we|you) (is|was)\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: '$1 are/were' },
    { pattern: /\beach of (them|us|you) (are|were)\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'each of $1 is/was' },
    { pattern: /\beveryone (are|were)\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'everyone is/was' },
    { pattern: /\beverybody (are|were)\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'everybody is/was' },
    { pattern: /\bsomeone (are|were)\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'someone is/was' },
    { pattern: /\bsomebody (are|were)\b/gi, type: 'grammar', message: 'Subject-verb agreement', suggestion: 'somebody is/was' },
    
    // Double spaces and spacing
    { pattern: /  +/g, type: 'punctuation', message: 'Extra spaces', suggestion: 'single space' },
    { pattern: /\t+/g, type: 'punctuation', message: 'Tab characters', suggestion: 'spaces' },
    
    // Missing space after punctuation
    { pattern: /([.!?,;:])([A-Za-z])/g, type: 'punctuation', message: 'Missing space after punctuation', suggestion: '$1 $2' },
    { pattern: /([.!?])([A-Za-z])/g, type: 'punctuation', message: 'Missing space after sentence end', suggestion: '$1 $2' },
    
    // Extra space before punctuation
    { pattern: /\s+([.!?,;:])/g, type: 'punctuation', message: 'Extra space before punctuation', suggestion: '$1' },
    
    // Missing punctuation
    { pattern: /([a-z])\s+([A-Z])/g, type: 'punctuation', message: 'Possible missing punctuation', suggestion: 'Check sentence ending' },
    
    // Capitalization errors
    { pattern: /\bi\b(?=\s)/g, type: 'capitalization', message: 'Capitalization error', suggestion: 'I' },
    { pattern: /^([a-z])/gm, type: 'capitalization', message: 'Sentence should start with capital letter', suggestion: 'Capitalize' },
    { pattern: /([.!?]\s+)([a-z])/g, type: 'capitalization', message: 'Sentence should start with capital letter', suggestion: 'Capitalize after sentence end' },
    
    // Common word confusions
    { pattern: /\bto much\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'too much' },
    { pattern: /\bto many\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'too many' },
    { pattern: /\bto long\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'too long' },
    { pattern: /\bto short\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'too short' },
    { pattern: /\bto big\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'too big' },
    { pattern: /\bto small\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'too small' },
    { pattern: /\bto late\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'too late' },
    { pattern: /\bto early\b/gi, type: 'grammar', message: 'Grammar error', suggestion: 'too early' },
    
    // Apostrophe errors
    { pattern: /\bits\b(?=\s)/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "it's or its" },
    { pattern: /\byour\b(?=\s+(welcome|name|email|phone|address))/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "you're" },
    { pattern: /\bwont\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "won't" },
    { pattern: /\bcant\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "can't" },
    { pattern: /\bdont\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "don't" },
    { pattern: /\bisnt\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "isn't" },
    { pattern: /\barent\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "aren't" },
    { pattern: /\bwasnt\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "wasn't" },
    { pattern: /\bwerent\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "weren't" },
    { pattern: /\bhasnt\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "hasn't" },
    { pattern: /\bhavent\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "haven't" },
    { pattern: /\bhadnt\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "hadn't" },
    { pattern: /\bdoesnt\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "doesn't" },
    { pattern: /\bdidnt\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "didn't" },
    { pattern: /\bwouldnt\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "wouldn't" },
    { pattern: /\bcouldnt\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "couldn't" },
    { pattern: /\bshouldnt\b/gi, type: 'grammar', message: 'Possible apostrophe error', suggestion: "shouldn't" },
    
    // Redundant words
    { pattern: /\bvery unique\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'unique (unique is absolute)' },
    { pattern: /\bmore unique\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'unique' },
    { pattern: /\bmost unique\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'unique' },
    { pattern: /\bvery perfect\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'perfect' },
    { pattern: /\bvery complete\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'complete' },
    { pattern: /\bvery empty\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'empty' },
    { pattern: /\bvery full\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'full' },
    { pattern: /\brevert back\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'revert' },
    { pattern: /\breturn back\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'return' },
    { pattern: /\badvance forward\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'advance' },
    { pattern: /\bcontinue on\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'continue' },
    { pattern: /\bfirst time ever\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'first time' },
    { pattern: /\bend result\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'result' },
    { pattern: /\bfinal outcome\b/gi, type: 'grammar', message: 'Redundant', suggestion: 'outcome' },
    
    // Common phrases
    { pattern: /\bfor all intensive purposes\b/gi, type: 'grammar', message: 'Common mistake', suggestion: 'for all intents and purposes' },
    { pattern: /\bI could care less\b/gi, type: 'grammar', message: 'Common mistake', suggestion: "I couldn't care less" },
    { pattern: /\bone in the same\b/gi, type: 'grammar', message: 'Common mistake', suggestion: 'one and the same' },
    { pattern: /\bdeep-seeded\b/gi, type: 'grammar', message: 'Common mistake', suggestion: 'deep-seated' },
    { pattern: /\bcase and point\b/gi, type: 'grammar', message: 'Common mistake', suggestion: 'case in point' },
    { pattern: /\bchomping at the bit\b/gi, type: 'grammar', message: 'Common mistake', suggestion: 'champing at the bit' },
    { pattern: /\bcurb your enthusiasm\b/gi, type: 'grammar', message: 'Note', suggestion: 'curb (restrain) vs curve (bend)' },
    
    // Numbers and dates
    { pattern: /\b(\d+)\s+(am|pm)\b/gi, type: 'punctuation', message: 'Missing colon in time', suggestion: '$1:00 $2' },
    { pattern: /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, type: 'punctuation', message: 'Date format', suggestion: 'Check date format (MM/DD/YYYY or DD/MM/YYYY)' },
    
    // Quotation marks
    { pattern: /"/g, type: 'punctuation', message: 'Straight quotes', suggestion: 'Use curly quotes if needed' },
    { pattern: /'/g, type: 'punctuation', message: 'Straight apostrophe', suggestion: 'Use curly apostrophe if needed' }
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
