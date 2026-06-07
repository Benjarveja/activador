const express = require('express');
const router = express.Router();
const activationController = require('../controllers/activation.controller');
const validator = require('../middleware/validator');

// POST /api/generate
router.post('/generate', validator.validateActivationRequest, activationController.generateCID);

module.exports = router;
