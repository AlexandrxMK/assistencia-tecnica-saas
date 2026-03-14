const pool = require('../db/db');
// const bcrypt = require('bcrypt');

async function getAllEmployees() {
  const { rows } = await pool.query(
    `SELECT 
       id_funcionario,
       nome,
       email,
       senha_hash,
       nivel_acesso,
       id_cargo
     FROM funcionario`
  );

  return rows;
}

async function getEmployeeById(id) {
  const { rows } = await pool.query(
    `SELECT 
       id_funcionario,
       nome,
       email,
       senha_hash,
       nivel_acesso,
       id_cargo
     FROM funcionario
     WHERE id_funcionario = $1`,
    [id]
  );

  return rows[0];
}

async function getEmployeeByEmail(email) {
  const { rows } = await pool.query(
    `SELECT 
       id_funcionario,
       nome,
       email,
       senha_hash,
       nivel_acesso,
       id_cargo
     FROM funcionario
     WHERE email = $1`,
    [email]
  );

  return rows[0];
}

async function createEmployee({
  nome,
  email,
  senha_hash,
  nivel_acesso,
  id_cargo
}) {

  // const hash = await bcrypt.hash(senha_hash, 10);

  const { rows } = await pool.query(
    `INSERT INTO funcionario
     (nome, email, senha_hash, nivel_acesso, id_cargo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_funcionario`,
    [
      nome,
      email,
      senha_hash, // hash
      nivel_acesso,
      id_cargo
    ]
  );

  return {
    id: rows[0].id_funcionario,
    nome,
    email,
    nivel_acesso,
    id_cargo
  };
}

async function updateEmployee(
  id,
  { nome, email, senha_hash, nivel_acesso, id_cargo }
) {

  let query = `
    UPDATE funcionario
    SET nome = $1,
        email = $2,
        nivel_acesso = $3,
        id_cargo = $4`;

  const params = [
    nome,
    email,
    nivel_acesso,
    id_cargo
  ];

  let index = 5;

  if (senha_hash) {
    // const hash = await bcrypt.hash(senha_hash, 10);
    query += `, senha_hash = $${index}`;
    params.push(senha_hash); // hash
    index++;
  }

  query += ` WHERE id_funcionario = $${index}`;
  params.push(id);

  const result = await pool.query(query, params);

  return result.rowCount > 0;
}

async function patchEmployee(id, fields) {

  const keys = Object.keys(fields);
  const values = Object.values(fields);

  if (keys.length === 0) return false;

  const senhaIndex = keys.indexOf('senha_hash');

  if (senhaIndex !== -1) {
    // values[senhaIndex] = await bcrypt.hash(values[senhaIndex], 10);
  }

  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  const result = await pool.query(
    `UPDATE funcionario
     SET ${setClause}
     WHERE id_funcionario = $${keys.length + 1}`,
    [...values, id]
  );

  return result.rowCount > 0;
}

async function deleteEmployee(id) {
  const result = await pool.query(
    `DELETE FROM funcionario WHERE id_funcionario = $1`,
    [id]
  );

  return result.rowCount > 0;
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  getEmployeeByEmail,
  createEmployee,
  updateEmployee,
  patchEmployee,
  deleteEmployee
};
