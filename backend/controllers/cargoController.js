const model = require('../models/cargoModel');

const getAllCargos = async (req, res) => {
  try {
    const cargos = await model.getAllCargos();
    res.status(200).json(cargos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createCargo = async (req, res) => {
  try {
    const cargo = await model.createCargo(req.body);
    res.status(201).json(cargo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllCargos,
  createCargo
};
