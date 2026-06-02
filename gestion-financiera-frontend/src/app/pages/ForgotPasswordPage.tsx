import { useEffect } from 'react';
import { useNavigate } from 'react-router';

// La recuperación por correo electrónico ha sido eliminada.
// Esta ruta redirige directamente a la recuperación por código.
export function ForgotPasswordPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/recovery-code-login', { replace: true });
  }, [navigate]);

  return null;
}
