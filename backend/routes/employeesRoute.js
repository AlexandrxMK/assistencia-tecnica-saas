const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeesController');

router.get('/', controller.getAllEmployees);
router.get('/:id', controller.getEmployeeById);
router.post('/', controller.createEmployee);
router.put('/:id', controller.updateEmployee);
router.patch('/:id', controller.patchEmployee);
router.delete('/:id', controller.deleteEmployee);

module.exports = router;