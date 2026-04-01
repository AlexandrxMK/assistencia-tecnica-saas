import { useEffect, useMemo, useState } from 'react';
import { Panel, EmptyState, InlineMessage } from '../components/Ui';
import { backendApi } from '../services/backendApi';
import { extractApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  nome_cargo: '',
  nivel_acesso: 'tecnico'
};

const managerRoles = new Set(['admin', 'gerente']);

export function CargosPage() {
  const { user } = useAuth();
  const [cargos, setCargos] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);

  const canCreateCargo = useMemo(
    () => managerRoles.has(String(user?.nivel_acesso || '').toLowerCase()),
    [user?.nivel_acesso]
  );

  async function loadCargos() {
    setIsLoading(true);
    try {
      const response = await backendApi.cargo.list();
      setCargos(response.data || []);
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCargos();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canCreateCargo) {
      setStatus({ type: 'error', text: 'Somente admin e gerente podem criar cargos.' });
      return;
    }

    try {
      await backendApi.cargo.create(form);
      setStatus({ type: 'success', text: 'Cargo criado com sucesso.' });
      setForm(initialForm);
      await loadCargos();
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    }
  }

  return (
    <div className="page-stack">
      <Panel title="Cadastro de cargos" subtitle="Acesso controlado por perfil">
        <InlineMessage type={canCreateCargo ? 'success' : 'info'}>
          {canCreateCargo
            ? 'Seu perfil pode cadastrar novos cargos.'
            : 'Seu perfil pode apenas consultar os cargos existentes.'}
        </InlineMessage>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Nome do cargo
            <input
              type="text"
              value={form.nome_cargo}
              onChange={(event) =>
                setForm((value) => ({ ...value, nome_cargo: event.target.value }))
              }
              disabled={!canCreateCargo}
              required
            />
          </label>

          <label>
            Nível de acesso
            <select
              value={form.nivel_acesso}
              onChange={(event) =>
                setForm((value) => ({ ...value, nivel_acesso: event.target.value }))
              }
              disabled={!canCreateCargo}
            >
              <option value="admin">admin</option>
              <option value="gerente">gerente</option>
              <option value="tecnico">tecnico</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" className="button button-primary" disabled={!canCreateCargo}>
              Cadastrar cargo
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Cargos disponíveis" subtitle="Dados vindos de /cargo">
        <InlineMessage type={status.type}>{status.text}</InlineMessage>

        {isLoading ? <p>Carregando cargos...</p> : null}

        {!isLoading && cargos.length === 0 ? (
          <EmptyState>Nenhum cargo cadastrado.</EmptyState>
        ) : null}

        {!isLoading && cargos.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Nível de acesso</th>
                </tr>
              </thead>
              <tbody>
                {cargos.map((cargo) => (
                  <tr key={cargo.id_cargo}>
                    <td>{cargo.id_cargo}</td>
                    <td>{cargo.nome_cargo}</td>
                    <td>{cargo.nivel_acesso}</td>
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
