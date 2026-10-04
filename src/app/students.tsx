import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '@/database/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Estudiante = {
  id: number;
  'nombre completo': string;
  carnet: string;
  carrera: string;
};

export default function StudentsScreen() {
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarEstudiantes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        Alert.alert('Error al cargar', error.message);
        return;
      }

      setEstudiantes((data ?? []) as Estudiante[]);
    } catch (err) {
      Alert.alert('Ha ocurrido un error', err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarEstudiantes();
    }, [])
  );

  const renderItem = ({ item }: { item: Estudiante }) => (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{item['nombre completo']}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Carné: {item.carnet}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Carrera: {item.carrera}
      </ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Lista de Alumnos</ThemedText>

          {/* Botones de acción arriba de la lista */}
          <ThemedView style={styles.botonesHeader}>
            <Pressable
              style={({ pressed }) => pressed && styles.pressed}
              onPress={() => router.push('/explore' as any)}>
              <ThemedView type="backgroundElement" style={styles.profileButton}>
                <ThemedText type="small" style={styles.buttonText}>
                  👤 Mi Perfil
                </ThemedText>
              </ThemedView>
            </Pressable>

            <Pressable
              style={({ pressed }) => pressed && styles.pressed}
              onPress={() => router.push('/formulario' as any)}>
              <ThemedView type="backgroundSelected" style={styles.newButton}>
                <ThemedText type="small" style={styles.buttonText}>
                  + Nuevo Estudiante
                </ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
        </ThemedView>

        {loading ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
            Cargando alumnos…
          </ThemedText>
        ) : estudiantes.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
            No hay alumnos registrados.
          </ThemedText>
        ) : (
          <FlatList
            data={estudiantes}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshing={loading}
            onRefresh={cargarEstudiantes}
          />
        )}
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
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    alignSelf: 'stretch',
  },
  botonesHeader: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  profileButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  newButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  buttonText: { fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: Spacing.five },
  listContent: { alignSelf: 'stretch', gap: Spacing.three, paddingBottom: Spacing.four },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  pressed: { opacity: 0.7 },
});