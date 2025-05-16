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
    Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho
import api from '../services/api'; // Seu serviço de API
// import { COLORS, SIZES, FONTS } from '../constants'; // Seus constantes
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



type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen = ({ route, navigation }: Props) => {
    const { email, resetToken } = route.params; // Recebe o email e o JWT de reset
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { colors } = useTheme(); // Usa o hook para obter as cores do tema atual


    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Campos Vazios', 'Por favor, preencha ambos os campos de senha.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Senhas Diferentes', 'As senhas não coincidem.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Senha Curta', 'A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            await api.post('/auth/reset-password-with-token', {
                passwordResetToken: resetToken, // Envia o JWT de reset
                newPassword: newPassword,
            });
            Alert.alert(
                'Senha Redefinida!',
                'Sua senha foi alterada com sucesso. Você já pode fazer login com a nova senha.',
                [{ text: 'OK', onPress: () => navigation.popToTop() }] // Volta para a tela de Login
            );
        } catch (error: any) {
            console.error('Erro ao redefinir senha:', error.response?.data || error.message);
            Alert.alert(
                'Erro ao Redefinir',
                error.response?.data?.message || 'Não foi possível redefinir sua senha. Tente o processo novamente.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const componentStyles = dynamicStyles(useTheme().colors); // Isso pode causar re-render desnecessário se useTheme() for chamado aqui


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={componentStyles.container}
        >
            <View style={componentStyles.innerContainer}>
                <Text style={componentStyles.title}>Redefinir Senha</Text>
                <Text style={componentStyles.subtitle}>Crie uma nova senha para sua conta ({email}).</Text>
                <TextInput
                    style={componentStyles.input}
                    placeholder="Nova Senha"
                    placeholderTextColor={colors.placeholder}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    editable={!isLoading}
                />
                <TextInput
                    style={componentStyles.input}
                    placeholder="Confirmar Nova Senha"
                    placeholderTextColor={colors.placeholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!isLoading}
                />
                <TouchableOpacity
                    style={[componentStyles.button, isLoading && componentStyles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                >
                    {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={componentStyles.buttonText}>Salvar Nova Senha</Text>}
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


export default ResetPasswordScreen;