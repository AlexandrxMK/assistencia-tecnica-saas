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

async function patchStatusOs(id, status){
  const {rows} = await pool.query('UPDATE os SET status_os = $1 WHERE id_os = $2 RETURNING *', [status, id]);
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

async function getPublicOS(id){

 const { rows } = await pool.query(
 `
 SELECT
 os.id_os,
 os.status_os,
 os.descricao_problema,
 os.data_abertura,
 equipamento.tipo,
 equipamento.marca,
 equipamento.modelo
 FROM os
 JOIN equipamento
 ON os.id_equipamento = equipamento.id_equipamento
 WHERE os.id_os = $1
 `,
 [id]
 )

 return rows[0]
}

async function getValorTotalOs(id) {
  const {rows} = await pool.query('SELECT valor_total FROM os WHERE id_os = $1', [id]);
  return rows[0];
}

module.exports = {
  getAllOS,
  getOSById,
  createOS,
  patchStatusOs,
  getPublicOS,
  getValorTotalOs
};
