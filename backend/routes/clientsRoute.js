const express = require('express');
const router = express.Router();
const controller = require('../controllers/clientsController');

router.get('/', controller.getAllClients);
router.get('/:id', controller.getClientById);
router.post('/', controller.createClient);
router.put('/:id', controller.updateClient);
router.patch('/:id', controller.patchClient);
router.delete('/:id', controller.deleteClient);
router.get('/search/email', controller.getClientByEmail);
router.get('/search/phone', controller.getClientByPhone);

module.exports = router;
