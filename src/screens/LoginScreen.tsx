import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authRepo } from '../database'; // Cambiado desde ../services a tu carpeta database

type Modo = 'entrar' | 'registrar';

export function LoginScreen() {
  const [modo, setModo] = useState<Modo>('entrar');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    try {
      setEnviando(true); setError(null); setAviso(null);

      const correoLimpio = correo.trim().toLowerCase();
      if (!correoLimpio.includes('@')) throw new Error('Escribe un correo válido');
      if (contrasena.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

      if (modo === 'entrar') {
        await authRepo.iniciarSesion(correoLimpio, contrasena);
        // No navegamos: App detecta el cambio y muestra la app
      } else {
        const resultado = await authRepo.registrar(correoLimpio, contrasena, nombre.trim());
        if (resultado?.requiereConfirmacion) {
          setAviso('Te enviamos un correo. Confírmalo y luego inicia sesión.');
          setModo('entrar');
        } else {
          setAviso('¡Cuenta creada con éxito!');
        }
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={estilos.titulo}>
          {modo === 'entrar' ? '🔐 Iniciar sesión' : '🆕 Crear cuenta'}
        </Text>

        {modo === 'registrar' && (
          <TextInput placeholder="Nombre" value={nombre}
            onChangeText={setNombre} style={estilos.input} placeholderTextColor="#888" />
        )}
        <TextInput placeholder="Correo" autoCapitalize="none"
          keyboardType="email-address" value={correo}
          onChangeText={setCorreo} style={estilos.input} placeholderTextColor="#888" />
        <TextInput placeholder="Contraseña" secureTextEntry value={contrasena}
          onChangeText={setContrasena} style={estilos.input} placeholderTextColor="#888" />

        {error && <Text style={estilos.error}>⚠️ {error}</Text>}
        {aviso && <Text style={estilos.suave}>✅ {aviso}</Text>}

        <Pressable onPress={enviar} disabled={enviando}
          style={[estilos.boton, enviando && { opacity: 0.6 }]}>
          {enviando ? <ActivityIndicator color="#fff" />
            : <Text style={estilos.botonTexto}>
                {modo === 'entrar' ? 'Entrar' : 'Registrarme'}
              </Text>}
        </Pressable>

        <Pressable
          onPress={() => { setModo(modo === 'entrar' ? 'registrar' : 'entrar'); setError(null); }}
          style={[estilos.botonSecundario, { marginTop: 12, alignItems: 'center' }]}>
          <Text style={estilos.botonSecundarioTexto}>
            {modo === 'entrar' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// Estilos locales agregados para reemplazar la importación de '../theme/estilos'
const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
  },
  input: {
    height: 50,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#000000',
  },
  boton: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  botonTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonSecundario: {
    paddingVertical: 8,
  },
  botonSecundarioTexto: {
    color: '#007AFF',
    fontSize: 14,
  },
  error: {
    color: '#d9534f',
    marginBottom: 10,
    textAlign: 'center',
  },
  suave: {
    color: '#28a745',
    marginBottom: 10,
    textAlign: 'center',
  },
});