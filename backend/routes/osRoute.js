const express = require('express');
const router = express.Router();
const controller = require('../controllers/osController');

router.get('/', controller.getAllOS);
router.get('/:id', controller.getOSById);
router.post('/', controller.createOS);

module.exports = router;