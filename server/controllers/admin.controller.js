const jwt = require('jsonwebtoken');

exports.adminLogin = (req, res) => {
  const { username, password } = req.body;
  console.log('\ud83d\udd11 Admin login attempt');
  console.log('Received username:', username);
  console.log('Expected username:', process.env.ADMIN_USERNAME);
  console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
  
  if (!username || !password) {
    console.log('\u274c Missing fields');
    return res.status(400).json({ msg: 'Missing fields' });
  }

  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    console.log('\u274c Invalid credentials');
    return res.status(401).json({ msg: 'Invalid credentials' });
  }

  try {
    const token = jwt.sign({ isAdmin: true, username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    console.log('\u2705 Admin token generated successfully');
    console.log('Token preview:', token.substring(0, 20) + '...');
    res.json({ token });
  } catch (error) {
    console.log('\u274c Token generation failed:', error.message);
    res.status(500).json({ msg: 'Token generation failed', error: error.message });
  }
};
