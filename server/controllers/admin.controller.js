const jwt = require('jsonwebtoken');

exports.adminLogin = (req, res) => {
  const { username, password } = req.body;
  console.log('\ud83d\udd11 Admin login attempt');
  console.log('Received username:', username);
  console.log('Expected username:', process.env.ADMIN_USERNAME);
  console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
  
  if (!username || !password) {
    console.log('❌ Missing login fields');
    return res.status(400).json({ msg: 'Please provide both username and password' });
  }

  const expectedUser = (process.env.ADMIN_USERNAME || 'prithwi1016').trim();
  const expectedPass = (process.env.ADMIN_PASSWORD || 'Prithwi_1100');

  if (username.trim() !== expectedUser || password !== expectedPass) {
    console.log('❌ Invalid admin credentials');
    return res.status(401).json({ msg: 'Invalid username or password' });
  }

  try {
    const token = jwt.sign(
      { isAdmin: true, username: username.trim() }, 
      process.env.JWT_SECRET || 'notesvilla_super_secret_jwt_key_2025_very_long_and_secure_string', 
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    console.log('✅ Admin token generated successfully');
    res.json({ token, success: true });
  } catch (error) {
    console.log('\u274c Token generation failed:', error.message);
    res.status(500).json({ msg: 'Token generation failed', error: error.message });
  }
};
