#!/usr/bin/env node

/**
 * Quick Server Test Script
 * Tests if the server is running and responding correctly
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

async function testServer() {
    console.log('🔍 Testing NotesVilla Server...\n');

    try {
        // Test 1: Basic server health
        console.log('1️⃣ Testing server health...');
        const healthResponse = await axios.get(`${API_BASE.replace('/api', '')}/test`, {
            timeout: 5000
        });
        console.log('✅ Server is running:', healthResponse.data);

        // Test 2: Subjects endpoint
        console.log('\n2️⃣ Testing subjects endpoint...');
        const subjectsResponse = await axios.get(`${API_BASE}/notes/subjects`, {
            timeout: 10000
        });
        console.log('✅ Subjects response:', subjectsResponse.data);
        console.log('   - Type:', Array.isArray(subjectsResponse.data) ? 'Array' : typeof subjectsResponse.data);
        console.log('   - Length:', subjectsResponse.data?.length || 0);

        // Test 3: Notes endpoint
        console.log('\n3️⃣ Testing notes endpoint...');
        const notesResponse = await axios.get(`${API_BASE}/notes`, {
            timeout: 10000
        });
        console.log('✅ Notes response type:', typeof notesResponse.data);

        if (notesResponse.data.notes) {
            console.log('   - New format detected (with pagination)');
            console.log('   - Notes count:', notesResponse.data.notes.length);
            console.log('   - Total notes:', notesResponse.data.pagination?.totalNotes || 0);
        } else if (Array.isArray(notesResponse.data)) {
            console.log('   - Old format detected (direct array)');
            console.log('   - Notes count:', notesResponse.data.length);
        } else {
            console.log('   - Unknown format:', notesResponse.data);
        }

        console.log('\n🎉 Server test completed successfully!');

    } catch (error) {
        console.error('❌ Server test failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('   → Server is not running. Start it with: cd server && npm start');
        } else if (error.code === 'ECONNABORTED') {
            console.error('   → Request timed out. Server might be slow or overloaded.');
        } else if (error.response) {
            console.error('   → Server responded with error:', error.response.status);
            console.error('   → Response:', error.response.data);
        }

        process.exit(1);
    }
}

// Run the test
testServer();
