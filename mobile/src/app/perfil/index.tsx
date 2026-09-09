import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as ImagePicker from 'expo-image-picker';

const schema = yup.object().shape({
  artisticName: yup.string().required('El nombre artístico es obligatorio'),
  genre: yup.string().required('El género principal es obligatorio'),
  bio: yup.string().min(10, 'La biografía debe tener al menos 10 caracteres').required('La biografía es obligatoria'),
});

interface ProfileForm {
  artisticName: string;
  genre: string;
  bio: string;
}

const AVAILABLE_TAGS = [
  { id: '1', label: 'Beatmaker', icon: '🎹' },
  { id: '2', label: 'Mezcla & Master', icon: '🎚️' },
  { id: '3', label: 'Vocalista', icon: '🎙️' },
  { id: '4', label: 'Sound Design', icon: '🎛️' },
  { id: '5', label: 'Trap', icon: '🔥' },
  { id: '6', label: 'Lo-Fi', icon: '☕' },
  { id: '7', label: 'Reggaeton', icon: '🔊' },
  { id: '8', label: 'DJ', icon: '🎧' },
];

export default function ArtistProfileScreen() {
  const [selectedTags, setSelectedTags] = useState<string[]>(['Beatmaker', 'Sound Design']);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      artisticName: 'Nicolás Ortiz',
      genre: 'Producción Musical / DJ',
      bio: 'Apasionado por la producción de audio, mezcla y diseño de sonido.',
    }
  });

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Necesitas conceder acceso a la galería para cambiar la foto de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const toggleTag = (label: string) => {
    if (selectedTags.includes(label)) {
      setSelectedTags(selectedTags.filter(t => t !== label));
    } else {
      setSelectedTags([...selectedTags, label]);
    }
  };

  const onSubmit = (data: ProfileForm) => {
    Alert.alert('¡Perfil Guardado!', 'Los cambios se han actualizado correctamente.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER DE LA PANTALLA */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil de Artista</Text>
        <Text style={styles.subtitle}>Configura tu identidad visual y profesional</Text>
      </View>

      {/* 1. PANEL PRIVADO DE MÉTRICAS */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricsHeader}>
          <Text style={styles.metricsTitle}>📊 Panel Privado de Analíticas</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>• EN VIVO</Text>
          </View>
        </View>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>128</Text>
            <Text style={styles.metricLabel}>Visitas</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>45</Text>
            <Text style={styles.metricLabel}>Plays</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>12</Text>
            <Text style={styles.metricLabel}>Contactos</Text>
          </View>
        </View>
      </View>

      {/* 2. SECCIÓN DE FOTO DE PERFIL CON BADGE DE ESTADO */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: avatarUri || 'https://via.placeholder.com/150/1e1b4b/ffffff?text=OZIRIS' }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.onlineBadge} />
        </View>
        <TouchableOpacity style={styles.changeAvatarBtn} onPress={pickImage}>
          <Text style={styles.changeAvatarText}>📷 Cambiar foto de perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 3. FORMULARIO PRINCIPAL */}
      <Text style={styles.label}>Nombre Artístico</Text>
      <Controller
        control={control}
        name="artisticName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholderTextColor="#52525b"
          />
        )}
      />
      {errors.artisticName && <Text style={styles.error}>{errors.artisticName.message}</Text>}

      <Text style={styles.label}>Género Principal</Text>
      <Controller
        control={control}
        name="genre"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholderTextColor="#52525b"
          />
        )}
      />
      {errors.genre && <Text style={styles.error}>{errors.genre.message}</Text>}

      {/* 4. SELECTOR INTERACTIVO DE TAGS CON ICONOS */}
      <Text style={styles.label}>Especialidades & Roles</Text>
      <View style={styles.tagsContainer}>
        {AVAILABLE_TAGS.map(tag => {
          const active = selectedTags.includes(tag.label);
          return (
            <TouchableOpacity
              key={tag.id}
              onPress={() => toggleTag(tag.label)}
              style={[styles.tagChip, active && styles.tagChipActive]}
            >
              <Text style={styles.tagIcon}>{tag.icon}</Text>
              <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                {tag.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Biografía</Text>
      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, styles.textArea]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            multiline
            numberOfLines={4}
            placeholderTextColor="#52525b"
          />
        )}
      />
      {errors.bio && <Text style={styles.error}>{errors.bio.message}</Text>}

      {/* BOTÓN PRINCIPAL */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Guardar Cambios →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#09090b', flexGrow: 1 },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#ffffff', letterSpacing: 0.5 },
  subtitle: { fontSize: 13, color: '#71717a', marginTop: 4 },
  
  /* Métricas con acentos neón */
  metricsContainer: { 
    backgroundColor: '#18181b', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#27272a', 
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  metricsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  metricsTitle: { color: '#a1a1aa', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  liveBadge: { backgroundColor: '#064e3b', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10 },
  liveBadgeText: { color: '#34d399', fontSize: 10, fontWeight: 'bold' },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  metricCard: { flex: 1, alignItems: 'center', backgroundColor: '#09090b', paddingVertical: 14, borderRadius: 12, marginHorizontal: 3, borderWidth: 1, borderColor: '#27272a' },
  metricNumber: { color: '#818cf8', fontSize: 22, fontWeight: '800' },
  metricLabel: { color: '#71717a', fontSize: 11, marginTop: 2, fontWeight: '500' },

  /* Foto de perfil con borde degradado e indicador activo */
  avatarSection: { alignItems: 'center', marginVertical: 8 },
  avatarWrapper: { position: 'relative' },
  avatarContainer: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    borderWidth: 2, 
    borderColor: '#6366f1', 
    overflow: 'hidden', 
    marginBottom: 10 
  },
  avatar: { width: '100%', height: '100%' },
  onlineBadge: { 
    position: 'absolute', 
    bottom: 12, 
    right: 4, 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    backgroundColor: '#10b981', 
    borderWidth: 3, 
    borderColor: '#09090b' 
  },
  changeAvatarBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#18181b', borderWidth: 1, borderColor: '#3f3f46' },
  changeAvatarText: { color: '#c7d2fe', fontSize: 12, fontWeight: '600' },

  divider: { height: 1, backgroundColor: '#27272a', marginVertical: 16 },

  /* Campos de entrada */
  label: { fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 6, color: '#e4e4e7' },
  input: { borderWidth: 1, borderColor: '#27272a', borderRadius: 12, padding: 14, fontSize: 14, backgroundColor: '#18181b', color: '#ffffff' },
  textArea: { height: 85, textAlignVertical: 'top' },
  error: { color: '#f87171', fontSize: 12, marginTop: 4 },

  /* Tags de especialidad con iconos */
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tagChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a' },
  tagChipActive: { backgroundColor: '#312e81', borderColor: '#6366f1' },
  tagIcon: { marginRight: 6, fontSize: 13 },
  tagChipText: { color: '#71717a', fontSize: 12, fontWeight: '500' },
  tagChipTextActive: { color: '#ffffff', fontWeight: 'bold' },

  /* Botón de acción */
  button: { marginTop: 28, backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
});