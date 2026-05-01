import { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, changePassword } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    // Validaciones
    if (!currentPassword) {
      newErrors.currentPassword = 'Este campo es requerido';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Este campo es requerido';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Intentar cambiar contraseña
    if (!user) return;

    const success = changePassword(user.email, currentPassword, newPassword);

    if (success) {
      toast.success('Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } else {
      setErrors({ currentPassword: 'Contraseña actual incorrecta' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-foreground mb-2">Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Usuario */}
        <div className="lg:col-span-1">
          <div className="bg-card p-6 rounded-xl shadow-md border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-foreground">{user?.name}</h2>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cambiar Contraseña */}
        <div className="lg:col-span-2">
          <div className="bg-card p-6 rounded-xl shadow-md border border-border">
            <h2 className="text-foreground mb-6">Cambiar contraseña</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Contraseña Actual */}
              <div>
                <label htmlFor="currentPassword" className="block text-foreground mb-2">
                  Contraseña actual
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setErrors({ ...errors, currentPassword: '' });
                    }}
                    className={`w-full pl-11 pr-11 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.currentPassword ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Contraseña actual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-destructive text-sm mt-2">{errors.currentPassword}</p>
                )}
              </div>

              {/* Nueva Contraseña */}
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
                      setErrors({ ...errors, newPassword: '' });
                    }}
                    className={`w-full pl-11 pr-11 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.newPassword ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Mínimo 8 caracteres"
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
                {errors.newPassword && (
                  <p className="text-destructive text-sm mt-2">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-foreground mb-2">
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors({ ...errors, confirmPassword: '' });
                    }}
                    className={`w-full pl-11 pr-11 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.confirmPassword ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Confirma tu nueva contraseña"
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
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-2">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Actualizar contraseña
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
