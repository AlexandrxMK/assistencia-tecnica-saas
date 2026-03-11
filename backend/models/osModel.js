const pool = require('../db/db');

async function getAllOS() {
  const { rows } = await pool.query(`SELECT * FROM os`);
  return rows;
}

async function getOSById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM os WHERE id_os = $1`,
    [id]
  );
  return rows[0];
}

async function createOS({
  descricao_problema,
  data_abertura,
  status_os,
  id_funcionario,
  id_equipamento
}) {

  const { rows } = await pool.query(
    `INSERT INTO os
    (descricao_problema,data_abertura,status_os,id_funcionario,id_equipamento)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *`,
    [
      descricao_problema,
      data_abertura,
      status_os,
      id_funcionario,
      id_equipamento
    ]
  );

  return rows[0];
}

module.exports = {
  getAllOS,
  getOSById,
  createOS
};
