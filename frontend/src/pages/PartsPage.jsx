import { useEffect, useState } from 'react';
import { Panel, EmptyState, InlineMessage } from '../components/Ui';
import { backendApi } from '../services/backendApi';
import { extractApiError } from '../lib/api';
import { formatCurrency } from '../lib/format';

const initialForm = {
  nome_peca: '',
  preco_unit: '',
  estoque: ''
};

export function PartsPage() {
  const [parts, setParts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);

  async function loadParts() {
    setIsLoading(true);
    try {
      const response = await backendApi.part.list();
      setParts(response.data || []);
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadParts();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = {
        nome_peca: form.nome_peca,
        preco_unit: Number(form.preco_unit),
        estoque: Number(form.estoque)
      };

      if (editingId) {
        await backendApi.part.update(editingId, payload);
        setStatus({ type: 'success', text: 'Peça atualizada com sucesso.' });
      } else {
        await backendApi.part.create(payload);
        setStatus({ type: 'success', text: 'Peça cadastrada com sucesso.' });
      }

      resetForm();
      await loadParts();
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    }
  }

  async function handleDelete(partId) {
    if (!window.confirm('Deseja excluir esta peça?')) {
      return;
    }

    try {
      await backendApi.part.remove(partId);
      setStatus({ type: 'success', text: 'Peça removida com sucesso.' });
      await loadParts();
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    }
  }

  return (
    <div className="page-stack">
      <Panel title="Cadastro de peças" subtitle="Controle de estoque e preço unitário">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Nome da peça
            <input
              type="text"
              value={form.nome_peca}
              onChange={(event) =>
                setForm((value) => ({ ...value, nome_peca: event.target.value }))
              }
              required
            />
          </label>

          <label>
            Preço unitário
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.preco_unit}
              onChange={(event) =>
                setForm((value) => ({ ...value, preco_unit: event.target.value }))
              }
              required
            />
          </label>

          <label>
            Estoque
            <input
              type="number"
              min="0"
              value={form.estoque}
              onChange={(event) =>
                setForm((value) => ({ ...value, estoque: event.target.value }))
              }
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="button button-primary">
              {editingId ? 'Atualizar peça' : 'Cadastrar peça'}
            </button>
            <button type="button" className="button button-ghost" onClick={resetForm}>
              Limpar
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Peças cadastradas" subtitle="Inventário integrado com /part">
        <InlineMessage type={status.type}>{status.text}</InlineMessage>

        {isLoading ? <p>Carregando peças...</p> : null}

        {!isLoading && parts.length === 0 ? (
          <EmptyState>Nenhuma peça cadastrada.</EmptyState>
        ) : null}

        {!isLoading && parts.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Preço unit.</th>
                  <th>Estoque</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id_peca}>
                    <td>{part.id_peca}</td>
                    <td>{part.nome_peca}</td>
                    <td>{formatCurrency(part.preco_unit)}</td>
                    <td>{part.estoque}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="button button-ghost"
                          onClick={() => {
                            setEditingId(part.id_peca);
                            setForm({
                              nome_peca: part.nome_peca ?? '',
                              preco_unit: String(part.preco_unit ?? ''),
                              estoque: String(part.estoque ?? '')
                            });
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="button button-danger"
                          onClick={() => handleDelete(part.id_peca)}
                        >
                          Excluir
                        </button>
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
