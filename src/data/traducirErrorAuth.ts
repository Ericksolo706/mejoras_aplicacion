/** Convierte los errores de Supabase en mensajes para el usuario. */
export function traducirErrorAuth(error: { message: string }): string {
  const mensaje = error.message.toLowerCase();

  if (mensaje.includes('invalid login credentials'))
    return 'Correo o contraseña incorrectos';
  if (mensaje.includes('email not confirmed'))
    return 'Debes confirmar tu correo antes de entrar';
  if (mensaje.includes('user already registered'))
    return 'Ese correo ya está registrado';
  if (mensaje.includes('password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres';
  if (mensaje.includes('unable to validate email address'))
    return 'El correo no es válido';
  if (mensaje.includes('email rate limit exceeded'))
    return 'Demasiados intentos. Espera un momento';

  return 'No pudimos completar la operación. Intenta de nuevo';
}