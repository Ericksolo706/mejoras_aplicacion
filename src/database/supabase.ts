import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UsuarioSesion } from '../models/UsuarioSesion';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function traducirErrorAuth(error: any): string {
  const msg = error?.message || '';
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos';
  if (msg.includes('Email not confirmed')) return 'Debes confirmar tu correo antes de entrar';
  if (msg.includes('User already registered')) return 'Ese correo ya está registrado';
  if (msg.includes('Password should be at least 6 characters')) return 'La contraseña debe tener al menos 6 caracteres';
  return 'No pudimos completar la operación. Intenta de nuevo';
}

export class SupabaseAuthRepository {
  constructor(private cliente: SupabaseClient = supabase) {}

  private mapearUsuario(user: any): UsuarioSesion {
    return {
      id: user.id,
      correo: user.email ?? '',
      nombre: user.user_metadata?.nombre ?? '',
      correoConfirmado: !!user.email_confirmed_at,
    };
  }

  async registrar(
    correo: string,
    clave: string,
    nombre: string
  ): Promise<{ requiereConfirmacion: boolean; sesion: UsuarioSesion | null }> {
    const { data, error } = await this.cliente.auth.signUp({
      email: correo,
      password: clave,
      options: {
        data: { nombre },
      },
    });

    if (error) throw new Error(traducirErrorAuth(error));

    const requiereConfirmacion = !data.session;
    const sesion = data.session ? this.mapearUsuario(data.session.user) : null;

    return { requiereConfirmacion, sesion };
  }

  async iniciarSesion(correo: string, clave: string): Promise<UsuarioSesion> {
    const { data, error } = await this.cliente.auth.signInWithPassword({
      email: correo,
      password: clave,
    });

    if (error) throw new Error(traducirErrorAuth(error));
    if (!data.user) throw new Error('No se pudo obtener la información del usuario');

    return this.mapearUsuario(data.user);
  }

  async cerrarSesion(): Promise<void> {
    const { error } = await this.cliente.auth.signOut();
    if (error) throw new Error(traducirErrorAuth(error));
  }

  async obtenerSesion(): Promise<UsuarioSesion | null> {
    const { data, error } = await this.cliente.auth.getSession();
    if (error) throw new Error(traducirErrorAuth(error));
    return data.session ? this.mapearUsuario(data.session.user) : null;
  }

  escucharCambios(callback: (usuario: UsuarioSesion | null) => void): () => void {
    const { data: listener } = this.cliente.auth.onAuthStateChange((_event, session) => {
      callback(session ? this.mapearUsuario(session.user) : null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }

  async enviarEnlaceMagico(correo: string, urlRetorno: string): Promise<void> {
    const { error } = await this.cliente.auth.signInWithOtp({
      email: correo,
      options: { emailRedirectTo: urlRetorno },
    });
    if (error) throw new Error(traducirErrorAuth(error));
  }

  async completarSesionDesdeUrl(url: string): Promise<UsuarioSesion | null> {
    const urlObj = new URL(url);
    const hash = urlObj.hash.substring(1);
    const params = new URLSearchParams(hash || urlObj.search);

    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (!access_token) return null;

    const { data, error } = await this.cliente.auth.setSession({
      access_token,
      refresh_token: refresh_token || '',
    });

    if (error) throw new Error(traducirErrorAuth(error));
    return data.session ? this.mapearUsuario(data.session.user) : null;
  }

  async obtenerUrlGoogle(urlRetorno: string): Promise<string> {
    const { data, error } = await this.cliente.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: urlRetorno,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw new Error(traducirErrorAuth(error));
    if (!data.url) throw new Error('No se pudo abrir Google');

    return data.url;
  }
}