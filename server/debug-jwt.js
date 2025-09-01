require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('=== JWT Debug Tool ===\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Present' : '❌ Missing');
console.log('   JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'N/A');
console.log('   ADMIN_USERNAME:', process.env.ADMIN_USERNAME || 'Not set');
console.log('   JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || 'Not set');

// Generate a test admin token
console.log('\n2. Generating Test Admin Token:');
try {
  const testToken = jwt.sign(
    { isAdmin: true, username: process.env.ADMIN_USERNAME || 'testuser' }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
  console.log('   ✅ Token generated successfully');
  console.log('   Token preview:', testToken.substring(0, 50) + '...');
  
  // Verify the test token
  console.log('\n3. Verifying Test Token:');
  const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
  console.log('   ✅ Token verified successfully');
  console.log('   Decoded payload:', decoded);
  
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

// Check a provided token (if you want to test your current token)
const providedToken = process.argv[2];
if (providedToken) {
  console.log('\n4. Testing Provided Token:');
  try {
    // First decode without verification
    const unverified = jwt.decode(providedToken);
    console.log('   Unverified payload:', unverified);
    
    // Then try to verify
    const verified = jwt.verify(providedToken, process.env.JWT_SECRET);
    console.log('   ✅ Provided token is valid');
    console.log('   Verified payload:', verified);
  } catch (error) {
    console.log('   ❌ Provided token error:', error.message);
    if (error.message === 'invalid signature') {
      console.log('   💡 Solution: Re-login to get a new token with current JWT_SECRET');
    }
  }
}

console.log('\n=== Instructions ===');
console.log('1. If JWT_SECRET is missing, add it to your .env file');
console.log('2. If you get "invalid signature", clear your browser localStorage and re-login');
console.log('3. To test a specific token, run: node debug-jwt.js "your_token_here"');
console.log('\n=== Quick Fix ===');
console.log('🔧 Clear browser localStorage:');
console.log('   - Open DevTools > Application > Local Storage');
console.log('   - Delete the "token" key');
console.log('   - Go to /admin/login and login again');