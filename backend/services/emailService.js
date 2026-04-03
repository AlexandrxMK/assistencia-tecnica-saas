const nodemailer = require('nodemailer');

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';
const EMAIL_GMAIL_USER = process.env.EMAIL_GMAIL_USER || null;
const EMAIL_GMAIL_APP_PASSWORD = process.env.EMAIL_GMAIL_APP_PASSWORD || null;
const EMAIL_FROM = process.env.EMAIL_FROM || (
  EMAIL_GMAIL_USER
    ? `Assistência Técnica <${EMAIL_GMAIL_USER}>`
    : 'Assistência Técnica <no-reply@assistencia.local>'
);

let transporterPromise = null;

function normalizeEmail(email) {
  if (!email) return null;
  const normalized = String(email).trim().toLowerCase();
  if (!normalized) return null;

  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicEmailRegex.test(normalized)) return null;

  return normalized;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildStatusEmailText({
  clientName,
  osId,
  status,
  equipment,
  publicUrl
}) {
  const safeClientName = clientName || 'Cliente';
  const safeStatus = status || 'Atualizado';
  const safeEquipment = equipment || 'seu equipamento';
  const safePublicUrl = publicUrl || null;

  return [
    `Olá, ${safeClientName}!`,
    '',
    `A ordem de serviço #${osId} recebeu uma nova atualização.`,
    `Equipamento: ${safeEquipment}`,
    `Status atual: ${safeStatus}`,
    '',
    safePublicUrl
      ? `Acompanhe sua OS pelo link público: ${safePublicUrl}`
      : 'Acompanhe sua OS pelo nosso canal de atendimento.',
    '',
    'Se precisar de ajuda, basta responder este email.'
  ].join('\n');
}

function buildStatusEmailHtml({
  clientName,
  osId,
  status,
  equipment,
  publicUrl
}) {
  const safeClientName = escapeHtml(clientName || 'Cliente');
  const safeStatus = escapeHtml(status || 'Atualizado');
  const safeEquipment = escapeHtml(equipment || 'seu equipamento');
  const safePublicUrl = String(publicUrl || '').trim();
  const escapedPublicUrl = safePublicUrl ? escapeHtml(safePublicUrl) : '';
  const hasPublicUrl = Boolean(safePublicUrl);

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
      <p>Olá, <strong>${safeClientName}</strong>!</p>
      <p>
        A ordem de serviço <strong>#${osId}</strong> recebeu uma nova atualização.
      </p>
      <p><strong>Equipamento:</strong> ${safeEquipment}</p>
      <p><strong>Status atual:</strong> ${safeStatus}</p>
      ${
        hasPublicUrl
          ? `
      <p>
        <a
          href="${escapedPublicUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style="display:inline-block;padding:10px 16px;background:#1f7a5a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;"
        >
          Ver página pública da OS
        </a>
      </p>
      <p style="font-size:12px;color:#666;word-break:break-all;">${escapedPublicUrl}</p>
      `
          : ''
      }
      <p>Se precisar de ajuda, basta responder este email.</p>
    </div>
  `;
}

async function createTransporter() {
  if (!EMAIL_GMAIL_USER || !EMAIL_GMAIL_APP_PASSWORD) {
    const error = new Error('Gmail SMTP não configurado');
    error.code = 'GMAIL_NOT_CONFIGURED';
    throw error;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_GMAIL_USER,
      pass: EMAIL_GMAIL_APP_PASSWORD
    }
  });
}

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = createTransporter().catch((error) => {
      transporterPromise = null;
      throw error;
    });
  }
  return transporterPromise;
}

async function sendStatusEmailNotification({
  email,
  clientName,
  osId,
  status,
  equipment,
  publicUrl
}) {
  if (!EMAIL_ENABLED) {
    return {
      sent: false,
      status: 'disabled',
      details: 'Email notifications disabled'
    };
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return {
      sent: false,
      status: 'invalid_email',
      details: 'Email do cliente inválido ou ausente'
    };
  }

  try {
    const transporter = await getTransporter();
    const subject = `OS #${osId} atualizada para ${status || 'novo status'}`;
    const text = buildStatusEmailText({ clientName, osId, status, equipment, publicUrl });
    const html = buildStatusEmailHtml({ clientName, osId, status, equipment, publicUrl });

    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: normalizedEmail,
      subject,
      text,
      html
    });

    return {
      sent: true,
      status: 'sent',
      details: info.messageId || null
    };
  } catch (error) {
    if (error.code === 'GMAIL_NOT_CONFIGURED') {
      return {
        sent: false,
        status: 'not_configured',
        details: 'Defina EMAIL_GMAIL_USER e EMAIL_GMAIL_APP_PASSWORD no .env'
      };
    }

    return {
      sent: false,
      status: 'provider_error',
      details: error.message
    };
  }
}

module.exports = {
  sendStatusEmailNotification
};
