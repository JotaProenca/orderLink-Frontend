import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props { width?: number; height?: number; }

const MicrosoftLogoSvg: React.FC<Props> = ({ width = 21, height = 21 }) => {
  // Removidos quaisquer espaços/quebras de linha entre as tags!
  return (
    <Svg height={height} width={width} viewBox="0 0 21 21"><Rect x="1" y="1" width="9" height="9" fill="#F25022" /><Rect x="1" y="11" width="9" height="9" fill="#00A4EF" /><Rect x="11" y="1" width="9" height="9" fill="#7FBA00" /><Rect x="11" y="11" width="9" height="9" fill="#FFB900" /></Svg>
  );
};

export default MicrosoftLogoSvg;