const model = require('../models/equipmentModel');

const getAllEquipments = async (req, res) => {
  try {
    const equipments = await model.getAllEquipments();
    res.status(200).json(equipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const equipment = await model.getEquipmentById(req.params.id);

    if (!equipment)
      return res.status(404).json({ message: 'Equipamento não encontrado' });

    res.status(200).json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createEquipment = async (req, res) => {
  try {
    const equipment = await model.createEquipment(req.body);
    res.status(201).json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const updated = await model.updateEquipment(req.params.id, req.body);

    if (!updated)
      return res.status(404).json({ message: 'Equipamento não encontrado' });

    res.json({ message: 'Equipamento atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const deleted = await model.deleteEquipment(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: 'Equipamento não encontrado' });

    res.json({ message: 'Equipamento removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};
