const pool = require('../db/db');

async function createNotification({
  id_os,
  tipo,
  data_envio,
  status_envio,
  canal
}) {

  const { rows } = await pool.query(
    `INSERT INTO notificacao
    (id_os,tipo,data_envio,status_envio,canal)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *`,
    [id_os, tipo, data_envio, status_envio, canal]
  );

  return rows[0];
}

module.exports = {
  createNotification
};
