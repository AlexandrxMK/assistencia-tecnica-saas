const express = require('express');
const router = express.Router();
const controller = require('../controllers/cargoController');

router.get('/', controller.getAllCargos);
router.post('/', controller.createCargo);

module.exports = router;