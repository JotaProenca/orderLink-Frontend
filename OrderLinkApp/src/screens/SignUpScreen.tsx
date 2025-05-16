import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
  SafeAreaView, Dimensions, ActivityIndicator, Alert, Platform,
  TextInput as RNTextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../../App';
import api from '../services/api';
import axios from 'axios';
import MaskInput from 'react-native-mask-input';

import { useTheme } from '../context/ThemeContext';

// Funções de validação
function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) {
    const num = parseInt(cpf[i-1]);
    if(isNaN(num)) return false;
    soma += num * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    const num = parseInt(cpf[i-1]);
    if(isNaN(num)) return false;
    soma += num * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;
  return true;
}

function validarCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, '');
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) { return false; }
  let soma = 0, tamanho = 12, numeros = cnpj.substring(0,tamanho), digitos = cnpj.substring(tamanho), pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    const num = parseInt(numeros.charAt(tamanho - i));
    if(isNaN(num)) return false;
    soma += num * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) { return false; }
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0,tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    const num = parseInt(numeros.charAt(tamanho - i));
    if(isNaN(num)) return false;
    soma += num * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) { return false; }
  return true;
}

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;
const { width, height } = Dimensions.get('window');

function SignUpScreen({ navigation }: Props) {
  const { colors } = useTheme();

  // Estados
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tipoEmpresa, setTipoEmpresa] = useState<'CPF' | 'CNPJ'>('CPF');
  const [cnpj, setCnpj] = useState('');
  const [cnpjRaw, setCnpjRaw] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cpf, setCpf] = useState('');
  const [cpfRaw, setCpfRaw] = useState('');
  const [cep, setCep] = useState('');
  const [cepRaw, setCepRaw] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Refs
  const emailInputRef = useRef<RNTextInput>(null);
  const passwordInputRef = useRef<RNTextInput>(null);
  const numeroInputRef = useRef<RNTextInput>(null);

  // Funções
  const handleCepLookup = useCallback(async () => {
    if (cepRaw.length !== 8) return;
    setIsCepLoading(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cepRaw}/json/`);
      if (response.data && !response.data.erro) {
        setEndereco(response.data.logradouro || '');
        setBairro(response.data.bairro || '');
        setCidade(response.data.localidade || '');
        setUf(response.data.uf || '');
        numeroInputRef.current?.focus();
      } else {
        Alert.alert('CEP Inválido', 'Endereço não encontrado.');
        setEndereco('');
        setBairro('');
        setCidade('');
        setUf('');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar o CEP.');
    } finally {
      setIsCepLoading(false);
    }
  }, [cepRaw]);

  const handleRegister = useCallback(async () => {
    if (!name || !email || !password || !confirmPassword || !tipoEmpresa) {
      Alert.alert('Campos Obrigatórios', '...');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Senha Inválida', '...');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha Inválida', '...');
      return;
    }
    let isDocumentValid = false;
    try {
      if (tipoEmpresa === 'CPF') {
        if (!validarCPF(cpfRaw)) {
          Alert.alert('CPF Inválido', '...');
          return;
        }
        isDocumentValid = true;
      } else if (tipoEmpresa === 'CNPJ') {
        if (!validarCNPJ(cnpjRaw)) {
          Alert.alert('CNPJ Inválido', '...');
          return;
        }
        if (!nomeFantasia || !razaoSocial) {
          Alert.alert('Campos Obrigatórios', '...');
          return;
        }
        isDocumentValid = true;
      }
    } catch (validationError) {
      console.error('ERRO Validação:', validationError);
      Alert.alert('Erro Validação', '...');
      return;
    }
    if (!isDocumentValid) return;
    if (cepRaw.length > 0 && cepRaw.length !== 8) {
      Alert.alert('CEP Inválido', '...');
      return;
    }
    if (!endereco || !numero) {
      Alert.alert('Endereço Incompleto', '...');
      return;
    }
    setIsRegistering(true);
    const registrationData = {
      name,
      email,
      password,
      tipoEmpresa,
      cnpj: tipoEmpresa === 'CNPJ' ? cnpjRaw : undefined,
      nomeFantasia: tipoEmpresa === 'CNPJ' ? nomeFantasia : undefined,
      razaoSocial: tipoEmpresa === 'CNPJ' ? razaoSocial : undefined,
      cpf: tipoEmpresa === 'CPF' ? cpfRaw : undefined,
      cep: cepRaw || undefined,
      endereco: endereco || undefined,
      numero: numero || undefined,
      complemento: complemento || undefined,
    };
    try {
      const response = await api.post('/auth/register', registrationData);
      Alert.alert('Sucesso!', 'Cadastro realizado.');
      navigation.goBack();
    } catch (error: any) {
      if (error.response) {
        Alert.alert('Erro', error.response.data?.message || 'Erro.');
      } else if (error.request) {
        Alert.alert('Erro Rede', '...');
      } else {
        Alert.alert('Erro', '...');
      }
    } finally {
      setIsRegistering(false);
    }
  }, [name, email, password, confirmPassword, tipoEmpresa, cnpjRaw, nomeFantasia, razaoSocial, cpfRaw, cepRaw, endereco, numero, complemento, navigation]);

  // Máscaras
  const cpfMask = [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];
  const cnpjMask = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/];
  const cepMask = [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/];

  // Estilos
  const dynamicStyles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    formCard: {
      flex: 1,
      backgroundColor: colors.card,
      marginHorizontal: 15,
      marginTop: 20,
      marginBottom: 20,
      borderRadius: 20,
      padding: 25,
      elevation: 4,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      position: 'relative', // Para permitir posicionamento absoluto dos ícones dentro do formCard
    },
    patternIcon: {
      position: 'absolute',
      color: colors.iconColor,
      opacity: 0.1, // Opacidade "clarinha" para os ícones
    },
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 25, textAlign: 'center' },
    inputGroup: { marginBottom: 16 },
    inputGroupRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    label: { fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
    input: { borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 15 : 12, fontSize: 16, color: colors.textPrimary, backgroundColor: colors.inputBackground },
    pickerWrapper: { borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8, backgroundColor: colors.inputBackground, justifyContent: 'center' },
    picker: { height: Platform.OS === 'ios' ? undefined : 50, color: colors.textPrimary },
    pickerItem: { color: colors.textPrimary, fontSize: Platform.OS === 'ios' ? 18 : undefined },
    cepContainer: { flexDirection: 'row', alignItems: 'center' },
    inputCep: { flex: 1, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 15 : 12, fontSize: 16, color: colors.textPrimary, backgroundColor: colors.inputBackground },
    cepLoading: { marginLeft: 10 },
    registerButton: { backgroundColor: colors.success, paddingVertical: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 20, elevation: 3, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, flexDirection: 'row' },
    registerButtonDisabled: { backgroundColor: colors.buttonDisabledBackground },
    registerButtonText: { color: colors.buttonText, fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    backButton: { marginTop: 20, alignItems: 'center', paddingBottom: 10 },
    backButtonText: { color: colors.primary, fontSize: 15, fontWeight: '500' },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={dynamicStyles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={dynamicStyles.formCard}>
          {/* Ícones movidos para dentro do formCard */}
          <Icon name="silverware-fork-knife" size={width * 0.2} style={[dynamicStyles.patternIcon, { top: '8%', left: '10%', transform: [{ rotate: '-15deg' }] }]} />
          <Icon name="glass-wine" size={width * 0.18} style={[dynamicStyles.patternIcon, { top: '3%', right: '8%', transform: [{ rotate: '20deg' }] }]} />
          <Icon name="food-drumstick-outline" size={width * 0.18} style={[dynamicStyles.patternIcon, { top: '25%', right: '20%', transform: [{ rotate: '-5deg' }] }]} />
          <Icon name="muffin" size={width * 0.15} style={[dynamicStyles.patternIcon, { top: '35%', left: '5%', transform: [{ rotate: '10deg' }] }]} />
          <Icon name="chef-hat" size={width * 0.2} style={[dynamicStyles.patternIcon, { top: '55%', left: '12%', transform: [{ rotate: '5deg' }] }]} />
          <Icon name="blender-outline" size={width * 0.18} style={[dynamicStyles.patternIcon, { top: '50%', right: '8%', transform: [{ rotate: '-15deg' }] }]} />
          <Icon name="pot-steam-outline" size={width * 0.15} style={[dynamicStyles.patternIcon, { top: '75%', left: '20%', transform: [{ rotate: '25deg' }] }]} />
          <Icon name="cupcake" size={width * 0.18} style={[dynamicStyles.patternIcon, { top: '70%', right: '15%', transform: [{ rotate: '10deg' }] }]} />

          <Text style={dynamicStyles.screenTitle}>Criar Conta</Text>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Nome Completo</Text>
            <RNTextInput
              style={dynamicStyles.input}
              value={name}
              onChangeText={(text: string) => setName(text)}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.placeholder}
              editable={!isRegistering}
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
            />
          </View>
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Email</Text>
            <RNTextInput
              ref={emailInputRef}
              style={dynamicStyles.input}
              value={email}
              onChangeText={(text: string) => setEmail(text)}
              placeholder="seu_email@exemplo.com"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isRegistering}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
          </View>
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Senha</Text>
            <RNTextInput
              ref={passwordInputRef}
              style={dynamicStyles.input}
              value={password}
              onChangeText={(text: string) => setPassword(text)}
              placeholder="Pelo menos 6 caracteres"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              editable={!isRegistering}
              returnKeyType="next"
            />
          </View>
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Confirmar Senha</Text>
            <RNTextInput
              style={dynamicStyles.input}
              value={confirmPassword}
              onChangeText={(text: string) => setConfirmPassword(text)}
              placeholder="Digite a senha novamente"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              editable={!isRegistering}
              returnKeyType="next"
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Tipo de Cadastro</Text>
            <View style={dynamicStyles.pickerWrapper}>
              <Picker
                selectedValue={tipoEmpresa}
                onValueChange={(itemValue: 'CPF' | 'CNPJ') => setTipoEmpresa(itemValue)}
                style={dynamicStyles.picker}
                itemStyle={dynamicStyles.pickerItem}
                enabled={!isRegistering}
                dropdownIconColor={colors.textPrimary}
              >
                <Picker.Item label="Pessoa Física (CPF)" value="CPF" color={colors.textPrimary} />
                <Picker.Item label="Pessoa Jurídica (CNPJ)" value="CNPJ" color={colors.textPrimary} />
              </Picker>
            </View>
          </View>

          {tipoEmpresa === 'CPF' && (
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>CPF</Text>
              <MaskInput
                value={cpf}
                onChangeText={(masked, unmasked) => {
                  setCpf(masked);
                  setCpfRaw(unmasked);
                }}
                mask={cpfMask}
                style={dynamicStyles.input}
                placeholder="000.000.000-00"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                editable={!isRegistering}
                returnKeyType="next"
              />
            </View>
          )}
          {tipoEmpresa === 'CNPJ' && (
            <View>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>CNPJ</Text>
                <MaskInput
                  value={cnpj}
                  onChangeText={(masked, unmasked) => {
                    setCnpj(masked);
                    setCnpjRaw(unmasked);
                  }}
                  mask={cnpjMask}
                  style={dynamicStyles.input}
                  placeholder="00.000.000/0000-00"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  editable={!isRegistering}
                  returnKeyType="next"
                />
              </View>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Nome Fantasia</Text>
                <RNTextInput
                  style={dynamicStyles.input}
                  value={nomeFantasia}
                  onChangeText={(text: string) => setNomeFantasia(text)}
                  placeholder="Nome popular da empresa"
                  placeholderTextColor={colors.placeholder}
                  editable={!isRegistering}
                  returnKeyType="next"
                />
              </View>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Razão Social</Text>
                <RNTextInput
                  style={dynamicStyles.input}
                  value={razaoSocial}
                  onChangeText={(text: string) => setRazaoSocial(text)}
                  placeholder="Nome legal da empresa LTDA"
                  placeholderTextColor={colors.placeholder}
                  editable={!isRegistering}
                  returnKeyType="next"
                />
              </View>
            </View>
          )}

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>CEP</Text>
            <View style={dynamicStyles.cepContainer}>
              <MaskInput
                value={cep}
                onChangeText={(masked, unmasked) => {
                  setCep(masked);
                  setCepRaw(unmasked);
                  if (unmasked.length === 8) {
                    handleCepLookup();
                  }
                }}
                mask={cepMask}
                style={dynamicStyles.inputCep}
                placeholder="00000-000"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                onBlur={handleCepLookup}
                editable={!isRegistering}
                returnKeyType="next"
              />
              {isCepLoading && <ActivityIndicator size="small" color={colors.primary} style={dynamicStyles.cepLoading} />}
            </View>
          </View>
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Endereço</Text>
            <RNTextInput
              style={dynamicStyles.input}
              value={endereco}
              onChangeText={(text: string) => setEndereco(text)}
              placeholder="Rua, Avenida, Praça..."
              placeholderTextColor={colors.placeholder}
              editable={!isRegistering}
              returnKeyType="next"
            />
          </View>
          <View style={dynamicStyles.inputGroupRow}>
            <View style={[dynamicStyles.inputGroup, { flex: 2, marginRight: 10 }]}>
              <Text style={dynamicStyles.label}>Número</Text>
              <RNTextInput
                ref={numeroInputRef}
                style={dynamicStyles.input}
                value={numero}
                onChangeText={(text: string) => setNumero(text)}
                placeholder="Ex: 123"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                editable={!isRegistering}
                returnKeyType="next"
              />
            </View>
            <View style={[dynamicStyles.inputGroup, { flex: 3 }]}>
              <Text style={dynamicStyles.label}>Complemento</Text>
              <RNTextInput
                style={dynamicStyles.input}
                value={complemento}
                onChangeText={(text: string) => setComplemento(text)}
                placeholder="Apto, Bloco, Casa..."
                placeholderTextColor={colors.placeholder}
                editable={!isRegistering}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[dynamicStyles.registerButton, isRegistering && dynamicStyles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isRegistering}
          >
            {isRegistering ? (
              <ActivityIndicator size="small" color={colors.buttonText} />
            ) : (
              <>
                <Icon name="account-plus-outline" size={22} color={colors.buttonText} />
                <Text style={dynamicStyles.registerButtonText}>Cadastrar</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.backButton} onPress={() => navigation.goBack()}>
            <Text style={dynamicStyles.backButtonText}>Já tenho conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SignUpScreen;