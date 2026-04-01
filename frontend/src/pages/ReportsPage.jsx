import { useEffect, useState } from 'react';
import { Panel, EmptyState, InlineMessage } from '../components/Ui';
import { backendApi } from '../services/backendApi';
import { extractApiError } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/format';

export function ReportsPage() {
  const [reports, setReports] = useState({
    totalRevenue: 0,
    averageTicket: 0,
    ordersSummary: null,
    ordersByStatus: [],
    mostUsedParts: [],
    monthlyRevenue: [],
    periodRevenue: null
  });
  const [period, setPeriod] = useState({
    start: '',
    end: ''
  });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);

  async function loadReports() {
    setIsLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const [
        totalRevenueResponse,
        averageTicketResponse,
        ordersSummaryResponse,
        ordersByStatusResponse,
        mostUsedPartsResponse,
        monthlyRevenueResponse
      ] = await Promise.all([
        backendApi.reports.totalRevenue(),
        backendApi.reports.averageTicket(),
        backendApi.reports.ordersSummary(),
        backendApi.reports.ordersByStatus(),
        backendApi.reports.mostUsedParts(),
        backendApi.reports.monthlyRevenue()
      ]);

      setReports({
        totalRevenue: Number(totalRevenueResponse.data?.total || 0),
        averageTicket: Number(averageTicketResponse.data?.average_ticket || 0),
        ordersSummary: ordersSummaryResponse.data,
        ordersByStatus: ordersByStatusResponse.data || [],
        mostUsedParts: mostUsedPartsResponse.data || [],
        monthlyRevenue: monthlyRevenueResponse.data || [],
        periodRevenue: null
      });
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handlePeriodRevenue(event) {
    event.preventDefault();

    if (!period.start || !period.end) {
      setStatus({ type: 'error', text: 'Preencha data inicial e final.' });
      return;
    }

    try {
      const response = await backendApi.reports.revenueByPeriod(period);
      setReports((value) => ({ ...value, periodRevenue: Number(response.data?.total || 0) }));
      setStatus({ type: 'success', text: 'Receita por período calculada com sucesso.' });
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    }
  }

  async function handleOpenOrdersPdf() {
    try {
      const response = await backendApi.reports.generateAllOrdersPdf();
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    }
  }

  return (
    <div className="page-stack">
      <div className="metrics-grid">
        <article className="metric-card">
          <p>Receita total</p>
          <strong>{formatCurrency(reports.totalRevenue)}</strong>
        </article>
        <article className="metric-card">
          <p>Ticket médio</p>
          <strong>{formatCurrency(reports.averageTicket)}</strong>
        </article>
        <article className="metric-card">
          <p>OS abertas</p>
          <strong>{reports.ordersSummary?.open ?? 0}</strong>
        </article>
        <article className="metric-card">
          <p>OS concluídas</p>
          <strong>{reports.ordersSummary?.completed ?? 0}</strong>
        </article>
      </div>

      <Panel
        title="Receita por período"
        subtitle="Endpoint /reports/revenue/period com filtros dinâmicos"
      >
        <form className="inline-form" onSubmit={handlePeriodRevenue}>
          <label>
            Início
            <input
              type="date"
              value={period.start}
              onChange={(event) => setPeriod((value) => ({ ...value, start: event.target.value }))}
            />
          </label>
          <label>
            Fim
            <input
              type="date"
              value={period.end}
              onChange={(event) => setPeriod((value) => ({ ...value, end: event.target.value }))}
            />
          </label>
          <button type="submit" className="button button-secondary">
            Calcular período
          </button>
          <button type="button" className="button button-primary" onClick={handleOpenOrdersPdf}>
            Gerar PDF de todas as OS
          </button>
        </form>

        {reports.periodRevenue !== null ? (
          <p className="result-emphasis">
            Receita no período: <strong>{formatCurrency(reports.periodRevenue)}</strong>
          </p>
        ) : null}
      </Panel>

      <InlineMessage type={status.type}>{status.text}</InlineMessage>

      {isLoading ? <p>Carregando relatórios...</p> : null}

      <div className="two-column-grid">
        <Panel title="OS por status" subtitle="Distribuição operacional">
          {reports.ordersByStatus.length === 0 ? (
            <EmptyState>Sem dados disponíveis.</EmptyState>
          ) : (
            <ul className="status-list">
              {reports.ordersByStatus.map((item) => (
                <li key={item.status_os}>
                  <span>{item.status_os}</span>
                  <strong>{item.quantity}</strong>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Peças mais usadas" subtitle="Volume por peça em OS">
          {reports.mostUsedParts.length === 0 ? (
            <EmptyState>Sem dados de peças para exibir.</EmptyState>
          ) : (
            <ul className="status-list">
              {reports.mostUsedParts.map((item) => (
                <li key={item.nome_peca}>
                  <span>{item.nome_peca}</span>
                  <strong>{item.total}</strong>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Receita mensal" subtitle="Pagamentos confirmados por mês">
        {reports.monthlyRevenue.length === 0 ? (
          <EmptyState>Sem pagamentos confirmados para montar gráfico.</EmptyState>
        ) : (
          <div className="bar-list">
            {reports.monthlyRevenue.map((item) => {
              const total = Number(item.total || 0);
              const width = Math.max(6, Math.min(100, total / 100));
              return (
                <div key={item.month} className="bar-row">
                  <span>{formatDate(item.month)}</span>
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
