# 24ToolHub Testing Documentation

This document describes the comprehensive end-to-end testing suite for 24ToolHub.

## Overview

The testing suite covers both **backend** and **frontend** components with full end-to-end integration tests. The tests are written using Jest and Supertest.

## Test Structure

```
__tests__/
├── backend/           # Backend API and module tests
│   ├── server.test.js        # Express server and API endpoint tests
│   ├── ai-config.test.js     # AI configuration module tests
│   └── ai-service.test.js    # AI service module tests
├── frontend/          # Frontend component tests
│   └── frontend.test.js      # JavaScript, HTML, and CSS tests
└── integration/       # End-to-end integration tests
    └── integration.test.js   # Complete user journey tests
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test Suites
```bash
npm run test:backend       # Backend tests only
npm run test:frontend      # Frontend tests only
npm run test:integration   # Integration tests only
```

## Test Coverage

### Backend Tests (64 tests)

#### Server API Tests
- **Static File Serving** (3 tests)
  - Index page loading
  - About page loading
  - Contact page loading

- **SEO Analyzer API** (3 tests)
  - Parameter validation
  - Error handling
  - URL analysis (skipped - requires external HTTP call)

- **DNS Lookup API** (3 tests)
  - Parameter validation
  - Valid DNS queries
  - Record type handling

- **PageSpeed API** (2 tests)
  - URL validation
  - API key verification

- **Chatbot API** (3 tests)
  - Message validation
  - Conversation history handling
  - API key verification

- **Static Assets** (3 tests)
  - CSS file serving
  - JavaScript file serving
  - Images directory access

- **Error Handling** (2 tests)
  - 404 handling
  - Method not allowed handling

- **CORS Configuration** (2 tests)
  - CORS headers verification
  - OPTIONS request handling

#### AI Configuration Tests (22 tests)
- Model tier definitions
- Endpoint mappings
- Available models filtering
- Cost optimization
- Fallback chain construction

#### AI Service Tests (20 tests)
- Module exports verification
- Gemini initialization
- Provider call handling
- Fallback system logic
- Message format validation

### Frontend Tests (26 tests)

- **JavaScript Files** (4 tests)
  - Main JavaScript existence
  - Chatbot module
  - SEO Analyzer module
  - Utils module

- **HTML Pages** (3 tests)
  - Index page structure
  - Tool pages existence
  - Content validation

- **CSS Files** (2 tests)
  - Stylesheet existence
  - Style content validation

- **JavaScript Code Quality** (3 tests)
  - Chatbot code validation
  - SEO Analyzer code validation
  - Main.js validation

- **Tool-Specific JavaScript** (5 tests)
  - Password generator
  - JSON formatter
  - Base64 encoder
  - UUID generator
  - QR code generator

- **API Endpoint Configuration** (3 tests)
  - SEO Analyzer endpoints
  - DNS Lookup endpoints
  - Chatbot endpoints

- **HTML Structure** (2 tests)
  - Tool page consistency
  - JavaScript file references

- **Configuration Files** (2 tests)
  - Tools database validation
  - Tool field validation

- **Asset Files** (3 tests)
  - Favicon
  - Robots.txt
  - Sitemap.xml

### Integration Tests (23 tests)

- **User Journey Tests** (2 tests)
  - Homepage to tool navigation
  - Static assets loading

- **API Integration Flow** (2 tests)
  - Complete chat flow
  - DNS lookup flow

- **Error Recovery** (3 tests)
  - Missing API key handling
  - Malformed request handling
  - Invalid data handling

- **Data Consistency** (2 tests)
  - Tools database consistency
  - AI configuration consistency

- **Performance** (3 tests)
  - Homepage load time
  - Static assets load time
  - API response time

- **Security** (3 tests)
  - Sensitive information masking
  - CORS configuration
  - OPTIONS request handling

- **Content Types** (4 tests)
  - HTML content type
  - CSS content type
  - JavaScript content type
  - JSON API responses

- **Deployment Readiness** (4 tests)
  - Vercel export verification
  - Configuration file validation
  - Environment file verification
  - Gitignore validation

## Test Statistics

- **Total Test Suites**: 5
- **Total Tests**: 104
- **Passing Tests**: 103
- **Skipped Tests**: 1 (external HTTP call)
- **Coverage**: 
  - Backend: Server, AI Config, AI Service
  - Frontend: All tool pages, JavaScript, HTML, CSS
  - Integration: Complete user workflows

## Test Environment

### Dependencies
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **Node.js**: Runtime environment

### Configuration
- Jest configuration: `jest.config.js`
- Test timeout: 30 seconds
- Coverage directory: `coverage/`

### Environment Variables
Tests use mock environment variables:
- `GEMINI_API_KEY`: test-key
- `PAGESPEED_API_KEY`: test-key

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

1. **Fast Execution**: All tests complete in ~2 seconds
2. **No External Dependencies**: Most tests are isolated
3. **Clear Error Messages**: Detailed failure descriptions
4. **Exit Codes**: Proper exit codes for CI/CD integration

## Writing New Tests

### Backend API Test Example
```javascript
test('GET /new-endpoint should work', async () => {
  const response = await request(app)
    .get('/new-endpoint')
    .expect(200);
  
  expect(response.body).toHaveProperty('data');
});
```

### Frontend Test Example
```javascript
test('New tool should exist', () => {
  const toolPath = path.join(__dirname, '../../tools/new-tool.html');
  expect(fs.existsSync(toolPath)).toBe(true);
});
```

### Integration Test Example
```javascript
test('Complete user flow', async () => {
  // Step 1
  const step1 = await request(app).get('/').expect(200);
  
  // Step 2
  const step2 = await request(app).get('/tool').expect(200);
  
  // Step 3
  const step3 = await request(app)
    .post('/api')
    .send({ data: 'test' })
    .expect(200);
});
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up resources after tests
3. **Mocking**: Mock external APIs and services
4. **Assertions**: Use specific assertions
5. **Descriptions**: Write clear test descriptions
6. **Coverage**: Aim for high code coverage
7. **Speed**: Keep tests fast (<30s total)

## Troubleshooting

### Port Already in Use
If you see "EADDRINUSE" errors:
- Server.js now conditionally starts only when run directly
- Not started when imported for testing

### Timeout Errors
If tests timeout:
- Check network connectivity
- Verify API keys are set
- Increase timeout in jest.config.js

### Failed API Tests
If API tests fail:
- Verify server.js is exportable
- Check environment variables
- Ensure dependencies are installed

## Coverage Reports

After running tests with coverage:
```bash
npm run test:coverage
```

View the HTML coverage report:
```bash
open coverage/index.html
```

Coverage is collected for:
- `server.js`
- `ai-service.js`
- `ai-config.js`

## Future Enhancements

Potential additions to the test suite:

1. **Browser Testing**: Add Puppeteer/Playwright for real browser tests
2. **Load Testing**: Add performance benchmarks
3. **Security Testing**: Add OWASP security tests
4. **Accessibility Testing**: Add WCAG compliance tests
5. **Visual Regression**: Add screenshot comparison tests
6. **E2E with Real APIs**: Add tests with real API keys (optional)

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass before committing
3. Update this documentation
4. Maintain test coverage above 80%
5. Follow existing test patterns

## Support

For questions or issues with tests:
- Check the test output for specific errors
- Review this documentation
- Check Jest documentation: https://jestjs.io/
- Check Supertest documentation: https://github.com/visionmedia/supertest
