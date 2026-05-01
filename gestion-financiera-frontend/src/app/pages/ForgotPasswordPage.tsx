import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import logo from '../../imports/Logo_login.png';

export function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    // Simular envío de correo
    sendPasswordResetEmail(email);
    setSuccess(true);
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
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-foreground mb-3">Revisa tu correo</h1>
              <p className="text-muted-foreground mb-6">
                Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-primary hover:underline"
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
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Enviar instrucciones
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
