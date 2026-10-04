/**
 * Usuario autenticado, ya traducido al dominio de la app.
 * Las pantallas NUNCA ven el tipo `User` de Supabase.
 */
export interface UsuarioSesion {
  id: string;
  correo: string;
  nombre: string;
  correoConfirmado: boolean;
}