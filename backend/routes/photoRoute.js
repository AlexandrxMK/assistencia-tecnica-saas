const express = require('express');
const router = express.Router();
const controller = require('../controllers/photoController');

router.get('/:id', controller.getPhotosByOS);
router.post('/', controller.createPhoto);

module.exports = router;