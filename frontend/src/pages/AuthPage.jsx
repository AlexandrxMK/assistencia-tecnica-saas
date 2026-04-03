import { useMemo, useState } from 'react';
import { extractApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { InlineMessage } from '../components/Ui';

const initialLogin = {
  email: '',
  password: ''
};

const initialBootstrap = {
  nome: '',
  email: '',
  password: '',
  id_cargo: ''
};

export function AuthPage() {
  const { authError, bootstrapAdmin, login } = useAuth();
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [bootstrapForm, setBootstrapForm] = useState(initialBootstrap);
  const [isBootstrapMode, setIsBootstrapMode] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(
    () => (isBootstrapMode ? 'Criar administrador inicial' : 'Entrar no painel'),
    [isBootstrapMode]
  );

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      await login(loginForm);
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBootstrapSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      await bootstrapAdmin({
        ...bootstrapForm,
        id_cargo: bootstrapForm.id_cargo ? Number(bootstrapForm.id_cargo) : null
      });
      setStatus({
        type: 'success',
        text: 'Administrador criado. Agora faça login com o mesmo email e senha.'
      });
      setIsBootstrapMode(false);
      setLoginForm({
        email: bootstrapForm.email,
        password: bootstrapForm.password
      });
      setBootstrapForm(initialBootstrap);
    } catch (error) {
      setStatus({ type: 'error', text: extractApiError(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">Assistência Técnica SaaS</p>
        <h1>{title}</h1>

        {!isBootstrapMode ? (
          <form className="form-stack" onSubmit={handleLoginSubmit}>
            <label>
              Email
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((form) => ({ ...form, email: event.target.value }))
                }
                placeholder="admin@assistencia.com"
                required
              />
            </label>

            <label>
              Senha
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((form) => ({ ...form, password: event.target.value }))
                }
                placeholder="Sua senha"
                required
              />
            </label>

            <button type="submit" className="button button-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form className="form-stack" onSubmit={handleBootstrapSubmit}>
            <label>
              Nome do administrador
              <input
                type="text"
                value={bootstrapForm.nome}
                onChange={(event) =>
                  setBootstrapForm((form) => ({ ...form, nome: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={bootstrapForm.email}
                onChange={(event) =>
                  setBootstrapForm((form) => ({ ...form, email: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Senha
              <input
                type="password"
                minLength={6}
                value={bootstrapForm.password}
                onChange={(event) =>
                  setBootstrapForm((form) => ({ ...form, password: event.target.value }))
                }
                required
              />
            </label>

            <label>
              ID do cargo (opcional)
              <input
                type="number"
                min="1"
                value={bootstrapForm.id_cargo}
                onChange={(event) =>
                  setBootstrapForm((form) => ({ ...form, id_cargo: event.target.value }))
                }
                placeholder="Exemplo: 1"
              />
            </label>

            <button type="submit" className="button button-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar administrador'}
            </button>
          </form>
        )}

        <InlineMessage type={status.type}>{status.text || authError}</InlineMessage>

        <button
          type="button"
          className="button button-link"
          onClick={() => {
            setStatus({ type: '', text: '' });
            setIsBootstrapMode((value) => !value);
          }}
        >
          {isBootstrapMode ? 'Voltar para login' : 'Primeiro acesso? Criar administrador'}
        </button>
      </div>
    </div>
  );
}
