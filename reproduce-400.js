const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_BASE = 'http://localhost:5000/api';
const ADMIN_CREDENTIALS = {
    username: 'prithwi1016',
    password: 'Prithwi_1100'
};

async function runTest() {
    try {
        console.log('🚀 Starting 400 Error Reproduction Test...');

        // 1. Login
        console.log('\n🔑 Logging in...');
        const loginRes = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ADMIN_CREDENTIALS)
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Login successful.');

        // 2. Create dummy file
        const dummyFilePath = path.join(__dirname, 'repro-dummy.txt');
        fs.writeFileSync(dummyFilePath, 'Dummy content for reproduction test.');

        // 3. Test Case 1: Valid Upload (Control)
        console.log('\n🧪 Test Case 1: Valid Upload');
        await attemptUpload(token, dummyFilePath, {
            title: 'Valid Note',
            description: 'This should work',
            subjectName: 'Testing',
            date: new Date().toISOString().split('T')[0]
        });

        // 4. Test Case 2: Missing Title
        console.log('\n🧪 Test Case 2: Missing Title');
        await attemptUpload(token, dummyFilePath, {
            description: 'Missing title',
            subjectName: 'Testing',
            date: new Date().toISOString().split('T')[0]
        });

        // 5. Test Case 3: Missing Subject
        console.log('\n🧪 Test Case 3: Missing Subject');
        await attemptUpload(token, dummyFilePath, {
            title: 'Missing Subject',
            description: 'Missing subject',
            date: new Date().toISOString().split('T')[0]
        });

        // 6. Test Case 4: Missing Date
        console.log('\n🧪 Test Case 4: Missing Date');
        await attemptUpload(token, dummyFilePath, {
            title: 'Missing Date',
            description: 'Missing date',
            subjectName: 'Testing'
        });

        // Cleanup
        fs.unlinkSync(dummyFilePath);
        console.log('\n🏁 Test completed.');

    } catch (err) {
        console.error('\n❌ Test Suite Failed:', err.message);
    }
}

async function attemptUpload(token, filePath, fields) {
    return new Promise((resolve) => {
        const form = new FormData();
        if (fields.title) form.append('title', fields.title);
        if (fields.description) form.append('description', fields.description);
        if (fields.subjectName) form.append('subjectName', fields.subjectName);
        if (fields.date) form.append('date', fields.date);
        form.append('file', fs.createReadStream(filePath));

        form.submit({
            host: 'localhost',
            port: 5000,
            path: '/api/notes/upload-single',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }, (err, res) => {
            if (err) {
                console.log('  ❌ Network Error:', err.message);
                resolve();
                return;
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`  Status: ${res.statusCode}`);
                if (res.statusCode >= 400) {
                    console.log(`  Response: ${data}`);
                } else {
                    console.log('  ✅ Success');
                }
                resolve();
            });
        });
    });
}

runTest();
