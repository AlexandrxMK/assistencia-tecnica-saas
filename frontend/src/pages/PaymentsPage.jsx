import { useEffect, useState } from 'react';
import { Panel, EmptyState, InlineMessage } from '../components/Ui';
import { backendApi } from '../services/backendApi';
import { extractApiError } from '../lib/api';
import { formatCurrency, formatDateTime, toLocalDateTimeInputValue } from '../lib/format';

const initialForm = {
  id_os: '',
  data_confirmacao: toLocalDateTimeInputValue(),
  forma_pagamento: 'Pix',
  status_pagamento: 'Pendente',
  valor: ''
};

export function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const [paymentsResponse, ordersResponse] = await Promise.all([
        backendApi.payment.list(),
        backendApi.os.list()
      ]);

      setPayments(paymentsResponse.data || []);
      setOrders(ordersResponse.data || []);
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await backendApi.payment.create({
        ...form,
        id_os: Number(form.id_os),
        valor: Number(form.valor),
        data_confirmacao: new Date(form.data_confirmacao).toISOString()
      });

      setStatus({ type: 'success', text: 'Pagamento registrado com sucesso.' });
      setForm(initialForm);
      await loadData();
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    }
  }

  return (
    <div className="page-stack">
      <Panel title="Registrar pagamento" subtitle="Integração direta com endpoint /payment">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Ordem de serviço
            <select
              value={form.id_os}
              onChange={(event) => setForm((value) => ({ ...value, id_os: event.target.value }))}
              required
            >
              <option value="">Selecione</option>
              {orders.map((order) => (
                <option key={order.id_os} value={order.id_os}>
                  #{order.id_os} - {order.status_os}
                </option>
              ))}
            </select>
          </label>

          <label>
            Data de confirmação
            <input
              type="datetime-local"
              value={form.data_confirmacao}
              onChange={(event) =>
                setForm((value) => ({ ...value, data_confirmacao: event.target.value }))
              }
              required
            />
          </label>

          <label>
            Forma de pagamento
            <select
              value={form.forma_pagamento}
              onChange={(event) =>
                setForm((value) => ({ ...value, forma_pagamento: event.target.value }))
              }
            >
              <option value="Pix">Pix</option>
              <option value="Cartao">Cartão</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Transferencia">Transferência</option>
            </select>
          </label>

          <label>
            Status
            <select
              value={form.status_pagamento}
              onChange={(event) =>
                setForm((value) => ({ ...value, status_pagamento: event.target.value }))
              }
            >
              <option value="Pendente">Pendente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </label>

          <label>
            Valor
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.valor}
              onChange={(event) => setForm((value) => ({ ...value, valor: event.target.value }))}
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="button button-primary">
              Registrar pagamento
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Pagamentos" subtitle="Histórico financeiro do sistema">
        <InlineMessage type={status.type}>{status.text}</InlineMessage>

        {isLoading ? <p>Carregando pagamentos...</p> : null}

        {!isLoading && payments.length === 0 ? (
          <EmptyState>Nenhum pagamento registrado.</EmptyState>
        ) : null}

        {!isLoading && payments.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>OS</th>
                  <th>Forma</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th>Confirmação</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id_pagamento}>
                    <td>{payment.id_pagamento}</td>
                    <td>{payment.id_os}</td>
                    <td>{payment.forma_pagamento}</td>
                    <td>{payment.status_pagamento}</td>
                    <td>{formatCurrency(payment.valor)}</td>
                    <td>{formatDateTime(payment.data_confirmacao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
