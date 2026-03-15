const express = require('express');
const router = express.Router();
const controller = require('../controllers/osController');

router.get('/', controller.getAllOS);
router.get('/:id', controller.getOSById);
router.get('/:id/status', controller.getPublicOS)
router.get('/:id/total', controller.getValorTotalOS)
router.post('/', controller.createOS);
router.patch('/:id/status', controller.patchStatusOs);

module.exports = router;