import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Panel, InlineMessage } from '../components/Ui';
import { backendApi } from '../services/backendApi';
import { extractApiError } from '../lib/api';
import { formatDate } from '../lib/format';

export function PublicStatusPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [orderId, setOrderId] = useState(params.id || '');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [orderData, setOrderData] = useState(null);
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
      const response = await backendApi.os.getPublicStatus(targetOrderId);
      setOrderData(response.data);
      navigate(`/public/os/${targetOrderId}`, { replace: true });
      setStatus({ type: 'success', text: 'Status público carregado com sucesso.' });
    } catch (error) {
      setOrderData(null);
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
        subtitle="Acompanhe o status sem login e compartilhe via QR Code"
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
        ) : null}
      </Panel>
    </div>
  );
}
