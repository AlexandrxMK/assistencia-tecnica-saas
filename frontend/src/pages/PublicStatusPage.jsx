import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Panel, InlineMessage } from '../components/Ui';
import { backendApi } from '../services/backendApi';
import { extractApiError, getAbsoluteFileUrl } from '../lib/api';
import { formatDate, formatDateTime } from '../lib/format';

export function PublicStatusPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [orderId, setOrderId] = useState(params.id || '');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [orderData, setOrderData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const publicUrl = useMemo(
    () => (orderId ? `${window.location.origin}/public/os/${orderId}` : ''),
    [orderId]
  );

  async function fetchStatus(targetOrderId) {
    if (!targetOrderId) {
      setStatus({ type: 'error', text: 'Informe o número da OS.' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const [statusResponse, photosResponse, updatesResponse] = await Promise.all([
        backendApi.os.getPublicStatus(targetOrderId),
        backendApi.os.getPublicPhotos(targetOrderId),
        backendApi.os.getPublicUpdates(targetOrderId)
      ]);

      setOrderData(statusResponse.data);
      setPhotos(photosResponse.data?.photos || []);
      setUpdates(updatesResponse.data?.updates || []);
      navigate(`/public/os/${targetOrderId}`, { replace: true });
      setStatus({ type: 'success', text: 'Status público carregado com sucesso.' });
    } catch (error) {
      setOrderData(null);
      setPhotos([]);
      setUpdates([]);
      setStatus({ type: 'error', text: extractApiError(error) });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchStatus(params.id);
    }
  }, [params.id]);

  return (
    <div className="public-page">
      <Panel
        title="Consulta pública de OS"
        actions={
          <button type="button" className="button button-ghost" onClick={() => navigate('/login')}>
            Voltar ao login
          </button>
        }
      >
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            fetchStatus(orderId);
          }}
        >
          <input
            type="number"
            min="1"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Digite o ID da OS"
          />
          <button type="submit" className="button button-primary" disabled={isLoading}>
            {isLoading ? 'Consultando...' : 'Consultar status'}
          </button>
        </form>

        <InlineMessage type={status.type}>{status.text}</InlineMessage>

        {orderData ? (
          <div className="page-stack">
            <div className="public-grid">
              <div className="public-card">
                <h3>OS #{orderData.id_os}</h3>
                <p>
                  <strong>Status:</strong> {orderData.status_os}
                </p>
                <p>
                  <strong>Abertura:</strong> {formatDate(orderData.data_abertura)}
                </p>
                <p>
                  <strong>Equipamento:</strong> {orderData.tipo} {orderData.marca} {orderData.modelo}
                </p>
                <p>
                  <strong>Problema:</strong> {orderData.descricao_problema}
                </p>
              </div>

              <div className="public-card">
                <h3>Compartilhar consulta</h3>
                <p>Use o QR Code para abrir diretamente esta página de acompanhamento.</p>
                {publicUrl ? (
                  <>
                    <div className="qr-wrapper">
                      <QRCodeSVG value={publicUrl} size={180} includeMargin />
                    </div>
                    <p className="public-link">{publicUrl}</p>
                  </>
                ) : null}
              </div>
            </div>

            <div className="public-card">
              <h3>Fotos do aparelho</h3>
              {photos.length === 0 ? <p>Nenhuma foto registrada para esta OS.</p> : null}
              {photos.length > 0 ? (
                <div className="public-photo-grid">
                  {photos.map((photo) => (
                    <figure key={photo.id_foto} className="public-photo-card">
                      <img
                        src={getAbsoluteFileUrl(photo.url_arquivo)}
                        alt={`Foto ${photo.id_foto}`}
                      />
                      <figcaption>{formatDateTime(photo.data_upload)}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="public-card">
              <h3>Histórico de atualizações</h3>
              {updates.length === 0 ? <p>Nenhuma atualização registrada ainda.</p> : null}
              {updates.length > 0 ? (
                <ul className="public-update-list">
                  {updates.map((update, index) => (
                    <li key={`${update.id_notificacao || 'opening'}-${index}`}>
                      <p>
                        <strong>{update.tipo}</strong>
                      </p>
                      <p>
                        Canal: {update.canal || 'Sistema'} | Situação: {update.status_envio || 'Registrado'}
                      </p>
                      <small>{formatDateTime(update.data_envio)}</small>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
