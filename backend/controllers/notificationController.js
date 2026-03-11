const model = require('../models/notificacaoModel');

const createNotification = async (req, res) => {
  try {
    const notification = await model.createNotification(req.body);
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createNotification
};
