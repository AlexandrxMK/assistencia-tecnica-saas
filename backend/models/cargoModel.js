const pool = require('../db/db');

async function getAllCargos() {
  const { rows } = await pool.query(`SELECT * FROM cargo`);
  return rows;
}

async function createCargo({ nome_cargo, nivel_acesso }) {

  const { rows } = await pool.query(
    `INSERT INTO cargo
    (nome_cargo,nivel_acesso)
    VALUES ($1,$2)
    RETURNING *`,
    [nome_cargo, nivel_acesso]
  );

  return rows[0];
}

module.exports = {
  getAllCargos,
  createCargo
};
