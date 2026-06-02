import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { KeyRound, ArrowLeft, Lock, Eye, EyeOff, Mail, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { AppLogo } from '../components/AppLogo';
import { toast } from 'sonner';
import * as api from '../services/api';

const CODE_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

type Stage = 'code-entry' | 'new-password' | 'success';

function validatePassword(pw: string) {
  return {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
  };
}

export function RecoveryCodeLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-rellenar email si viene como query param desde la página de login
  const emailFromUrl = searchParams.get('email') ?? '';

  const [stage, setStage] = useState<Stage>('code-entry');
  const [email, setEmail] = useState(emailFromUrl);
  const [emailError, setEmailError] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [temporalToken, setTemporalToken] = useState('');
  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleCodeInput = (val: string) => {
    const clean = val.replace(/-/g, '').toUpperCase().slice(0, 12);
    const parts = [clean.slice(0, 4), clean.slice(4, 8), clean.slice(8, 12)].filter(Boolean);
    setCode(parts.join('-'));
    setCodeError('');
  };

  const handleVerifyCode = async () => {
    // Validar email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Por favor ingresa un correo electrónico válido');
      return;
    }

    // Validar código
    if (!code) {
      setCodeError('Por favor ingresa un código de recuperación');
      return;
    }

    if (!CODE_REGEX.test(code)) {
      setCodeError('Formato de código inválido (debe ser XXXX-XXXX-XXXX)');
      return;
    }

    setLoading(true);
    setCodeError('');
    setEmailError('');

    try {
      // Llamar a la API de recuperación
      const token = await api.recoverPassword(email, code.replace(/-/g, ''));
      setTemporalToken(token);
      setStage('new-password');
      toast.success('Código verificado correctamente');
    } catch (error: any) {
      const errorMsg = error.message || 'Error al verificar el código';

      if (errorMsg.includes('429') || errorMsg.includes('Too Many Requests')) {
        setCodeError('Demasiados intentos. Por favor espera 30 minutos.');
      } else if (errorMsg.includes('404') || errorMsg.includes('no válido')) {
        setCodeError('Código o correo electrónico incorrecto');
      } else {
        setCodeError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setPasswordError('');

    // Validar contraseña
    const checks = validatePassword(newPassword);
    if (!checks.length || !checks.uppercase || !checks.number) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      // Llamar a la API de reset de contraseña
      await api.resetPassword(temporalToken, newPassword);
      setStage('success');
      toast.success('Contraseña restablecida exitosamente');
    } catch (error: any) {
      const errorMsg = error.message || 'Error al restablecer la contraseña';

      if (errorMsg.includes('400') || errorMsg.includes('404') || errorMsg.includes('401')) {
        setPasswordError('Token inválido o expirado. Por favor intenta nuevamente.');
      } else {
        setPasswordError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Etapa: Ingresar código
  if (stage === 'code-entry') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <AppLogo className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-foreground mb-2">Recuperación de cuenta</h1>
            <p className="text-muted-foreground">
              Ingresa tu correo y uno de tus códigos de recuperación
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
            <div className="space-y-5">
              {/* Email */}
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
                      setEmailError('');
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                {emailError && (
                  <p className="text-destructive text-sm mt-2">{emailError}</p>
                )}
              </div>

              {/* Código */}
              <div>
                <label htmlFor="code" className="block text-foreground mb-2">
                  Código de recuperación
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => handleCodeInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono tracking-wide uppercase"
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={14}
                  />
                </div>
                {codeError && (
                  <p className="text-destructive text-sm mt-2">{codeError}</p>
                )}
                <p className="text-muted-foreground text-xs mt-2">
                  Usa uno de los 10 códigos que recibiste al registrarte
                </p>
              </div>

              {/* Botón verificar */}
              <button
                onClick={handleVerifyCode}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    Verificar código
                  </>
                )}
              </button>
            </div>

            {/* Volver */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>

          {/* Ayuda */}
          <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground text-sm font-medium mb-1">
                  ¿No tienes tus códigos de recuperación?
                </p>
                <p className="text-muted-foreground text-sm">
                  Deberás contactar a soporte para recuperar el acceso a tu cuenta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Etapa: Nueva contraseña
  if (stage === 'new-password') {
    const checks = validatePassword(newPassword);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <AppLogo className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-foreground mb-2">Nueva contraseña</h1>
            <p className="text-muted-foreground">
              Ingresa tu nueva contraseña para {email}
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
            <div className="space-y-5">
              {/* Nueva contraseña */}
              <div>
                <label htmlFor="newPassword" className="block text-foreground mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                    }}
                    className="w-full pl-11 pr-11 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Requisitos */}
                {newPassword && (
                  <div className="mt-3 space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${checks.length ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checks.length ? 'bg-primary' : 'bg-muted'}`}>
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      Al menos 8 caracteres
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${checks.uppercase ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checks.uppercase ? 'bg-primary' : 'bg-muted'}`}>
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      Una letra mayúscula
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${checks.number ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${checks.number ? 'bg-primary' : 'bg-muted'}`}>
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      Un número
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-foreground mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    className="w-full pl-11 pr-11 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Confirma tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {passwordError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{passwordError}</p>
                </div>
              )}

              {/* Botón */}
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Restableciendo...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Restablecer contraseña
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Etapa: Éxito
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <AppLogo className="h-16 w-auto mx-auto mb-4" />
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-foreground mb-3">¡Contraseña actualizada!</h1>
            <p className="text-muted-foreground mb-6">
              Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Ir al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
