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
const accessLevels = ['admin', 'gerente', 'tecnico'];

function buildAccessDrafts(employees = []) {
  return employees.reduce((acc, employee) => {
    acc[employee.id_funcionario] = String(employee.nivel_acesso || 'tecnico').toLowerCase();
    return acc;
  }, {});
}

function formatAccessLevelLabel(level) {
  const normalizedLevel = String(level || '').trim().toLowerCase();
  if (normalizedLevel === 'tecnico') return 'técnico';
  return normalizedLevel || '-';
}

export function CargosPage() {
  const { user } = useAuth();
  const [cargos, setCargos] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [accessDrafts, setAccessDrafts] = useState({});
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [savingEmployeeId, setSavingEmployeeId] = useState(null);

  const canCreateCargo = useMemo(
    () => managerRoles.has(String(user?.nivel_acesso || '').toLowerCase()),
    [user?.nivel_acesso]
  );

  const canManageAccessLevel = useMemo(
    () => String(user?.nivel_acesso || '').toLowerCase() === 'admin',
    [user?.nivel_acesso]
  );

  async function loadData() {
    setIsLoading(true);
    try {
      const [cargoResponse, employeeResponse] = await Promise.all([
        backendApi.cargo.list(),
        backendApi.employees.list()
      ]);
      const employeesData = employeeResponse.data || [];

      setCargos(cargoResponse.data || []);
      setEmployees(employeesData);
      setAccessDrafts(buildAccessDrafts(employeesData));
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

    if (!canCreateCargo) {
      setStatus({ type: 'error', text: 'Somente admin e gerente podem criar cargos.' });
      return;
    }

    try {
      await backendApi.cargo.create(form);
      setStatus({ type: 'success', text: 'Cargo criado com sucesso.' });
      setForm(initialForm);
      await loadData();
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    }
  }

  async function handleSaveAccessLevel(employee) {
    if (!canManageAccessLevel) {
      setStatus({ type: 'error', text: 'Somente admin pode alterar nivel de acesso.' });
      return;
    }

    if (Number(employee.id_funcionario) === Number(user?.id_funcionario)) {
      setStatus({ type: 'error', text: 'Nao e permitido alterar seu proprio nivel nesta tela.' });
      return;
    }

    const nextAccessLevel = accessDrafts[employee.id_funcionario] || employee.nivel_acesso;
    const currentAccessLevel = String(employee.nivel_acesso || '').toLowerCase();

    if (nextAccessLevel === currentAccessLevel) {
      setStatus({ type: 'info', text: 'Nenhuma alteracao de nivel para salvar.' });
      return;
    }

    setSavingEmployeeId(employee.id_funcionario);

    try {
      await backendApi.employees.updateAccessLevel(employee.id_funcionario, {
        nivel_acesso: nextAccessLevel
      });
      setStatus({ type: 'success', text: 'Nivel de acesso atualizado com sucesso.' });
      await loadData();
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    } finally {
      setSavingEmployeeId(null);
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
              <option value="tecnico">técnico</option>
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
                    <td>{formatAccessLevelLabel(cargo.nivel_acesso)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Panel>

      <Panel
        title="Alterar nivel de acesso dos funcionarios"
        subtitle="Somente admin pode alterar o nivel de acesso de outros usuarios"
      >
        <InlineMessage type={canManageAccessLevel ? 'success' : 'info'}>
          {canManageAccessLevel
            ? 'Seu perfil pode alterar o nivel de acesso dos funcionarios.'
            : 'Seu perfil pode apenas visualizar os niveis de acesso.'}
        </InlineMessage>

        {isLoading ? <p>Carregando funcionarios...</p> : null}

        {!isLoading && employees.length === 0 ? (
          <EmptyState>Nenhum funcionario cadastrado.</EmptyState>
        ) : null}

        {!isLoading && employees.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Nivel atual</th>
                  <th>Novo nivel</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => {
                  const employeeId = employee.id_funcionario;
                  const isOwnUser = Number(employeeId) === Number(user?.id_funcionario);
                  const currentLevel = String(employee.nivel_acesso || '').toLowerCase();
                  const selectedLevel = accessDrafts[employeeId] || currentLevel;
                  const hasChanges = selectedLevel !== currentLevel;
                  const isSaving = savingEmployeeId === employeeId;
                  const disableActions = !canManageAccessLevel || isOwnUser || isSaving;

                  return (
                    <tr key={employeeId}>
                      <td>{employeeId}</td>
                      <td>{employee.nome}</td>
                      <td>{employee.email}</td>
                      <td>{formatAccessLevelLabel(currentLevel)}</td>
                      <td>
                        <select
                          value={selectedLevel}
                          disabled={!canManageAccessLevel || isOwnUser || isSaving}
                          onChange={(event) =>
                            setAccessDrafts((value) => ({
                              ...value,
                              [employeeId]: event.target.value
                            }))
                          }
                        >
                          {accessLevels.map((accessLevel) => (
                            <option key={accessLevel} value={accessLevel}>
                              {formatAccessLevelLabel(accessLevel)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="button button-primary"
                          disabled={disableActions || !hasChanges}
                          onClick={() => handleSaveAccessLevel(employee)}
                        >
                          {isSaving ? 'Salvando...' : 'Salvar nivel'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
