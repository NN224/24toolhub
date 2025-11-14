const app = require('./api/server');

const port = process.env.PORT || 5000;

// Only start the server if this file is run directly
// When imported by tests or Vercel, it just exports the app
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
