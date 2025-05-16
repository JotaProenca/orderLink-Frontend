import React from 'react';
import { ActivityIndicator, View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Contextos
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext'; // Importa Theme

// Telas
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SignUpScreen from './src/screens/SignUpScreen';

import CadastrarCategoriaScreen from './src/screens/CadastrarCategoriaScreen';
import EditarCategoriaScreen from './src/screens/EditarCategoriaScreen';
import CadastrarItemScreen from './src/screens/CadastrarItemScreen';
import EditarItemScreen from './src/screens/EditarItemScreen';


import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import VerifyCodeScreen from './src/screens/VerifyCodeScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';


// Tipagem de Rotas
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  SignUp: undefined;
  Pedidos: undefined;
  GerenciarItens: undefined;
  MeusDados: undefined;
  CadastrarCategoria: undefined;
  CadastrarItem: undefined;
  EditarItem: undefined;
  ForgotPassword: undefined;
  EditarCategoria: undefined;
  VerifyCode: { email: string }; // Passaremos o email para esta tela
  ResetPassword: { email: string; resetToken: string }; // Passaremos o email e o token JWT de reset

};

// Stacks de Navegação
const AuthStack = createNativeStackNavigator<RootStackParamList>();
const AppStack = createNativeStackNavigator<RootStackParamList>();

// Navegador Não Autenticado
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
     <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="VerifyCode" component={VerifyCodeScreen} />
    <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </AuthStack.Navigator>
);

// Navegador Autenticado
const AppNavigator = () => {
  // Acessa o tema aqui se precisar estilizar o header globalmente para o AppStack
  // const { colors } = useTheme();
  return (
    <AppStack.Navigator
       // screenOptions={{ // Exemplo:
       //   headerStyle: { backgroundColor: colors.card },
       //   headerTintColor: colors.textPrimary,
       // }}
    >
      <AppStack.Screen name="Home" component={HomeScreen} options={{ title: '' }}/>
      <AppStack.Screen name="CadastrarCategoria" component={CadastrarCategoriaScreen} />
      <AppStack.Screen name="EditarCategoria" component={EditarCategoriaScreen} />
      <AppStack.Screen name="CadastrarItem" component={CadastrarItemScreen} />
      <AppStack.Screen name="EditarItem" component={EditarItemScreen} />
    </AppStack.Navigator>
  );
}

// Root Navigator - Decide stack e aplica tema
const RootNavigator = () => {
  const { authState } = useAuth();
  const { colors, theme } = useTheme(); // Pega cores e tema

  // Tela de Carregamento estilizada com tema
  if (authState.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
         <StatusBar
            barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={colors.background}
         />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Navegação principal com StatusBar dinâmica
  return (
    <NavigationContainer>
      <StatusBar
         barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
         backgroundColor={colors.background} // Cor base
      />
      {authState.isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

// Componente App principal com Providers aninhados
function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}

// Estilo para loading
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor é aplicado dinamicamente
  },
});

export default App;