import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  function handleLogout() {
    try {
      logout();
      navigate('/login', { replace: true, state: null });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible cerrar sesión.');
    }
  }

  return (
    <main className="auth-card dashboard" aria-labelledby="dashboard-title">
      <span className="eyebrow">Mi cuenta</span>
      <h1 id="dashboard-title">Hola, {user?.fullName}</h1>
      <section className="balance" aria-labelledby="balance-title">
        <h2 id="balance-title">Saldo actual</h2>
        <p>{currency.format(user?.balance ?? 0)}</p>
      </section>
      {error && <p className="message error" role="alert">{error}</p>}
      <button className="secondary" type="button" onClick={handleLogout}>Cerrar sesión</button>
    </main>
  );
}
