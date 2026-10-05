import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get('fullName') ?? '').trim();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    const confirmPassword = String(form.get('confirmPassword') ?? '');
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Completa todos los campos.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('El correo ingresado no es válido.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.register({ fullName, email, password, confirmPassword });
      navigate('/login', { replace: true, state: { registeredEmail: email } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible registrar el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-card" aria-labelledby="register-title">
      <span className="eyebrow">Tu cuenta</span>
      <h1 id="register-title">Crear cuenta</h1>
      <p className="subtitle">Comienza con un saldo de $0.00.</p>
      <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting}>
          <label htmlFor="fullName">Nombre completo</label>
          <input id="fullName" name="fullName" autoComplete="name" required />
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} aria-describedby="password-help" required />
          <small id="password-help">Usa al menos 8 caracteres.</small>
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
          {error && <p className="message error" role="alert">{error}</p>}
          <button type="submit">{isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}</button>
        </fieldset>
      </form>
      <p className="form-footer">¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
    </main>
  );
}
