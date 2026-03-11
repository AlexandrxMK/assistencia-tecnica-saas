const pool = require('../db/db');

async function getPhotosByOS(id_os) {
  const { rows } = await pool.query(
    `SELECT * FROM foto WHERE id_os = $1`,
    [id_os]
  );
  return rows;
}

async function createPhoto({ id_os, url_arquivo, data_upload }) {

  const { rows } = await pool.query(
    `INSERT INTO foto
    (id_os,url_arquivo,data_upload)
    VALUES ($1,$2,$3)
    RETURNING *`,
    [id_os, url_arquivo, data_upload]
  );

  return rows[0];
}

module.exports = {
  getPhotosByOS,
  createPhoto
};
