import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/database/supabase';

// Dentro de tu componente de formulario:
const [nombre, setNombre] = useState('');
const [proveedor, setProveedor] = useState('');
const [precio, setPrecio] = useState('');
const [stock, setStock] = useState('');
const [guardando, setGuardando] = useState(false);

const guardarProducto = async () => {
  // Validación básica
  if (!nombre.trim() || !proveedor.trim() || !precio.trim() || !stock.trim()) {
    Alert.alert('Validación', 'Todos los campos son obligatorios.');
    return;
  }

  const precioNum = parseFloat(precio);
  const stockNum = parseInt(stock, 10);

  if (isNaN(precioNum) || isNaN(stockNum)) {
    Alert.alert('Validación', 'El precio y el stock deben ser números válidos.');
    return;
  }

  setGuardando(true);
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          nombre: nombre.trim(),
          proveedor: proveedor.trim(),
          precio: precioNum,
          stock: stockNum,
        },
      ]);

    if (error) {
      console.error('Error de Supabase:', error);
      Alert.alert('Error al guardar', error.message);
      return;
    }

    Alert.alert('Éxito', 'Producto guardado correctamente.');
    
    // Limpiar formulario y/o cerrar modal
    setNombre('');
    setProveedor('');
    setPrecio('');
    setStock('');
  } catch (err) {
    console.error('Excepción:', err);
    Alert.alert('Error', 'Ocurrió un fallo inesperado.');
  } finally {
    setGuardando(false);
  }
};