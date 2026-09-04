
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, Star, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function PricingScreen() {
  const plans = [
    {
      name: "Free",
      description: "Disfruta limitadamente",
      priceYear: "$0.00",
      priceMonth: "$0.00",
      features: [
        "Subir hasta 10 beats",
        "Licencia estándar",
        "0% de comisión por beat",
        "Uso no exclusivo"
      ],
      highlighted: false,
    },
    {
      name: "Plus",
      description: "Beneficios exclusivos",
      priceYear: "$69.99",
      priceMonth: "$5.99",
      features: [
        "Subir hasta 100 beats",
        "Perfil mejorado (banners, links, redes)",
        "15% de comisión en ventas",
        "Acceso limitado a licencias exclusivas"
      ],
      highlighted: true,
    },
    {
      name: "Premium",
      description: "Disfruta a tu estilo",
      priceYear: "$119.00",
      priceMonth: "$9.99",
      features: [
        "Beats ilimitados",
        "Perfil avanzado",
        "50% de comisión en ventas",
        "Licencias exclusivas y personalizadas"
      ],
      highlighted: false,
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => router.replace('/inicio')}
      >
        <X color="#a1a1aa" size={24} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Elige tu plan</Text>
        <Text style={styles.subtitle}>
          Únete a nuestra comunidad y potencia tu carrera musical con las mejores herramientas del mercado.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {plans.map((plan, index) => {
          const isHighlighted = plan.highlighted;

          return (
            <View 
              key={plan.name} 
              style={[
                styles.card,
                isHighlighted ? styles.cardHighlighted : styles.cardNormal
              ]}
            >
              {isHighlighted && (
                <LinearGradient
                  colors={['#a855f7', '#3b82f6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.badge}
                >
                  <Star color="#fff" size={12} fill="#fff" />
                  <Text style={styles.badgeText}>MÁS POPULAR</Text>
                </LinearGradient>
              )}

              <View style={styles.cardHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDesc}>{plan.description}</Text>
              </View>

              <View style={styles.pricing}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceYear}>{plan.priceYear}</Text>
                  <Text style={styles.pricePeriod}>/ año</Text>
                </View>
                <Text style={styles.priceMonth}>Mes por tan solo {plan.priceMonth}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.features}>
                <Text style={styles.featuresTitle}>Beneficios</Text>
                {plan.features.map((feature, i) => (
                  <View key={i} style={styles.featureItem}>
                    <View style={styles.checkIcon}>
                      <Check color="#c084fc" size={14} />
                    </View>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8}>
                  {isHighlighted ? (
                    <LinearGradient
                      colors={['#9333ea', '#2563eb']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>Suscribete ahora</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.buttonOutline}>
                      <Text style={styles.buttonOutlineText}>Suscribete ahora</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.trialText}>Comienza la prueba de 7 dias</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    position: 'relative',
    marginTop: 10,
  },
  cardNormal: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHighlighted: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  badge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardHeader: {
    marginBottom: 24,
  },
  planName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  pricing: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  priceYear: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  priceMonth: {
    fontSize: 14,
    color: 'rgba(192, 132, 252, 0.8)',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  features: {
    flex: 1,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  checkIcon: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    padding: 4,
    borderRadius: 20,
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    color: '#d4d4d8',
    flex: 1,
    lineHeight: 20,
  },
  cardFooter: {
    marginTop: 32,
    paddingTop: 16,
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonOutline: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  buttonOutlineText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  trialText: {
    textAlign: 'center',
    color: '#71717a',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
