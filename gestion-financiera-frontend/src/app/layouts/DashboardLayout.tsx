import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { LogOut, LayoutDashboard, Target, FolderOpen, Menu, X, TrendingUp, TrendingDown, User, Lightbulb, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { AppLogo } from '../components/AppLogo';

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loadUserData } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirigir a login si no hay usuario
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Cargar datos del usuario al entrar al dashboard
  useEffect(() => {
    if (user && user.id === 'pending') {
      // Si el usuario es temporal (solo token), cargar datos completos
      loadUserData();
    }
  }, [user, loadUserData]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/budgets', label: 'Presupuestos', icon: Target },
    { path: '/incomes', label: 'Ingresos', icon: TrendingUp },
    { path: '/expenses', label: 'Gastos', icon: TrendingDown },
    { path: '/categories', label: 'Categorías', icon: FolderOpen },
    { path: '/recommendations', label: 'Recomendaciones', icon: Lightbulb },
    { path: '/reports', label: 'Reportes', icon: FileText },
    { path: '/profile', label: 'Perfil', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <AppLogo className="h-10 w-auto" />
              <div className="hidden lg:block">
                <h2 className="text-foreground text-sm whitespace-nowrap">Bienvenido, {user.name}</h2>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-end">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Cerrar sesión</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-border mt-2 pt-2">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar sesión</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
