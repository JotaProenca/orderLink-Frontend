import React, { useState } from 'react';
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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho se necessário
import api from '../services/api'; // Seu serviço de API
// import { colors, SIZES, FONTS } from '../constants'; // Seus constantes de estilo
// import { SIZES, FONTS } from '../constants'; // Mantendo SIZES e FONTS, ajuste se tiver arquivos específicos
import { useTheme } from '../context/ThemeContext'; // Importa o hook do tema


// Definições básicas para SIZES e FONTS (ajuste conforme necessário)
const SIZES = {
    padding: 16,
    radius: 8,
    // Adicione outros tamanhos que você usa, como SIZES.width, SIZES.height se precisar
    // Eles podem ser obtidos de Dimensions.get('window') se necessário em um contexto mais global
};

const FONTS = {
    h1: { fontSize: 28, fontWeight: 'bold' as 'bold' }, // fontWeight precisa ser do tipo específico
    h3: { fontSize: 18, fontWeight: 'bold' as 'bold' },
    body3: { fontSize: 16 },
    // Adicione outros estilos de fonte que você usa
};

// Se você tiver um arquivo global para SIZES e FONTS, importe-o aqui.
// Exemplo:
// import { SIZES } from '../theme/sizes';
// import { FONTS } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { colors } = useTheme(); // Usa o hook para obter as cores do tema atual


    const handleSendCode = async () => {
        if (!email.trim() || !email.includes('@')) { // Validação simples de email
            Alert.alert('Email Inválido', 'Por favor, insira um endereço de e-mail válido.');
            return;
        }
        setIsLoading(true);
        try {
            await api.post('/auth/request-password-reset', { email });
            Alert.alert(
                'Verifique seu E-mail',
                'Código enviado para o email informado. Verifique sua caixa de entrada para prosseguir.',
                [{ text: 'OK', onPress: () => navigation.navigate('VerifyCode', { email }) }]
            );
        } catch (error: any) {
            console.error('Erro ao solicitar código de reset:', error.response?.data || error.message);
            Alert.alert(
                'Erro',
                error.response?.data?.message || 'Não foi possível processar sua solicitação. Tente novamente.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const componentStyles = dynamicStyles(useTheme().colors); // Isso pode causar re-render desnecessário se useTheme() for chamado aqui


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={componentStyles.container}

        >
            <View style={componentStyles.innerContainer}>
                <Text style={componentStyles.title}>Esqueceu sua Senha?</Text>
                <Text style={componentStyles.subtitle}>
                    Insira seu e-mail cadastrado para receber um código de verificação.
                </Text>
                <TextInput
                    style={componentStyles.input}
                    placeholder="Seu e-mail"
                    placeholderTextColor={colors.placeholder} // Usa cor do tema
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                />
                <TouchableOpacity
                    style={[componentStyles.button, isLoading && componentStyles.buttonDisabled]}
                    onPress={handleSendCode}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={colors.white} /> // Usa cor do tema
                    ) : (
                        <Text style={componentStyles.buttonText}>Enviar Código</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()} style={componentStyles.backButton}>
                    <Text style={componentStyles.backButtonText}>Voltar para o Login</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const dynamicStyles = (colors: any) => StyleSheet.create({ // Use 'any' ou o tipo ColorPalette
    container: {
        flex: 1,
        backgroundColor: colors.background, // Usa cor do tema
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: SIZES.padding * 2,
    },
    title: {
        ...FONTS.h1,
        color: colors.primary, // Usa cor do tema
        textAlign: 'center',
        marginBottom: SIZES.padding,
    },
    subtitle: {
        ...FONTS.body3,
        color: colors.textSecondary, // Usa cor do tema
        textAlign: 'center',
        marginBottom: SIZES.padding * 2,
    },
    input: {
        ...FONTS.body3,
        backgroundColor: colors.inputBackground, // Usa cor do tema
        borderColor: colors.inputBorder, // Usa cor do tema
        borderWidth: 1,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.padding * 1.5,
        color: colors.textPrimary, // Usa cor do tema
    },
    button: {
        backgroundColor: colors.primary, // Usa cor do tema
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginBottom: SIZES.padding,
    },
    buttonDisabled: {
        backgroundColor: colors.buttonDisabledBackground, // Usa cor do tema
    },
    buttonText: {
        ...FONTS.h3,
        color: colors.buttonText, // Usa cor do tema
    },
    backButton: {
        alignItems: 'center',
        padding: SIZES.padding / 2,
    },
    backButtonText: {
        ...FONTS.body3,
        color: colors.primary, // Usa cor do tema
    },
});

// No componente, você chamaria a função de estilos:
// const styles = dynamicStyles(colors);
// Para usar dentro do componente, você pode definir os estilos dentro do corpo do componente
// ou passar 'colors' para a função StyleSheet.create se ela for definida fora.
// A abordagem mais comum é definir a função `dynamicStyles` e chamá-la dentro do componente.

export default ForgotPasswordScreen;