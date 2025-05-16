import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../../App';

// Importa os componentes SVG para os logos sociais
import GoogleLogoSvg from '../components/GoogleLogoSvg';
import MicrosoftLogoSvg from '../components/MicrosoftLogoSvg';

// Importa o serviço da API e o hook useAuth
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; // Importa o hook

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

// --- CORES ---
const COLORS = {
  primary: '#2979FF',
  primaryLight: '#69A1FF',
  primaryDark: '#1C6EE5',
  white: '#FFFFFF',
  lightGray: '#F7F8F9',
  gray: '#D1D5DB',
  darkGray: '#6B7280',
  textInput: '#111827',
  black: '#000000',
  red: '#EF4444',
  appleBlack: '#000000',
  facebookBlue: '#1877F2',
  overlayIcon: 'rgba(255, 255, 255, 0.15)',
};

// Nomes das Fontes (Ignorados se não instaladas)
const FONT_FAMILY_BOLD = Platform.OS === 'ios' ? 'Poppins-Bold' : 'Poppins-Bold';
const FONT_FAMILY_REGULAR = Platform.OS === 'ios' ? 'Poppins-Regular' : 'Poppins-Regular';

// ----- Componente Principal da Tela de Login -----
function LoginScreen({ navigation }: Props) {
  // --- ESTADOS ATUALIZADOS ---
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState(''); // <-- RENOMEADO de username
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ----- FUNÇÃO handleLogin ATUALIZADA -----
  const handleLogin = useCallback(async () => {
    // Usa 'identifier' agora
    if (!identifier || !password) {
      Alert.alert('Erro', 'Por favor, preencha o Email/CPF e a senha.'); // Mensagem ajustada
      return;
    }
    setIsLoading(true);
    try {
      console.log('Tentando login com identificador:', identifier);
      // --- Chamada API ATUALIZADA ---
      const response = await api.post('/auth/login', {
        identifier: identifier, // <-- Envia 'identifier'
        password: password,
      });

       if (response.data && response.data.token) {
           const { token } = response.data;
           console.log('Token recebido da API, chamando context.login');
           // --- Chamada Contexto ATUALIZADA ---
           // Passa o identifier (email ou cpf) para o contexto poder usá-lo no Keychain se necessário
           await login(identifier, token);
           // Navegação agora é automática via Contexto/RootNavigator
       } else {
           throw new Error('Token não recebido do servidor.');
       }

    } catch (error: any) {
      // Tratamento de erro permanece o mesmo, mensagens são genéricas o suficiente
      console.error('Erro na tela de login:', error);
       if (!error.response && !error.request && error.message !== 'Token não recebido do servidor.') {
           Alert.alert('Erro Pós-Login', 'Não foi possível carregar seus dados após o login.');
       }
       else if (error.response?.status === 401) {
            Alert.alert('Erro de Login', 'Credenciais inválidas. Verifique seu Email/CPF e senha.'); // Mensagem ajustada
       } else if (error.request) {
           Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor. Verifique sua conexão e se o backend está rodando.');
       } else {
            Alert.alert('Erro', error.message || 'Ocorreu um erro inesperado. Tente novamente.');
       }
    } finally {
      setIsLoading(false);
    }
  }, [identifier, password, login]); // <-- Dependências atualizadas


  // Outros Handlers (inalterados)
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };
  const handleSignUp = () => { console.log('Cadastre-se'); 
    navigation.navigate('SignUp'); 
  };
  const handleSocialLogin = (provider: string) => { console.log(`Login com ${provider}`);};

  // ----- JSX da Tela -----
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header (Inalterado) */}
        <View style={styles.header}>
          <View style={styles.headerTopAccent} />
          <Icon name="glass-wine" size={30} color={COLORS.overlayIcon} style={styles.overlayIconLeft} />
          <Icon name="silverware-fork-knife" size={30} color={COLORS.overlayIcon} style={styles.overlayIconRight} />
          <View style={styles.headerContent}>
            <Icon name="link-variant" size={40} color={COLORS.white} style={styles.logoIcon} />
            <Text style={styles.title}>OrderLink</Text>
          </View>
          <View style={styles.headerAccentBar} />
        </View>

        {/* Formulário */}
        <View style={styles.formContainer}>
          <Text style={styles.tagline}>Conectando sabores</Text>

          {/* --- Input Identificador (Email ou CPF) ATUALIZADO --- */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email ou CPF</Text>
            <View style={styles.inputWrapper}>
               <Icon name="account-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite seu Email ou CPF" // <-- MUDOU
                placeholderTextColor={COLORS.gray}
                value={identifier} // <-- MUDOU
                onChangeText={setIdentifier} // <-- MUDOU
                keyboardType="default" // <-- MUDOU (permite @ e números)
                autoCapitalize="none"
                returnKeyType="next"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Input Senha (Inalterado) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor={COLORS.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={!isLoading ? handleLogin : undefined}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Botão Entrar (Inalterado) */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.continueText}>ou continue com</Text>

          {/* Social Login (Inalterado) */}
          <View style={styles.socialLoginContainer}>
             <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}><GoogleLogoSvg width={24} height={24} /></TouchableOpacity>
             <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Facebook')}><Icon name="facebook" size={24} color={COLORS.facebookBlue} /></TouchableOpacity>
             <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Apple')}><Icon name="apple" size={24} color={COLORS.appleBlack} /></TouchableOpacity>
             <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Microsoft')}><MicrosoftLogoSvg width={21} height={21} /></TouchableOpacity>
          </View>

          {/* Links (Inalterado) */}
          <TouchableOpacity onPress={handleForgotPassword}><Text style={styles.linkText}>Esqueci minha senha</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleSignUp} style={styles.signUpContainer}><Text style={styles.signUpText}>Não tem uma conta? </Text><Text style={[styles.signUpText, styles.signUpLink]}>Cadastre-se</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Estilos Completos (Inalterados da última versão) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightGray, },
  scrollViewContainer: { flexGrow: 1, },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 30, minHeight: 180, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, },
  headerTopAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 10, backgroundColor: COLORS.primaryDark, zIndex: 0, },
  overlayIconLeft: { position: 'absolute', top: 55, left: 25, zIndex: 1, },
  overlayIconRight: { position: 'absolute', top: 55, right: 25, zIndex: 1, },
  headerContent: { alignItems: 'center', zIndex: 2, },
  logoIcon: { marginBottom: 5, },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.white, /* fontFamily: FONT_FAMILY_BOLD, */ },
  headerAccentBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 15, backgroundColor: COLORS.primaryLight, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, zIndex: 0, },
  tagline: { fontSize: 16, color: COLORS.darkGray, textAlign: 'center', marginBottom: 30, /* fontFamily: FONT_FAMILY_REGULAR, */ },
  formContainer: { flex: 1, padding: 30, backgroundColor: COLORS.white, minHeight: Dimensions.get('window').height * 0.6, },
  inputGroup: { marginBottom: 20, },
  label: { fontSize: 14, color: COLORS.darkGray, marginBottom: 8, },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, backgroundColor: COLORS.white, },
  inputIcon: { paddingLeft: 15, marginRight: 5, },
  input: { flex: 1, paddingHorizontal: 10, paddingVertical: 12, fontSize: 16, color: COLORS.textInput, },
  loginButton: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 15, elevation: 3, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, },
  loginButtonDisabled: { backgroundColor: COLORS.gray, },
  loginButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', },
  continueText: { textAlign: 'center', color: COLORS.darkGray, marginVertical: 30, fontSize: 14, },
  socialLoginContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 30, },
  socialButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, elevation: 2, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, borderWidth: 1, borderColor: COLORS.lightGray, },
  linkText: { color: COLORS.primary, textAlign: 'center', marginBottom: 25, fontWeight: '500', },
  signUpContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, },
  signUpText: { color: COLORS.darkGray, fontSize: 14, },
  signUpLink: { color: COLORS.primary, fontWeight: 'bold', marginLeft: 4, },
});

export default LoginScreen;