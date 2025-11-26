// Chart.js Utilities
// Create charts for analytics and data visualization

(function() {
  'use strict';

  // Check if Chart.js is available
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js is not loaded. Charts will not work.');
    return;
  }

  // Default chart configuration
  const defaultConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true
      }
    }
  };

  // Create bar chart
  window.createBarChart = function(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        ...defaultConfig,
        ...options
      }
    });
  };

  // Create line chart
  window.createLineChart = function(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        ...defaultConfig,
        ...options
      }
    });
  };

  // Create pie chart
  window.createPieChart = function(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'pie',
      data: data,
      options: {
        ...defaultConfig,
        ...options
      }
    });
  };

  // Create doughnut chart
  window.createDoughnutChart = function(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        ...defaultConfig,
        ...options
      }
    });
  };

  // Get tool usage statistics from localStorage
  window.getToolUsageStats = function() {
    try {
      const stats = JSON.parse(localStorage.getItem('toolUsageStats') || '{}');
      return stats;
    } catch (e) {
      return {};
    }
  };

  // Track tool usage
  window.trackToolUsage = function(toolName, toolUrl) {
    try {
      const stats = getToolUsageStats();
      const key = toolUrl || toolName;
      
      if (!stats[key]) {
        stats[key] = {
          name: toolName,
          url: toolUrl,
          count: 0,
          lastUsed: null
        };
      }
      
      stats[key].count++;
      stats[key].lastUsed = new Date().toISOString();
      
      localStorage.setItem('toolUsageStats', JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to track tool usage:', e);
    }
  };

  // Create usage statistics chart
  window.createUsageChart = function(canvasId) {
    const stats = getToolUsageStats();
    const tools = Object.values(stats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 tools

    const labels = tools.map(t => t.name);
    const data = tools.map(t => t.count);

    return createBarChart(canvasId, {
      labels: labels,
      datasets: [{
        label: 'Usage Count',
        data: data,
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1
      }]
    }, {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    });
  };

  // Auto-track tool usage on tool pages
  if (window.location.pathname.includes('/tools/')) {
    const toolName = document.querySelector('.tool-title')?.textContent || 
                     window.location.pathname.split('/').pop().replace('.html', '');
    const toolUrl = window.location.pathname;
    
    trackToolUsage(toolName, toolUrl);
  }

  console.log('Chart.js utilities initialized');
})();

