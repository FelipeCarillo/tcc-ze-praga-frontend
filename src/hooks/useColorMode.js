import { useContext } from 'react';
import { ColorModeContext } from '../ColorModeContext';

export function useColorMode() {
  return useContext(ColorModeContext);
}

