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

async function getNotificationsByOS(id_os) {
  const { rows } = await pool.query(
    `
    SELECT
      id_notificacao,
      id_os,
      tipo,
      data_envio,
      status_envio,
      canal
    FROM notificacao
    WHERE id_os = $1
    ORDER BY data_envio DESC NULLS LAST, id_notificacao DESC
    `,
    [id_os]
  );

  return rows;
}

module.exports = {
  createNotification,
  getNotificationsByOS
};
