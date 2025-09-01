const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');

router.post('/login', adminCtrl.adminLogin);

module.exports = router;
