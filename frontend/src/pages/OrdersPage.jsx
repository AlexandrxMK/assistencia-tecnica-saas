import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Panel, EmptyState, InlineMessage } from '../components/Ui';
import { backendApi } from '../services/backendApi';
import { API_BASE_URL, extractApiError } from '../lib/api';
import { formatCurrency, formatDate, toLocalDateTimeInputValue } from '../lib/format';

const allowedStatus = [
  'Aberto',
  'Em Analise',
  'Em Analise Tecnica',
  'Em Analise Técnica',
  'Em Conserto',
  'Concluida',
  'Concluída',
  'Cancelada'
];

const initialForm = {
  descricao_problema: '',
  data_abertura: toLocalDateTimeInputValue(),
  status_os: 'Aberto',
  id_funcionario: '',
  id_equipamento: ''
};

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [statusByOrder, setStatusByOrder] = useState({});
  const [totalValue, setTotalValue] = useState({});
  const [queriedTotals, setQueriedTotals] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (left, right) => new Date(right.data_abertura).getTime() - new Date(left.data_abertura).getTime()
      ),
    [orders]
  );

  async function loadData() {
    setIsLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const [ordersResponse, employeesResponse, equipmentResponse] = await Promise.all([
        backendApi.os.list(),
        backendApi.employees.list(),
        backendApi.equipment.list()
      ]);

      const ordersList = ordersResponse.data || [];
      setOrders(ordersList);
      setEmployees(employeesResponse.data || []);
      setEquipments(equipmentResponse.data || []);
      setStatusByOrder(
        ordersList.reduce((accumulator, order) => {
          accumulator[order.id_os] = order.status_os;
          return accumulator;
        }, {})
      );
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setStatus({ type: '', text: '' });

    try {
      await backendApi.os.create({
        ...form,
        id_funcionario: Number(form.id_funcionario),
        id_equipamento: Number(form.id_equipamento),
        data_abertura: new Date(form.data_abertura).toISOString()
      });
      setForm(initialForm);
      setStatus({ type: 'success', text: 'OS criada com sucesso.' });
      await loadData();
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    }
  }

  async function handlePatchStatus(orderId) {
    const nextStatus = statusByOrder[orderId];

    if (!nextStatus) {
      return;
    }

    try {
      const response = await backendApi.os.patchStatus(orderId, { status_os: nextStatus });
      const notificationStatus = response.data?.notification?.status || 'sem retorno';
      setStatus({
        type: 'success',
        text: `Status da OS #${orderId} atualizado. Notificação: ${notificationStatus}.`
      });
      await loadData();
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    }
  }

  async function handleGetTotal(orderId) {
    try {
      const response = await backendApi.os.getTotal(orderId);
      const rawValue = response.data?.valor_total;

      if (rawValue === null || rawValue === undefined || rawValue === '') {
        setStatus({
          type: 'error',
          text: `A OS #${orderId} ainda não possui valor_total definido.`
        });
        return;
      }

      const value = Number(rawValue);

      if (!Number.isFinite(value)) {
        setStatus({
          type: 'error',
          text: `A API retornou um valor_total inválido para a OS #${orderId}.`
        });
        return;
      }

      setTotalValue((values) => ({ ...values, [orderId]: value }));
      setQueriedTotals((values) => ({ ...values, [orderId]: new Date().toISOString() }));
      setOrders((items) =>
        items.map((item) =>
          String(item.id_os) === String(orderId)
            ? {
                ...item,
                valor_total: value
              }
            : item
        )
      );
      setStatus({
        type: 'success',
        text: `Valor total da OS #${orderId}: ${formatCurrency(value)}.`
      });
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    }
  }

  async function handleOpenPdf(orderId) {
    try {
      const response = await backendApi.os.generatePdf(orderId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    }
  }

  function buildPublicLink(orderId) {
    return `${window.location.origin}/public/os/${orderId}`;
  }

  async function copyPublicLink(orderId) {
    const publicLink = buildPublicLink(orderId);
    await navigator.clipboard.writeText(publicLink);
    setStatus({ type: 'success', text: `Link público da OS #${orderId} copiado.` });
  }

  return (
    <div className="page-stack">
      <Panel
        title="Nova ordem de serviço"
        subtitle="Crie OS com técnico e equipamento vinculados"
      >
        <form className="form-grid" onSubmit={handleCreate}>
          <label className="field-full">
            Descrição do problema
            <textarea
              value={form.descricao_problema}
              onChange={(event) =>
                setForm((value) => ({ ...value, descricao_problema: event.target.value }))
              }
              required
            />
          </label>

          <label>
            Data de abertura
            <input
              type="datetime-local"
              value={form.data_abertura}
              onChange={(event) =>
                setForm((value) => ({ ...value, data_abertura: event.target.value }))
              }
              required
            />
          </label>

          <label>
            Status inicial
            <select
              value={form.status_os}
              onChange={(event) =>
                setForm((value) => ({ ...value, status_os: event.target.value }))
              }
              required
            >
              {allowedStatus.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </label>

          <label>
            Funcionário responsável
            <select
              value={form.id_funcionario}
              onChange={(event) =>
                setForm((value) => ({ ...value, id_funcionario: event.target.value }))
              }
              required
            >
              <option value="">Selecione</option>
              {employees.map((employee) => (
                <option key={employee.id_funcionario} value={employee.id_funcionario}>
                  #{employee.id_funcionario} - {employee.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Equipamento
            <select
              value={form.id_equipamento}
              onChange={(event) =>
                setForm((value) => ({ ...value, id_equipamento: event.target.value }))
              }
              required
            >
              <option value="">Selecione</option>
              {equipments.map((equipment) => (
                <option key={equipment.id_equipamento} value={equipment.id_equipamento}>
                  #{equipment.id_equipamento} - {equipment.tipo} {equipment.marca} {equipment.modelo}
                </option>
              ))}
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" className="button button-primary">
              Criar OS
            </button>
          </div>
        </form>
      </Panel>

      <Panel
        title="Ordens cadastradas"
        subtitle="Gestão de status, PDF e link público"
      >
        <InlineMessage type={status.type}>{status.text}</InlineMessage>

        {isLoading ? <p>Carregando ordens...</p> : null}

        {!isLoading && sortedOrders.length === 0 ? (
          <EmptyState>Nenhuma OS cadastrada.</EmptyState>
        ) : null}

        {!isLoading && sortedOrders.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Abertura</th>
                  <th>Equip.</th>
                  <th>Total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => (
                  <tr key={order.id_os}>
                    <td>#{order.id_os}</td>
                    <td>
                      <select
                        value={statusByOrder[order.id_os] || order.status_os}
                        onChange={(event) =>
                          setStatusByOrder((current) => ({
                            ...current,
                            [order.id_os]: event.target.value
                          }))
                        }
                      >
                        {allowedStatus.map((statusOption) => (
                          <option key={`${order.id_os}-${statusOption}`} value={statusOption}>
                            {statusOption}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{formatDate(order.data_abertura)}</td>
                    <td>{order.id_equipamento}</td>
                    <td>
                      <div className="table-total-cell">
                        <strong>
                          {order.valor_total === null || order.valor_total === undefined
                            ? '-'
                            : formatCurrency(order.valor_total)}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => handlePatchStatus(order.id_os)}
                        >
                          Atualizar
                        </button>
                        <button
                          type="button"
                          className="button button-ghost"
                          onClick={() => handleOpenPdf(order.id_os)}
                        >
                          PDF
                        </button>
                        <button
                          type="button"
                          className="button button-ghost"
                          onClick={() => copyPublicLink(order.id_os)}
                        >
                          Copiar link
                        </button>
                        <Link to={`/public/os/${order.id_os}`} className="button button-ghost">
                          Público
                        </Link>
                        <a
                          href={`${API_BASE_URL}/os/${order.id_os}/status`}
                          target="_blank"
                          rel="noreferrer"
                          className="button button-ghost"
                        >
                          JSON
                        </a>
                      </div>
                    </td>
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
