import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck, Copy, CheckCheck, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { AppLogo } from '../components/AppLogo';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export function RecoveryCodesPage() {
  const navigate = useNavigate();
  const { loginWithCredentials } = useApp();
  const [codes, setCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Leer códigos del backend guardados por RegisterPage
    const codesStr = sessionStorage.getItem('recovery_codes');
    if (codesStr) {
      setCodes(JSON.parse(codesStr));
    } else {
      // Si no hay códigos, redirigir a registro
      toast.error('No hay códigos de recuperación disponibles');
      navigate('/register');
    }
  }, [navigate]);

  const handleCopyAll = () => {
    const text = codes.map((c, i) => `${i + 1}. ${c}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Códigos copiados al portapapeles');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleContinue = async () => {
    if (!confirmed) {
      toast.error('Debes confirmar que guardaste tus códigos antes de continuar');
      return;
    }

    setLoading(true);

    try {
      // Leer credenciales guardadas por RegisterPage
      const email = sessionStorage.getItem('pending_email');
      const password = sessionStorage.getItem('pending_password');

      if (email && password) {
        // Hacer login automático
        await loginWithCredentials(email, password);

        // Limpiar datos temporales
        sessionStorage.removeItem('recovery_codes');
        sessionStorage.removeItem('pending_email');
        sessionStorage.removeItem('pending_password');

        toast.success('¡Bienvenido!');
        navigate('/');
      } else {
        toast.error('Error al iniciar sesión automáticamente');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <AppLogo className="h-16 w-auto mx-auto mb-4" />
        </div>

        {/* Alerta de seguridad */}
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm font-medium mb-1">
              Estos códigos solo se muestran una vez
            </p>
            <p className="text-amber-700 text-sm">
              Guárdalos en un lugar seguro (gestor de contraseñas, papel físico, etc.).
              No los recibirás por ningún otro canal y no podrás volver a verlos.
            </p>
          </div>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-foreground">Códigos de recuperación</h1>
              <p className="text-muted-foreground text-sm">
                10 códigos de un solo uso — úsalos si pierdes acceso a tu contraseña
              </p>
            </div>
          </div>

          {/* Grid de códigos */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {codes.map((code, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg font-mono text-sm"
              >
                <span className="text-muted-foreground text-xs w-5 shrink-0">{i + 1}.</span>
                <span className="text-foreground tracking-wide">{code}</span>
              </div>
            ))}
          </div>

          {/* Botón copiar */}
          <button
            type="button"
            onClick={handleCopyAll}
            className="w-full flex items-center justify-center gap-2 py-2.5 mb-6 border border-border rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
          >
            {copied ? (
              <><CheckCheck className="w-4 h-4 text-primary" /> Copiados</>
            ) : (
              <><Copy className="w-4 h-4" /> Copiar todos los códigos</>
            )}
          </button>

          {/* Confirmación */}
          <label className="flex items-start gap-3 cursor-pointer mb-6 group">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  confirmed
                    ? 'bg-primary border-primary'
                    : 'border-border group-hover:border-primary/50'
                }`}
              >
                {confirmed && <CheckCheck className="w-3 h-3 text-primary-foreground" />}
              </div>
            </div>
            <span className="text-sm text-muted-foreground leading-relaxed">
              He guardado mis códigos en un lugar seguro y entiendo que no volverán a mostrarse
            </span>
          </label>

          {/* Continuar */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!confirmed || loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                Ir al Dashboard
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-4">
          Formato: XXXX-XXXX-XXXX · Cada código solo puede usarse una vez
        </p>
      </div>
    </div>
  );
}
