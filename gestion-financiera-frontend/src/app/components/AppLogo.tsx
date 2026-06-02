// ─── Logotipo de la aplicación ───────────────────────────────────────────────
// Para cambiar el logo basta con reemplazar la imagen importada abajo.
// Ajusta `className` si necesitas otro tamaño o forma.
import logo from '../../imports/Logo_login.png';

interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className = 'h-10 w-auto' }: AppLogoProps) {
  return (
    <img
      src={logo}
      alt="Logo"
      className={className}
      draggable={false}
    />
  );
}
