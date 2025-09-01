const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('🔐 Admin middleware called');
  console.log('Authorization header:', req.headers.authorization);
  console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
  console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'undefined');
  
  const authHeader = req.headers.authorization;
  if(!authHeader) {
    console.log('❌ No authorization header');
    return res.status(401).json({ msg: 'Missing token' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('🎫 Token extracted:', token ? token.substring(0, 20) + '...' : 'null');
  
  try {
    // Try to decode token without verification first to see its contents
    const decoded_unverified = jwt.decode(token);
    console.log('📋 Token payload (unverified):', decoded_unverified);
    
    // Now try to verify with current JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully:', decoded);
    
    if(!decoded.isAdmin) {
      console.log('❌ Not an admin. Token payload:', decoded);
      return res.status(403).json({ msg: 'Not admin' });
    }
    
    console.log('✅ Admin verification passed');
    req.admin = decoded;
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    console.log('Error type:', err.name);
    
    // Additional debugging for signature errors
    if (err.message === 'invalid signature') {
      console.log('🔍 Signature mismatch detected. This means:');
      console.log('   - Token was signed with different JWT_SECRET');
      console.log('   - Need to re-login to get new token with current secret');
    }
    
    return res.status(401).json({ 
      msg: 'Token invalid',
      error: err.message,
      errorType: err.name,
      solution: err.message === 'invalid signature' ? 'Please re-login to get a new token' : 'Check token format',
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
    });
  }
};
