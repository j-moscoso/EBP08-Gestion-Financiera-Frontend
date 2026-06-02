import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import logo from '../../imports/Logo_login.png';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { recoverPassword } = useApp();
  const [email, setEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (!recoveryCode.trim()) {
      setError('Ingresa el código de recuperación');
      return;
    }

    setLoading(true);

    void (async () => {
      try {
        const token = await recoverPassword(email.trim(), recoveryCode.trim());
        setSuccess(true);
        toast.success('Código validado correctamente');
        navigate(`/reset-password?token=${encodeURIComponent(token)}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo validar el código');
      } finally {
        setLoading(false);
      }
    })();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Logo"
              className="w-20 h-20 object-contain mx-auto mb-4"
            />
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-foreground mb-3">Código validado</h1>
              <p className="text-muted-foreground mb-6">
                Redirigiendo al formulario para crear tu nueva contraseña.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Logo"
            className="w-20 h-20 object-contain mx-auto mb-4"
          />
          <h1 className="text-foreground mb-2">Recuperar contraseña</h1>
          <p className="text-muted-foreground">
            Ingresa tu correo electrónico y te enviaremos instrucciones
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-foreground mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="recoveryCode" className="block text-foreground mb-2">
                Código de recuperación
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="recoveryCode"
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => {
                    setRecoveryCode(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ingresa el código recibido"
                  required
                />
              </div>
            </div>

            {error && <p className="text-destructive text-sm mt-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              {loading ? 'Validando...' : 'Continuar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
