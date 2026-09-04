import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Platform, Modal, Image } from 'react-native';
import { Search, ChevronDown, Menu, Headphones, Grid, Activity, Play, Star, Tag, Zap, Mic, Flame, X, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function InicioScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const topCharts = [
    { id: '1', title: 'Nuevos y Destacados', icon: <Activity color="#fff" size={24} /> },
    { id: '2', title: 'Mejores Rankings', icon: <Grid color="#3b82f6" size={24} />, active: true },
    { id: '3', title: 'Solo Exclusivos', icon: <Star color="#fff" size={24} /> },
    { id: '4', title: 'Menos de $20', icon: <Tag color="#fff" size={24} /> },
    { id: '5', title: 'Beats Gratis', icon: <Zap color="#fff" size={24} /> },
    { id: '6', title: 'Beats', icon: <Play color="#fff" size={24} /> },
    { id: '7', title: 'Beats con Coro', icon: <Mic color="#fff" size={24} /> },
  ];

  const tags = ['drake', 'trap', 'guitar', 'Travis Scott', 'lil baby', 'gunna', 'rnb', 'hip hop', 'Type beat'];

  const filters = ['Todo el tiempo', 'Género', 'Tipo de pista', 'Precio', 'Estado de ánimo', 'BPM', 'Instrumentos'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
            <Menu color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image source={require('../../../assets/images/logo-glow.png')} style={{ width: 110, height: 35, resizeMode: 'contain' }} />
          </View>
          <TouchableOpacity>
            <Headphones color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
          {/* Banner */}
          <LinearGradient
            colors={['#9333ea', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.banner}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Now on Oziris: Beat search</Text>
              <Text style={styles.bannerSubtitle}>Descubre el sonido que buscas con productores reales.</Text>
            </View>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Saber Más</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search color="#71717a" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Try searching Trap or Sad or Juice Wrld..."
              placeholderTextColor="#71717a"
            />
            <View style={styles.searchDivider} />
            <TouchableOpacity style={styles.tracksButton}>
              <Text style={styles.tracksButtonText}>Pistas</Text>
              <ChevronDown color="#fff" size={16} />
            </TouchableOpacity>
          </View>

          {/* Top Charts Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mejores Rankings</Text>
            <TouchableOpacity style={styles.hideButton}>
              <Text style={styles.hideButtonText}>Ocultar</Text>
              <ChevronDown color="#fff" size={16} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {topCharts.map((item) => (
              <TouchableOpacity key={item.id} style={styles.categoryItem}>
                <View style={[styles.categoryIconCircle, item.active && styles.categoryIconCircleActive]}>
                  {item.icon}
                </View>
                <Text style={styles.categoryTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tags */}
          <View style={styles.tagsSection}>
            <View style={styles.tagSearchButton}>
              <Search color="#71717a" size={16} />
              <Text style={styles.tagSearchText}>Buscar etiquetas</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
              {tags.map((tag, index) => (
                <TouchableOpacity key={index} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {filters.map((filter, index) => (
              <TouchableOpacity key={index} style={[styles.filterPill, index === 0 && styles.filterPillActive]}>
                <Text style={styles.filterText}>{filter}</Text>
                <ChevronDown color="#fff" size={14} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Main Content Placeholder */}
          <View style={styles.mainContent}>
            <View style={styles.placeholderCard}>
              <Flame color="#a1a1aa" size={48} />
              <Text style={styles.placeholderText}>No hay resultados aún.</Text>
            </View>
          </View>
        </ScrollView>

        {/* Menu Overlay */}
        {isMenuOpen && (
          <View style={styles.menuOverlay}>
            <TouchableOpacity 
              style={styles.menuOverlayCloseArea} 
              activeOpacity={1} 
              onPress={() => setIsMenuOpen(false)} 
            />
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menú</Text>
                <TouchableOpacity onPress={() => setIsMenuOpen(false)} style={styles.menuCloseBtn}>
                  <X color="#fff" size={24} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/planes');
                }}
              >
                <Star color="#c084fc" size={20} />
                <Text style={styles.menuItemText}>Ver Planes</Text>
              </TouchableOpacity>
              
              <View style={styles.menuDivider} />

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => {
                  setIsMenuOpen(false);
                  router.replace('/(auth)/login');
                }}
              >
                <LogOut color="#ef4444" size={20} />
                <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  mainScroll: {
    flex: 1,
  },
  banner: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: {
    flex: 1,
    marginRight: 16,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  bannerButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 12,
  },
  tracksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tracksButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  hideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  hideButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 24,
    marginBottom: 32,
  },
  categoryItem: {
    alignItems: 'center',
    width: 80,
  },
  categoryIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryIconCircleActive: {
    borderColor: '#3b82f6',
    borderWidth: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  tagsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tagSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    marginRight: 12,
  },
  tagSearchText: {
    color: '#71717a',
    fontSize: 14,
  },
  tagsScroll: {
    gap: 8,
    paddingRight: 20,
  },
  tagPill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tagText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  placeholderCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
    marginTop: 20,
  },
  placeholderText: {
    color: '#a1a1aa',
    fontSize: 16,
    marginTop: 16,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    flexDirection: 'row',
  },
  menuOverlayCloseArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  menuContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '75%',
    maxWidth: 320,
    backgroundColor: '#18181b',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 24,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuCloseBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },
});
