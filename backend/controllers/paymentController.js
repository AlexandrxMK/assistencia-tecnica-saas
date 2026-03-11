const model = require('../models/paymentModel');

const getAllPayments = async (req, res) => {
  try {
    const payments = await model.getAllPayments();
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const payment = await model.createPayment(req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllPayments,
  createPayment
};
