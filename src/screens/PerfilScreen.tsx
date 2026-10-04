import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { UsuarioSesion } from '../models/UsuarioSesion';
import { authRepo } from '../database';

export function PerfilScreen() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    authRepo
      .obtenerSesion()
      .then((u) => {
        if (activo) setUsuario(u);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  function confirmarCerrarSesion() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await authRepo.cerrarSesion();
            } catch (e) {
              Alert.alert('Error', (e as Error).message);
            }
          },
        },
      ]
    );
  }

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color="#4a148c" />
      </View>
    );
  }

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>👤 {usuario?.nombre || 'Usuario'}</Text>
        <Text style={estilos.suave}>{usuario?.correo}</Text>
        <Text style={estilos.suave}>
          {usuario?.correoConfirmado
            ? '✅ Correo confirmado'
            : '⚠️ Correo sin confirmar'}
        </Text>
      </View>

      <Pressable
        onPress={confirmarCerrarSesion}
        style={[estilos.boton, { backgroundColor: '#c62828' }]}
      >
        <Text style={estilos.botonTexto}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  suave: {
    fontSize: 15,
    color: '#666666',
    marginTop: 4,
  },
  boton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});