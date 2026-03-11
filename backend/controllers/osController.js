const model = require('../models/osModel');

const getAllOS = async (req, res) => {
  try {
    const orders = await model.getAllOS();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOSById = async (req, res) => {
  try {
    const order = await model.getOSById(req.params.id);

    if (!order)
      return res.status(404).json({ message: 'OS não encontrada' });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createOS = async (req, res) => {
  try {
    const order = await model.createOS(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllOS,
  getOSById,
  createOS
};
