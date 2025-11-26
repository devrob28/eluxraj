// test-api.js - API Testing Script
const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: JSON.parse(body) });
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing ELUXRAJ API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing /api/status...');
    const status = await makeRequest('GET', '/api/status');
    console.log('✓ Status:', status.data.ok ? 'PASS' : 'FAIL');

    // Test 2: AI Signal
    console.log('\n2. Testing /api/ai-signal...');
    const signal = await makeRequest('GET', '/api/ai-signal');
    console.log('✓ AI Signal:', signal.data.signal);

    // Test 3: Application submission
    console.log('\n3. Testing /api/apply...');
    const apply = await makeRequest('POST', '/api/apply', {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      netWorthRange: '$1M–$5M',
      interests: 'Testing'
    });
    console.log('✓ Application:', apply.data.ok ? 'PASS' : 'FAIL');

    // Test 4: Invalid email
    console.log('\n4. Testing validation (should fail)...');
    const invalid = await makeRequest('POST', '/api/apply', {
      name: 'Test',
      email: 'invalid-email'
    });
    console.log('✓ Validation:', invalid.status === 400 ? 'PASS' : 'FAIL');

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
