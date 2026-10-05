import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state: unknown = location.state;
  const registeredEmail = typeof state === 'object' && state !== null
    && 'registeredEmail' in state && typeof state.registeredEmail === 'string'
    ? state.registeredEmail : '';
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('El correo ingresado no es válido.');
      return;
    }
    if (password.length < 8) {
      setError('Correo o contraseña incorrectos.');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-card" aria-labelledby="login-title">
      <span className="eyebrow">Tu cuenta</span>
      <h1 id="login-title">Bienvenido de nuevo</h1>
      <p className="subtitle">Inicia sesión.</p>
      {registeredEmail && <p className="message success" role="status">Tu cuenta está lista. Inicia sesión para continuar.</p>}
      <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting}>
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" autoComplete="username" defaultValue={registeredEmail} required />
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
          {error && <p className="message error" role="alert">{error}</p>}
          <button type="submit">{isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}</button>
        </fieldset>
      </form>
      <p className="form-footer">¿Aún no tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </main>
  );
}
