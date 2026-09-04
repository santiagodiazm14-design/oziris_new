import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { Mail, Lock, ArrowRight, Hash, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = 'http://192.168.2.11:4000/auth'; // Usando IP local para que funcione en el emulador

  const handleRequestCode = async () => {
    if (!email) return Alert.alert('Error', 'Ingresa tu correo electrónico');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStep(2);
      } else {
        const data = await res.json();
        Alert.alert('Error', data.message || 'Error al solicitar el código.');
      }
    } catch (err) {
      Alert.alert('Error', 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) return Alert.alert('Error', 'Ingresa el código de 6 dígitos');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (res.ok) {
        setStep(3);
      } else {
        const data = await res.json();
        Alert.alert('Error', data.message || 'Código incorrecto o expirado.');
      }
    } catch (err) {
      Alert.alert('Error', 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) return Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      if (res.ok) {
        setStep(4);
      } else {
        const data = await res.json();
        Alert.alert('Error', data.message || 'Error al restablecer la contraseña.');
      }
    } catch (err) {
      Alert.alert('Error', 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {step === 1 && 'Recuperar contraseña'}
            {step === 2 && 'Verificar código'}
            {step === 3 && 'Nueva contraseña'}
            {step === 4 && '¡Todo listo!'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1 && 'Ingresa tu correo para recibir un código de recuperación.'}
            {step === 2 && 'Ingresa el código de 6 dígitos enviado a tu correo.'}
            {step === 3 && 'Crea una nueva contraseña segura.'}
            {step === 4 && 'Tu contraseña ha sido actualizada exitosamente.'}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 1 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <View style={styles.inputContainer}>
                  <Mail color="#71717a" size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="tu@correo.com"
                    placeholderTextColor="#71717a"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.buttonContainer} onPress={handleRequestCode} disabled={isLoading} activeOpacity={0.8}>
                <LinearGradient colors={['#9333ea', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.button, isLoading && { opacity: 0.7 }]}>
                  <Text style={styles.buttonText}>{isLoading ? 'Enviando...' : 'Enviar Código'}</Text>
                  <ArrowRight color="#fff" size={16} />
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Código de 6 dígitos</Text>
                <View style={styles.inputContainer}>
                  <Hash color="#71717a" size={20} />
                  <TextInput
                    style={[styles.input, { letterSpacing: 10, textAlign: 'center', fontSize: 24 }]}
                    placeholder="000000"
                    placeholderTextColor="#71717a"
                    value={code}
                    onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.buttonContainer} onPress={handleVerifyCode} disabled={isLoading || code.length !== 6} activeOpacity={0.8}>
                <LinearGradient colors={['#9333ea', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.button, (isLoading || code.length !== 6) && { opacity: 0.7 }]}>
                  <Text style={styles.buttonText}>{isLoading ? 'Verificando...' : 'Verificar Código'}</Text>
                  <ArrowRight color="#fff" size={16} />
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nueva Contraseña</Text>
                <View style={styles.inputContainer}>
                  <Lock color="#71717a" size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#71717a"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.buttonContainer} onPress={handleResetPassword} disabled={isLoading || newPassword.length < 6} activeOpacity={0.8}>
                <LinearGradient colors={['#9333ea', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.button, (isLoading || newPassword.length < 6) && { opacity: 0.7 }]}>
                  <Text style={styles.buttonText}>{isLoading ? 'Guardando...' : 'Restablecer Contraseña'}</Text>
                  <ArrowRight color="#fff" size={16} />
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {step === 4 && (
            <View style={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <CheckCircle2 color="#22c55e" size={48} />
              </View>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity style={[styles.buttonContainer, { width: '100%' }]} activeOpacity={0.8}>
                  <LinearGradient colors={['#9333ea', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
                    <Text style={styles.buttonText}>Ir a Iniciar Sesión</Text>
                    <ArrowRight color="#fff" size={16} />
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>

        {step < 4 && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Recordaste tu contraseña? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.registerText}>Inicia sesión</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d4d4d8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    gap: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  buttonContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  registerText: {
    color: '#c084fc',
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 24,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
