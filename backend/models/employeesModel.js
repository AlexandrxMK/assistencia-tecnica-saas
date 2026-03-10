const pool = require('../db/db');
// const bcrypt = require('bcrypt');

async function getAllEmployees() {
  const { rows } = await pool.query(
    `SELECT 
       id_funcionario, 
       nome, 
       cpf_cnpj, 
       email, 
       telefone, 
       salario, 
       TO_CHAR(data_admissao, 'DD/MM/YYYY') AS data_admissao, 
       senha, 
       cargo 
     FROM funcionario`
  );

  return rows;
}

async function getEmployeeById(id) {
  const { rows } = await pool.query(
    `SELECT 
       id_funcionario, 
       nome, 
       cpf_cnpj, 
       email, 
       telefone, 
       salario, 
       TO_CHAR(data_admissao, 'DD/MM/YYYY') AS data_admissao, 
       senha, 
       cargo 
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
       cpf_cnpj, 
       email, 
       telefone, 
       salario, 
       TO_CHAR(data_admissao, 'DD/MM/YYYY') AS data_admissao, 
       senha, 
       cargo 
     FROM funcionario 
     WHERE email = $1`,
    [email]
  );

  return rows[0];
}

async function createEmployee({
  nome,
  cpf_cnpj,
  email,
  telefone,
  salario,
  data_admissao,
  senha,
  cargo
}) {

  // const hash = await bcrypt.hash(senha, 10);

  const { rows } = await pool.query(
    `INSERT INTO funcionario 
     (nome, cpf_cnpj, email, telefone, salario, data_admissao, senha, cargo) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id_funcionario`,
    [
      nome,
      cpf_cnpj,
      email,
      telefone,
      parseFloat(salario),
      data_admissao,
      senha, // hash
      cargo
    ]
  );

  return {
    id: rows[0].id_funcionario,
    nome,
    cpf_cnpj,
    email,
    telefone,
    salario,
    data_admissao,
    cargo
  };
}

async function updateEmployee(
  id,
  { nome, cpf_cnpj, email, telefone, salario, data_admissao, senha, cargo }
) {

  let query = `
    UPDATE funcionario 
    SET nome = $1,
        cpf_cnpj = $2,
        email = $3,
        telefone = $4,
        salario = $5,
        data_admissao = $6,
        cargo = $7`;

  const params = [
    nome,
    cpf_cnpj,
    email,
    telefone,
    parseFloat(salario),
    data_admissao,
    cargo
  ];

  let index = 8;

  if (senha) {
    // const hash = await bcrypt.hash(senha, 10);
    query += `, senha = $${index}`;
    params.push(senha); // hash
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

  const senhaIndex = keys.indexOf('senha');

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
    'DELETE FROM funcionario WHERE id_funcionario = $1',
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