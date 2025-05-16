// src/theme/colors.ts

// Cores base fornecidas por você (inspiradas no Flat UI)
const primary = '#3498DB'; // Azul vibrante (Peter River, não Turquoise)
const primaryLight = '#5DADE2'; // Azul mais claro
const primaryDark = '#2E86C1';  // Azul mais escuro
const secondary = '#2ECC71'; // Verde vibrante (Emerald)
const secondaryLight = '#58D68D'; // Verde mais claro
const secondaryDark = '#28B463';  // Verde mais escuro

const iconColor = '#000';

const backgroundLight = '#ECF0F1'; // Fundo claro (Clouds)
const backgroundDark = '#2C3E50'; // Fundo escuro (Wet Asphalt)

const cardLight = '#FFFFFF'; // Card em tema claro (era seu inputBackgroundLight '#EEECE6', mas branco é mais comum para card)
const cardDark = '#34495E';   // Card em tema escuro (Midnight Blue, era seu inputBackgroundDark)

const textPrimaryOnLight = '#2C3E50'; // Texto principal em tema claro (Wet Asphalt)
const textPrimaryOnDark = '#ECF0F1'; // Texto principal em tema escuro (Clouds)

const textSecondaryOnLight = '#7F8C8D'; // Texto secundário em tema claro (Asbestos)
const textSecondaryOnDark = '#BDC3C7'; // Texto secundário em tema escuro (Silver)

const inputBorderLight = '#BDC3C7'; // Borda de inputs em tema claro (Silver)
const inputBorderDark = '#7F8C8D'; // Borda de inputs em tema escuro (Asbestos)

const inputBackgroundLight = '#FFFFFF'; // Fundo de inputs em tema claro (Branco é comum)
const inputBackgroundDark = '#2C3E50'; // Fundo de inputs em tema escuro (Wet Asphalt, um pouco mais escuro que o card)

const buttonText = '#FFFFFF';
const buttonDisabledBackground = '#95A5A6'; // Concrete

const success = '#2ECC71'; // Emerald
const error = '#E74C3C';   // Alizarin
const warning = '#F1C40F'; // Sunflower
const info = '#3498DB';    // Peter River (mesmo que primary)

const white = '#FFFFFF';
const black = '#000000';

// Paleta para o Tema Claro
export const lightColors = {
  primary: primary,
  primaryLight: primaryLight,
  primaryDark: primaryDark,
  secondary: secondary,
  secondaryLight: secondaryLight,
  secondaryDark: secondaryDark,
  background: backgroundLight,
  card: cardLight, // Fundo de cards
  textPrimary: textPrimaryOnLight,
  textSecondary: textSecondaryOnLight,
  placeholder: textSecondaryOnLight, // Usando textSecondary para placeholder
  inputBorder: inputBorderLight,
  inputBackground: inputBackgroundLight,
  buttonText: buttonText,
  buttonDisabledBackground: buttonDisabledBackground,
  success: success,
  error: error,
  warning: warning,
  info: info,
  white: white,
  black: black,
  patternIcon: iconColor,
  iconColor: iconColor
};

// Paleta para o Tema Escuro
export const darkColors = {
  primary: primary,
  primaryLight: primaryLight,
  primaryDark: primaryDark,
  secondary: secondary,
  secondaryLight: secondaryLight,
  secondaryDark: secondaryDark,
  background: backgroundDark,
  card: cardDark, // Fundo de cards
  textPrimary: textPrimaryOnDark,
  textSecondary: textSecondaryOnDark,
  placeholder: textSecondaryOnDark, // Usando textSecondary para placeholder
  inputBorder: inputBorderDark,
  inputBackground: inputBackgroundDark,
  buttonText: buttonText,
  buttonDisabledBackground: buttonDisabledBackground,
  success: success,
  error: error,
  warning: warning,
  info: info,
  white: white,
  black: black,
  patternIcon: iconColor,
  iconColor: iconColor
};

export type ColorPalette = typeof lightColors;