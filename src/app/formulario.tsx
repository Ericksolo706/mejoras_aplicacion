import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '@/database/supabase';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FormularioScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [nombre, setNombre] = useState('');
  const [carne, setCarne] = useState('');
  const [carrera, setCarrera] = useState('');
  const [guardando, setGuardando] = useState(false);

  const guardarEstudiante = async () => {
    if (!nombre.trim() || !carne.trim() || !carrera.trim()) {
      Alert.alert('Validación', 'Todos los campos son obligatorios.');
      return;
    }

    if (nombre.trim().length < 3) {
      Alert.alert('Validación', 'El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (carne.trim().length < 4) {
      Alert.alert('Validación', 'El carné debe tener al menos 4 caracteres.');
      return;
    }

    setGuardando(true);
    try {
      const { error } = await supabase
        .from('students')
        .insert([
          {
            'nombre completo': nombre.trim(),
            carnet: carne.trim(),
            carrera: carrera.trim(),
          },
        ]);

      if (error) {
        console.error('Error de Supabase:', error);
        Alert.alert('Error de Supabase', error.message);
        return;
      }

      Alert.alert('Éxito', 'Alumno guardado correctamente.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.error('Exception:', err);
      Alert.alert('Error', err instanceof Error ? err.message : String(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Ingresar Alumno</ThemedText>

        <ThemedView type="backgroundElement" style={styles.formCard}>
          <ThemedView type="backgroundElement" style={styles.field}>
            <ThemedText type="smallBold">Nombre Completo</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej. Carlos López"
              placeholderTextColor={theme.textSecondary}
            />
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.field}>
            <ThemedText type="smallBold">Carné</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              value={carne}
              onChangeText={setCarne}
              placeholder="Ej. 2024-0012"
              placeholderTextColor={theme.textSecondary}
            />
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.field}>
            <ThemedText type="smallBold">Carrera</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              value={carrera}
              onChangeText={setCarrera}
              placeholder="Ej. Ingeniería en Sistemas"
              placeholderTextColor={theme.textSecondary}
            />
          </ThemedView>

          <Pressable
            disabled={guardando}
            style={({ pressed }) => pressed && styles.pressed}
            onPress={guardarEstudiante}>
            <ThemedView type="backgroundSelected" style={styles.saveButton}>
              <ThemedText type="small" style={styles.saveButtonText}>
                {guardando ? 'Guardando…' : 'Guardar Alumno'}
              </ThemedText>
            </ThemedView>
          </Pressable>

          <Pressable
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => router.back()}>
            <ThemedView style={styles.cancelButton}>
              <ThemedText type="small" themeColor="textSecondary">
                Cancelar
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', flexDirection: 'row' },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    paddingTop: Spacing.four,
  },
  formCard: {
    alignSelf: 'stretch',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  field: { gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  saveButtonText: { fontWeight: '700' },
  cancelButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
});