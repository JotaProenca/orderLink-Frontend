import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste conforme seu stack
import { useAuth } from '../context/AuthContext';
import GerenciarItensIcon from '../components/GerenciarItensIcon';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const COLORS = {
  primary: '#2979FF',
  white: '#FFFFFF',
  lightGray: '#F3F4F6',
  gray: '#D1D5DB',
  darkGray: '#6B7280',
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  red: '#EF4444',
  cardBackground: '#FFFFFF',
  black: '#000000',
  bemVindoText: '#1E3799',
};

const MenuCard = ({
  title,
  iconName,
  iconComponent,
  onPress,
  isLogout = false,
  disabled = false
}: {
  title: string;
  iconName?: string;
  iconComponent?: React.ReactElement;
  onPress: () => void;
  isLogout?: boolean;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[
      styles.card,
      isLogout && styles.logoutCard,
      disabled && styles.cardDisabled
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    {isLogout && disabled ? (
      <ActivityIndicator size="small" color={COLORS.white} style={styles.cardIcon} />
    ) : iconComponent ? (
      React.cloneElement(iconComponent, { style: styles.cardIcon } as any)
    ) : iconName ? (
      <Icon
        name={iconName}
        size={32}
        color={isLogout ? COLORS.white : COLORS.primary}
        style={styles.cardIcon}
      />
    ) : null}
    <Text style={[styles.cardText, isLogout && styles.logoutCardText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }: Props) {
  const { authState, logout, fetchUserProfile } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showManageSubmenu, setShowManageSubmenu] = useState(false);

  useEffect(() => {
    if (fetchUserProfile) fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, logout]);

  type HomeNavScreens = 'Pedidos' | 'CadastrarCategoria' | 'EditarCategoria' | 'CadastrarItem' | 'EditarItem' | 'MeusDados';

  const handleNavigate = (screen: HomeNavScreens) => {
    navigation.navigate(screen);
  };

  const { userProfile } = authState;
  if (!userProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.lightGray} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const { nomeUsuario, imagemUsuario, permissoes } = userProfile;
  if (!permissoes) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.lightGray} />
        <View style={styles.loadingContainer}>
          <Text>Erro ao carregar permissões.</Text>
          {fetchUserProfile && (
            <TouchableOpacity onPress={fetchUserProfile} style={styles.retryButton}>
              <Text style={styles.retryText}>Tentar Novamente</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {/* abrir menu */ }} style={styles.headerButton}>
          <Icon name="menu" size={30} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerIconsContainer}>
          <TouchableOpacity onPress={() => {/* notif */ }} style={styles.headerButton}>
            <Icon name="bell-outline" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {/* carrinho */ }} style={styles.headerButton}>
            <Icon name="cart-outline" size={26} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>Menu Principal</Text>
        <View style={styles.welcomeCard}>
          <Image
            source={
              imagemUsuario
                ? { uri: `data:image/png;base64,${imagemUsuario}` }
                : require('../assets/avatar_placeholder.png')
            }
            style={styles.profilePic}
          />
          <View>
            <Text style={styles.welcomeText}>Bem-vindo</Text>
            <Text style={styles.userName}>{nomeUsuario}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {permissoes.cadastrarItem && (
            <MenuCard
              title="Pedidos"
              iconName="clipboard-text-outline"
              onPress={() => handleNavigate('Pedidos')}
            />
          )}

          {permissoes.gerenciarItens && (
            <MenuCard
              title="Gerenciar Itens"
              iconComponent={<GerenciarItensIcon color={COLORS.primary} />}
              onPress={() => setShowManageSubmenu(prev => !prev)}
            />
          )}

          {/* Submenu de Gerenciar Itens */}
          {showManageSubmenu && (
            <>
              <MenuCard
                title="Cadastrar Categorias"
                iconName="plus-circle-outline"
                onPress={() => handleNavigate('CadastrarCategoria')}
              />
              <MenuCard
                title="Editar Categorias"
                iconName="plus-circle-outline"
                onPress={() => handleNavigate('EditarCategoria')}
              />
              <MenuCard
                title="Cadastrar Itens"
                iconName="plus-circle-outline"
                onPress={() => handleNavigate('CadastrarItem')}
              />
              <MenuCard
                title="Editar Itens"
                iconName="pencil-outline"
                onPress={() => handleNavigate('EditarItem')}
              />
            </>
          )}

          {permissoes.minhaEmpresa && (
            <MenuCard
              title="Meus Dados"
              iconName="account-outline"
              onPress={() => handleNavigate('MeusDados')}
            />
          )}

          <MenuCard
            title={isLoggingOut ? "" : "Sair"}
            iconName="logout"
            onPress={handleLogout}
            isLogout
            disabled={isLoggingOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightGray },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
  },
  headerButton: { padding: 5 },
  headerIconsContainer: { flexDirection: 'row' },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.black,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  retryText: { color: COLORS.white },
  welcomeCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: COLORS.gray,
  },
  welcomeText: { fontSize: 16, color: COLORS.bemVindoText },
  userName: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 15,
    width: '48%',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  logoutCard: { backgroundColor: COLORS.red },
  cardDisabled: { opacity: 0.7 },
  cardIcon: { marginBottom: 12 },
  cardText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  logoutCardText: { color: COLORS.white },
});

