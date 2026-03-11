const model = require('../models/fotoModel');

const getPhotosByOS = async (req, res) => {
  try {
    const photos = await model.getPhotosByOS(req.params.id);
    res.status(200).json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPhoto = async (req, res) => {
  try {
    const photo = await model.createPhoto(req.body);
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPhotosByOS,
  createPhoto
};
