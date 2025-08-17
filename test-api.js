// test-api.js - Simple API testing script
// Run with: node test-api.js

const BASE_URL = 'http://localhost:3000/api';

// Test function
async function testAPI() {
    console.log('🔍 Testing Hospital Management API\n');

    // Test 1: Get all patients
    console.log('1. Testing GET /api/patients');
    try {
        const response = await fetch(`${BASE_URL}/patients`);
        const data = await response.json();
        console.log('✅ Success:', data.length, 'patients found');
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    // Test 2: Register new patient (JSON)
    console.log('\n2. Testing POST /api/patients (JSON)');
    try {
        const response = await fetch(`${BASE_URL}/patients/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test Patient',
                email: `test${Date.now()}@example.com`,
                phone: '9876543210'
            })
        });
        const data = await response.json();
        console.log('✅ Registration:', data.message);
        console.log('📧 Email sent:', data.emailSent ? 'Yes' : 'No');
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n🏁 API Test Complete');
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or install node-fetch');
    console.log('Alternative: Use the HTML test page instead');
} else {
    testAPI();
}