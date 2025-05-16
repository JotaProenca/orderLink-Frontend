import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyCode'>;
const CODE_LENGTH = 6;

const VerifyCodeScreen = ({ route, navigation }: Props) => {
  const { email } = route.params;
  const { colors } = useTheme();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleInputChange = (digit: string, idx: number) => {
    if (!/^\d?$/.test(digit)) return;
    const newCode = [...code];
    newCode[idx] = digit;
    setCode(newCode);
    if (digit && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && code[idx] === '' && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    if (fullCode.length < CODE_LENGTH) {
      return Alert.alert('Código Incompleto', `Digite os ${CODE_LENGTH} dígitos.`);
    }
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-reset-code', { email, code: fullCode });
      const { passwordResetToken } = res.data;
      // Navega diretamente sem exibir alerta de sucesso
      navigation.replace('ResetPassword', { email, resetToken: passwordResetToken });
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message || 'Código inválido ou expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Verificar Código</Text>
        <Text style={styles.subtitle}>
          Um código de {CODE_LENGTH} dígitos foi enviado para{' '}
          <Text style={styles.emailHighlight}>{email}</Text>. Por favor, insira-o abaixo.
        </Text>

        <View style={styles.inputsRow}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
               ref={(instance: TextInput | null) => { // Ajuste na função da ref
                                inputsRef.current[idx] = instance;
                            }}
              style={styles.inputBox}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={txt => handleInputChange(txt, idx)}
              onKeyPress={e => handleKeyPress(e, idx)}
              value={digit}
              editable={!isLoading}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, (isLoading || code.join('').length < CODE_LENGTH) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading || code.join('').length < CODE_LENGTH}
        >
          {isLoading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.buttonText}>Verificar Código</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkButton}>
          <Text style={styles.linkText}>Digitar e-mail novamente</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    inner: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 22,
    },
    emailHighlight: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    inputsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    inputBox: {
      width: 48,
      height: 56,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textPrimary,
      backgroundColor: colors.inputBackground,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    buttonDisabled: {
      backgroundColor: colors.disabled,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.white,
    },
    linkButton: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    linkText: {
      fontSize: 16,
      color: colors.primary,
    },
  });

export default VerifyCodeScreen;
