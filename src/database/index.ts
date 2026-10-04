import { supabase } from './supabase';
import { SupabaseAuthRepository } from '../data/SupabaseAuthRepository';

// Instanciamos únicamente el repositorio de autenticación
export const authRepo = new SupabaseAuthRepository(supabase);