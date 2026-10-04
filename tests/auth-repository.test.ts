// @ts-nocheck
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAuthRepository } from '../src/data/SupabaseAuthRepository';

const usuarioSupabase = {
  id: 'u-1',
  email: 'ana@umg.edu.gt',
  email_confirmed_at: '2026-01-01T00:00:00.000Z',
  user_metadata: { nombre: 'Ana López' },
};

const usuarioEsperado = {
  id: 'u-1',
  correo: 'ana@umg.edu.gt',
  nombre: 'Ana López',
  correoConfirmado: true,
};

function clienteConAuth(auth: Record<string, jest.Mock>): SupabaseClient {
  return { auth } as unknown as SupabaseClient;   // cliente falso
}

describe('SupabaseAuthRepository', () => {
  it('registrar: mapea el usuario cuando no requiere confirmación', async () => {
    const auth = {
      signUp: jest.fn().mockResolvedValue({
        data: { user: usuarioSupabase, session: { user: usuarioSupabase } },
        error: null,
      }),
    };
    const repo = new SupabaseAuthRepository(clienteConAuth(auth));

    const resultado = await repo.registrar('ana@umg.edu.gt', 'secreta123', 'Ana López');

    expect(resultado.requiereConfirmacion).toBe(false);
    expect(resultado.sesion).toEqual(usuarioEsperado);
  });

  it('registrar: requiereConfirmacion cuando no hay sesión', async () => {
    const auth = {
      signUp: jest.fn().mockResolvedValue({
        data: { user: usuarioSupabase, session: null }, error: null,
      }),
    };
    const repo = new SupabaseAuthRepository(clienteConAuth(auth));

    const resultado = await repo.registrar('ana@umg.edu.gt', 'secreta123', 'Ana');

    expect(resultado.requiereConfirmacion).toBe(true);
    expect(resultado.sesion).toBeNull();
  });

  it('iniciarSesion: mapea la sesión', async () => {
    const auth = {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: usuarioSupabase, session: {} }, error: null,
      }),
    };
    const repo = new SupabaseAuthRepository(clienteConAuth(auth));

    await expect(repo.iniciarSesion('ana@umg.edu.gt', 'secreta123'))
      .resolves.toEqual(usuarioEsperado);
  });

  it('iniciarSesion: traduce credenciales inválidas', async () => {
    const auth = {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      }),
    };
    const repo = new SupabaseAuthRepository(clienteConAuth(auth));

    await expect(repo.iniciarSesion('ana@umg.edu.gt', 'mala'))
      .rejects.toThrow('Correo o contraseña incorrectos');
  });
});
// --- ERRORES (5) ---
describe('traducirErrorAuth', () => {
  it.each([
    ['Invalid login credentials', 'Correo o contraseña incorrectos'],
    ['Email not confirmed', 'Debes confirmar tu correo antes de entrar'],
    ['User already registered', 'Ese correo ya está registrado'],
    ['Password should be at least 6 characters.', 'La contraseña debe tener al menos 6 caracteres'],
  ])('traduce "%s"', (original, esperado) => {
    expect(traducirErrorAuth({ message: original })).toBe(esperado);
  });

  it('usa mensaje genérico para errores desconocidos', () => {
    expect(traducirErrorAuth({ message: 'algo raro' }))
      .toBe('No pudimos completar la operación. Intenta de nuevo');
  });
});