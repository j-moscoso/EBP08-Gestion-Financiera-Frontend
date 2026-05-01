import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import logo from '../../imports/Logo_login.png';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { resetPassword } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setTokenExpired(true);
      return;
    }

    // Validaciones
    if (!validatePassword(newPassword)) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Intentar restablecer contraseña
    const result = resetPassword(token, newPassword);

    if (result) {
      setSuccess(true);
      toast.success('Contraseña restablecida exitosamente');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setTokenExpired(true);
    }
  };

  if (tokenExpired) {
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
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-foreground mb-3">Enlace inválido o expirado</h1>
              <p className="text-muted-foreground mb-6">
                Este enlace de restablecimiento de contraseña ha expirado o ya ha sido utilizado.
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Solicitar nuevo enlace
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-foreground mb-3">¡Contraseña actualizada!</h1>
              <p className="text-muted-foreground mb-6">
                Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión.
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
          <h1 className="text-foreground mb-2">Restablecer contraseña</h1>
          <p className="text-muted-foreground">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="newPassword" className="block text-foreground mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-11 pr-11 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {newPassword && !validatePassword(newPassword) && (
                <p className="text-destructive text-sm mt-2">
                  La contraseña debe tener al menos 8 caracteres
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-foreground mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-11 pr-11 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Confirma tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Restablecer contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
