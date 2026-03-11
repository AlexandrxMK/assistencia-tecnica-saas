const model = require('../models/employeesModel');

const getAllEmployees = async (req, res) => {
  try {
    const employees = await model.getAllEmployees();
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await model.getEmployeeById(req.params.id);

    if (!employee)
      return res.status(404).json({ message: 'Funcionário não encontrado' });

    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const employee = await model.createEmployee(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const updated = await model.updateEmployee(req.params.id, req.body);

    if (!updated)
      return res.status(404).json({ message: 'Funcionário não encontrado' });

    res.json({ message: 'Funcionário atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const patchEmployee = async (req, res) => {
  try {
    const patched = await model.patchEmployee(req.params.id, req.body);

    if (!patched)
      return res.status(404).json({ message: 'Funcionário não encontrado' });

    res.json({ message: 'Funcionário atualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const deleted = await model.deleteEmployee(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: 'Funcionário não encontrado' });

    res.json({ message: 'Funcionário removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  patchEmployee,
  deleteEmployee
};
