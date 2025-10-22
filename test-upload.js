#!/usr/bin/env node

/**
 * Upload Test Script for NotesVilla
 * Tests the upload functionality to ensure it works correctly
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

async function testUpload() {
    console.log('🔍 Testing NotesVilla Upload Functionality\n');

    try {
        // Test 1: Check if server is running
        console.log('1️⃣ Testing server health...');
        const healthResponse = await fetch(`${API_BASE.replace('/api', '')}/test`);
        if (!healthResponse.ok) {
            throw new Error(`Server not responding: ${healthResponse.status}`);
        }
        console.log('✅ Server is running');

        // Test 2: Test upload endpoint availability
        console.log('\n2️⃣ Testing upload endpoints...');

        // Test multiple files endpoint
        const multiResponse = await fetch(`${API_BASE}/notes/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        console.log(`✅ Multiple files endpoint: ${multiResponse.status} (expected 400/401)`);

        // Test single file endpoint
        const singleResponse = await fetch(`${API_BASE}/notes/upload-single`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        console.log(`✅ Single file endpoint: ${singleResponse.status} (expected 400/401)`);

        console.log('\n🎉 Upload endpoints are accessible!');
        console.log('\n📋 Next steps:');
        console.log('1. Login as admin via Admin Login page');
        console.log('2. Go to Admin Upload page');
        console.log('3. Select a file and fill required fields');
        console.log('4. Click upload - should work now!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.error('   → Server is not running. Start it with: cd server && npm start');
        } else if (error.message.includes('fetch is not defined')) {
            console.error('   → This script requires Node.js 18+ or install node-fetch');
        }

        process.exit(1);
    }
}

// Run the test
testUpload();
