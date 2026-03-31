import { useContext } from 'react';
import { ColorModeContext } from '../ColorModeContext';

export function useDarkMode() {
  const { mode } = useContext(ColorModeContext);
  return mode === 'dark';
}
