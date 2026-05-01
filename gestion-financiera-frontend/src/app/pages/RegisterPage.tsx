import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import logo from '../../imports/Logo_login.png';

export function RegisterPage() {
  const navigate = useNavigate();
  const { user, setUser, registerUser, registeredUsers } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: string[] = [];

    // Validaciones
    if (!name) newErrors.push('El nombre es requerido');
    if (!email) newErrors.push('El correo electrónico es requerido');
    if (!password) newErrors.push('La contraseña es requerida');
    if (password.length < 6) newErrors.push('La contraseña debe tener al menos 6 caracteres');
    if (password !== confirmPassword) newErrors.push('Las contraseñas no coinciden');

    // Verificar si el email ya está registrado
    const emailExists = registeredUsers.some(u => u.email === email);
    if (emailExists) {
      newErrors.push('Este correo electrónico ya está registrado');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    // Simulación de registro con delay
    setTimeout(() => {
      const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password,
      };

      registerUser(newUser);

      setUser({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      });

      toast.success('¡Cuenta creada exitosamente!');
      setLoading(false);
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Logo"
            className="w-20 h-20 object-contain mx-auto mb-4"
          />
          <h1 className="text-foreground mb-2">Crear Cuenta</h1>
          <p className="text-muted-foreground">Comienza a gestionar tus finanzas personales</p>
        </div>

        {/* Formulario de Registro */}
        <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-foreground mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors([]);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

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
                    setErrors([]);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-foreground mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors([]);
                  }}
                  className="w-full pl-11 pr-11 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
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
                    setErrors([]);
                  }}
                  className="w-full pl-11 pr-11 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
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

            {/* Errores */}
            {errors.length > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-2">
                {errors.map((error, index) => (
                  <p key={index} className="text-destructive text-sm flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>{error}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Botón de Registro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Link a Login */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Footer con beneficios */}
        <div className="mt-6 bg-card p-4 rounded-xl border border-border">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Control total de tus finanzas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Seguimiento de presupuestos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Categorías personalizables</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}