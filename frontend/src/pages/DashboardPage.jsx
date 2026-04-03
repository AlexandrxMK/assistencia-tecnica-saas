import { useEffect, useState } from 'react';
import { Panel, EmptyState, InlineMessage } from '../components/Ui';
import { backendApi } from '../services/backendApi';
import { extractApiError } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/format';

export function DashboardPage() {
  const [snapshot, setSnapshot] = useState({
    totalRevenue: 0,
    averageTicket: 0,
    ordersSummary: null,
    ordersByStatus: [],
    monthlyRevenue: [],
    latestOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setError('');

      try {
        const [
          totalRevenueResponse,
          averageTicketResponse,
          ordersSummaryResponse,
          ordersByStatusResponse,
          monthlyRevenueResponse,
          ordersResponse
        ] = await Promise.all([
          backendApi.reports.totalRevenue(),
          backendApi.reports.averageTicket(),
          backendApi.reports.ordersSummary(),
          backendApi.reports.ordersByStatus(),
          backendApi.reports.monthlyRevenue(),
          backendApi.os.list()
        ]);

        const latestOrders = [...ordersResponse.data]
          .sort((a, b) => new Date(b.data_abertura) - new Date(a.data_abertura))
          .slice(0, 6);

        setSnapshot({
          totalRevenue: Number(totalRevenueResponse.data?.total || 0),
          averageTicket: Number(averageTicketResponse.data?.average_ticket || 0),
          ordersSummary: ordersSummaryResponse.data,
          ordersByStatus: ordersByStatusResponse.data || [],
          monthlyRevenue: monthlyRevenueResponse.data || [],
          latestOrders
        });
      } catch (requestError) {
        setError(extractApiError(requestError));
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const metrics = [
    {
      label: 'Receita confirmada',
      value: formatCurrency(snapshot.totalRevenue)
    },
    {
      label: 'Ticket médio',
      value: formatCurrency(snapshot.averageTicket)
    },
    {
      label: 'OS em aberto',
      value: snapshot.ordersSummary?.open ?? 0
    },
    {
      label: 'OS concluídas',
      value: snapshot.ordersSummary?.completed ?? 0
    }
  ];

  return (
    <div className="page-stack">
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="metric-card">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <InlineMessage type="error">{error}</InlineMessage>

      <div className="two-column-grid">
        <Panel title="Ordens recentes">
          {isLoading ? <p>Carregando dados...</p> : null}

          {!isLoading && snapshot.latestOrders.length === 0 ? (
            <EmptyState>Nenhuma ordem encontrada.</EmptyState>
          ) : null}

          {!isLoading && snapshot.latestOrders.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Abertura</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.latestOrders.map((order) => (
                    <tr key={order.id_os}>
                      <td>#{order.id_os}</td>
                      <td>{order.status_os}</td>
                      <td>{formatDate(order.data_abertura)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Panel>

        <Panel title="Status das OS">
          {snapshot.ordersByStatus.length === 0 ? (
            <EmptyState>Sem dados de status para exibir.</EmptyState>
          ) : (
            <ul className="status-list">
              {snapshot.ordersByStatus.map((statusItem) => (
                <li key={statusItem.status_os}>
                  <span>{statusItem.status_os}</span>
                  <strong>{statusItem.quantity}</strong>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Receita mensal">
        {snapshot.monthlyRevenue.length === 0 ? (
          <EmptyState>Sem pagamentos confirmados ainda.</EmptyState>
        ) : (
          <div className="bar-list">
            {snapshot.monthlyRevenue.map((monthData) => {
              const total = Number(monthData.total || 0);
              const width = Math.min(100, Math.max(8, total / 100));
              const label = formatDate(monthData.month);

              return (
                <div key={monthData.month} className="bar-row">
                  <span>{label}</span>
                  <div>
                    <i style={{ width: `${width}%` }} />
                    <strong>{formatCurrency(total)}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
