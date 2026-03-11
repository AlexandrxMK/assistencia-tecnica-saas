const pool = require('../db/db');

async function getAllPayments() {
  const { rows } = await pool.query(`SELECT * FROM pagamento`);
  return rows;
}

async function createPayment({
  id_os,
  data_confirmacao,
  forma_pagamento,
  status_pagamento,
  valor
}) {

  const { rows } = await pool.query(
    `INSERT INTO pagamento
    (id_os,data_confirmacao,forma_pagamento,status_pagamento,valor)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *`,
    [
      id_os,
      data_confirmacao,
      forma_pagamento,
      status_pagamento,
      valor
    ]
  );

  return rows[0];
}

module.exports = {
  getAllPayments,
  createPayment
};
