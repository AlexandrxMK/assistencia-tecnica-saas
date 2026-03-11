const model = require('../models/partModel');

const getAllParts = async (req, res) => {
  try {
    const parts = await model.getAllParts();
    res.status(200).json(parts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPartById = async (req, res) => {
  try {
    const part = await model.getPartById(req.params.id);

    if (!part)
      return res.status(404).json({ message: 'Peça não encontrada' });

    res.status(200).json(part);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPart = async (req, res) => {
  try {
    const part = await model.createPart(req.body);
    res.status(201).json(part);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePart = async (req, res) => {
  try {
    const updated = await model.updatePart(req.params.id, req.body);

    if (!updated)
      return res.status(404).json({ message: 'Peça não encontrada' });

    res.json({ message: 'Peça atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const patchPart = async (req, res) => {
  try {
    const patched = await model.patchPart(req.params.id, req.body);

    if (!patched)
      return res.status(404).json({ message: 'Peça não encontrada' });

    res.json({ message: 'Peça atualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePart = async (req, res) => {
  try {
    const deleted = await model.deletePart(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: 'Peça não encontrada' });

    res.json({ message: 'Peça removida' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllParts,
  getPartById,
  createPart,
  updatePart,
  patchPart,
  deletePart
};
