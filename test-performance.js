#!/usr/bin/env node

/**
 * Performance Test Script for NotesVilla
 * Tests the optimized API endpoints to verify performance improvements
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

async function testPerformance() {
    console.log('🚀 Testing NotesVilla Performance Optimizations\n');

    try {
        // Test 1: Get all notes with pagination
        console.log('📋 Test 1: Fetching notes with pagination...');
        const startTime1 = Date.now();
        const notesResponse = await axios.get(`${API_BASE}/notes?page=1&limit=20`, {
            timeout: 10000
        });
        const endTime1 = Date.now();

        console.log(`✅ Notes loaded in ${endTime1 - startTime1}ms`);
        console.log(`   - Notes returned: ${notesResponse.data.notes?.length || 0}`);
        console.log(`   - Total notes: ${notesResponse.data.pagination?.totalNotes || 0}`);
        console.log(`   - Current page: ${notesResponse.data.pagination?.currentPage || 1}`);
        console.log(`   - Total pages: ${notesResponse.data.pagination?.totalPages || 1}\n`);

        // Test 2: Get subjects
        console.log('📚 Test 2: Fetching subjects...');
        const startTime2 = Date.now();
        const subjectsResponse = await axios.get(`${API_BASE}/notes/subjects`, {
            timeout: 10000
        });
        const endTime2 = Date.now();

        console.log(`✅ Subjects loaded in ${endTime2 - startTime2}ms`);
        console.log(`   - Subjects found: ${subjectsResponse.data?.length || 0}\n`);

        // Test 3: Test pagination (if more than 1 page)
        if (notesResponse.data.pagination?.totalPages > 1) {
            console.log('📄 Test 3: Testing pagination (page 2)...');
            const startTime3 = Date.now();
            const page2Response = await axios.get(`${API_BASE}/notes?page=2&limit=20`, {
                timeout: 10000
            });
            const endTime3 = Date.now();

            console.log(`✅ Page 2 loaded in ${endTime3 - startTime3}ms`);
            console.log(`   - Notes on page 2: ${page2Response.data.notes?.length || 0}\n`);
        }

        // Performance Summary
        console.log('📊 Performance Summary:');
        console.log(`   - Notes API: ${endTime1 - startTime1}ms`);
        console.log(`   - Subjects API: ${endTime2 - startTime2}ms`);

        const avgResponseTime = (endTime1 - startTime1 + endTime2 - startTime2) / 2;
        console.log(`   - Average response time: ${avgResponseTime.toFixed(2)}ms`);

        if (avgResponseTime < 1000) {
            console.log('🎉 Excellent performance! (< 1 second)');
        } else if (avgResponseTime < 3000) {
            console.log('✅ Good performance (< 3 seconds)');
        } else {
            console.log('⚠️ Performance could be improved (> 3 seconds)');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        process.exit(1);
    }
}

// Run the test
testPerformance();
