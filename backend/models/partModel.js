const pool = require('../db/db');

async function getAllParts() {
  const { rows } = await pool.query(`SELECT * FROM peca`);
  return rows;
}

async function getPartById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM peca WHERE id_peca = $1`,
    [id]
  );
  return rows[0];
}

async function createPart({ nome_peca, preco_unit, estoque }) {
  const { rows } = await pool.query(
    `INSERT INTO peca (nome_peca, preco_unit, estoque)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [nome_peca, preco_unit, estoque]
  );
  return rows[0];
}

async function updatePart(id, { nome_peca, preco_unit, estoque }) {
  const {rows} = await pool.query(
    `UPDATE peca
     SET nome_peca = $1,
         preco_unit = $2,
         estoque = $3
     WHERE id_peca = $4
     RETURNING *`,
    [nome_peca, preco_unit, estoque, id]
  );
  return rows[0];
}

async function patchPart(id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  if (keys.length === 0) return false;

  const setClause = keys.map((k, i) => `${k} = $${i+1}`).join(', ');

  const {rows} = await pool.query(
    `UPDATE peca
     SET ${setClause}
     WHERE id_peca = $${keys.length + 1}
     RETURNING *`,
    [...values, id]
  );

  return rows[0];
}

async function deletePart(id) {
  const {rows} = await pool.query(
    `DELETE FROM peca WHERE id_peca = $1
    RETURNING *`,
    [id]
  );
  return rows[0];
}

module.exports = {
  getAllParts,
  getPartById,
  createPart,
  updatePart,
  patchPart,
  deletePart
};
