import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { authRepo } from '../database';
import type { UsuarioSesion } from '../models/UsuarioSesion';

export default function RootLayout() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const url = Linking.useURL();

  // 1. Escuchar el estado de autenticación de Supabase
  useEffect(() => {
    const unsubscribe = authRepo.escucharCambios((sessionUser) => {
      setUsuario(sessionUser);
      setCargando(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // 2. Procesar Magic Link / OAuth URL si el usuario vuelve mediante deep link
  useEffect(() => {
    if (url) {
      (authRepo as any).completarSesionDesdeUrl?.(url).catch(() => {});
    }
  }, [url]);

  // 3. Control de redirección protegido mediante diferimiento seguro de renderizado
  useEffect(() => {
    if (cargando) return;

    const rutaActual = (segments[0] as string) || '';
    const enGrupoAutenticado = ['students', 'explore', 'formulario'].includes(rutaActual);

    const timer = setTimeout(() => {
      if (!usuario && enGrupoAutenticado) {
        router.replace('/' as any);
      } else if (usuario && !enGrupoAutenticado) {
        router.replace('/students' as any);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [usuario, cargando, segments[0]]);

  if (cargando) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="students" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="formulario" />
      </Stack>
    </SafeAreaProvider>
  );
}