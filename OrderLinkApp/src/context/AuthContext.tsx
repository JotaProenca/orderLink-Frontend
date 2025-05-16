import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback,
    ReactNode,
  } from 'react';
  import * as Keychain from 'react-native-keychain';
  import api from '../services/api'; // Nosso serviço API com Axios
  
  // --- Tipagem ---
  
  // Define a estrutura dos dados do perfil do usuário que virão da API
  interface UserProfile {
    nomeUsuario: string;
    imagemUsuario: string | null; // Pode ser null
    permissoes: {
      cadastrarItem: boolean;
      minhaEmpresa: boolean;
      gerenciarItens: boolean;
    };
  }
  
  // Define a estrutura do estado de autenticação
  interface AuthState {
    token: string | null;
    userProfile: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean; // Para saber se a verificação inicial está acontecendo
  }
  
  // Define o que o Contexto vai fornecer: o estado e as funções
  interface AuthContextProps {
    authState: AuthState;
    checkAuthStatus: () => Promise<void>; // Verifica o token ao iniciar
    login: (identifier: string, token: string) => Promise<void>; // Recebe identificador e token da API
    logout: () => Promise<void>;
    fetchUserProfile?: () => Promise<void>; // Add this line (make it optional if appropriate)

  }
  
  // --- Criação do Contexto ---
  const AuthContext = createContext<AuthContextProps | undefined>(undefined);
  
  // --- Criação do Provedor (AuthProvider) ---
  interface AuthProviderProps {
    children: ReactNode; // Permite que o Provider envolva outros componentes
  }
  
  export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Estado interno do Provider
    const [authState, setAuthState] = useState<AuthState>({
      token: null,
      userProfile: null,
      isAuthenticated: false,
      isLoading: true, // Começa carregando para verificar o token
    });
  
    // Função para verificar o token armazenado ao iniciar o app
    const checkAuthStatus = useCallback(async () => {
      console.log('[AuthContext] Verificando status de autenticação...');
      // Garante que só rode uma vez se já estiver autenticado ou deslogado após loading inicial
      // Se o estado isLoading for false, já fizemos a checagem inicial.
      // if (!authState.isLoading && (authState.isAuthenticated || authState.token === null)) {
      //     console.log('[AuthContext] Verificação inicial já realizada.');
      //     return;
      // }
  
      // Se ainda está no estado inicial de loading=true, procede com a verificação
      if (!authState.isLoading) {
          setAuthState(prev => ({ ...prev, isLoading: true })); // Garante isLoading=true se chamado novamente
      }
  
      try {
        const credentials = await Keychain.getGenericPassword({ service: 'authToken' });
  
        if (credentials) {
          console.log('[AuthContext] Token encontrado no Keychain.');
          const storedToken = credentials.password;
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
  
          try {
            const response = await api.get<UserProfile>('/profile/me');
            const userProfileData = response.data;
            console.log('[AuthContext] Perfil obtido com sucesso:', userProfileData.nomeUsuario);
            setAuthState({
              token: storedToken,
              userProfile: userProfileData,
              isAuthenticated: true,
              isLoading: false,
            });
            console.log('[AuthContext] Usuário autenticado.');
          } catch (profileError: any) {
            console.error('[AuthContext] Erro ao buscar perfil (token pode ter expirado ou ser inválido):', profileError.response?.data || profileError.message);
            await Keychain.resetGenericPassword({ service: 'authToken' });
            delete api.defaults.headers.common['Authorization'];
            setAuthState({ token: null, userProfile: null, isAuthenticated: false, isLoading: false });
            console.log('[AuthContext] Token inválido ou expirado. Usuário deslogado.');
          }
        } else {
          console.log('[AuthContext] Nenhum token encontrado no Keychain.');
          delete api.defaults.headers.common['Authorization'];
          setAuthState({ token: null, userProfile: null, isAuthenticated: false, isLoading: false });
        }
      } catch (error) {
        console.error('[AuthContext] Erro inesperado ao verificar status:', error);
        delete api.defaults.headers.common['Authorization'];
        setAuthState({ token: null, userProfile: null, isAuthenticated: false, isLoading: false });
      }
    }, []); // Removido authState das dependências para rodar só uma vez na montagem via useEffect
  
    // useEffect para rodar a verificação quando o Provider montar
    useEffect(() => {
      console.log("AuthProvider montado, chamando checkAuthStatus...");
      checkAuthStatus();
    }, [checkAuthStatus]);
  
  
    // Função de Login (Chamada pela LoginScreen)
    const login = useCallback(async (identifier: string, token: string) => {
      console.log('[AuthContext] Processando login e salvando token...');
      // Define isLoading true aqui para feedback durante a busca do perfil pós-login
      setAuthState(prev => ({ ...prev, isLoading: true }));
      try {
        // Salva o token recebido da API ANTES de buscar perfil
        await Keychain.setGenericPassword(identifier, token, { service: 'authToken' });
        console.log('[AuthContext] Token armazenado no Keychain.');
  
        // Configura header do Axios com o novo token
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
        // Busca os dados do perfil com o novo token
        const response = await api.get<UserProfile>('/profile/me');
        const userProfileData = response.data;
        console.log('[AuthContext] Perfil obtido após login:', userProfileData.nomeUsuario);
  
        // Atualiza o estado global para autenticado e termina o loading
        setAuthState({
          token: token,
          userProfile: userProfileData,
          isAuthenticated: true,
          isLoading: false,
        });
        console.log('[AuthContext] Estado atualizado para autenticado.');
  
      } catch (error) {
          console.error('[AuthContext] Erro durante o processo de login (salvar token ou buscar perfil):', error);
          // Se falhar em qualquer etapa após receber o token, desloga por segurança
          // Precisamos chamar a lógica de limpar estado/keychain/header aqui também
          await Keychain.resetGenericPassword({ service: 'authToken' });
          delete api.defaults.headers.common['Authorization'];
          setAuthState({ token: null, userProfile: null, isAuthenticated: false, isLoading: false });
          throw error; // Propaga o erro para a tela de Login poder tratar (mostrar Alert)
      }
      // Não precisa de finally para isLoading aqui, pois é setado nos branches try/catch
    }, []); // useCallback sem dependência de logout agora
  
  
    // Função de Logout (Chamada pela HomeScreen)
    const logout = useCallback(async () => {
      console.log('[AuthContext] Processando logout...');
      try {
        await Keychain.resetGenericPassword({ service: 'authToken' });
        console.log('[AuthContext] Token removido do Keychain.');
        delete api.defaults.headers.common['Authorization'];
        setAuthState({ token: null, userProfile: null, isAuthenticated: false, isLoading: false });
        console.log('[AuthContext] Estado resetado para deslogado.');
      } catch (error) {
        console.error('[AuthContext] Erro durante o logout:', error);
        setAuthState({ token: null, userProfile: null, isAuthenticated: false, isLoading: false });
      }
    }, []);
  
    // Valor que será fornecido pelo Contexto
    const authContextValue: AuthContextProps = {
      authState,
      checkAuthStatus, // Incluído caso precise revalidar manualmente
      login,
      logout,
    };
  
    // Retorna o Provider envolvendo os componentes filhos
    return (
      <AuthContext.Provider value={authContextValue}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  // --- Hook Customizado para usar o Contexto ---
  export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
  };