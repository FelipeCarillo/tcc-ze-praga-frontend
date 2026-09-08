// Jest setup loaded automatically by react-scripts.
// Adds custom matchers like `toBeInTheDocument`.
import '@testing-library/jest-dom';
import {TextEncoder,TextDecoder} from 'util';
global.TextEncoder=TextEncoder;
global.TextDecoder=TextDecoder;

if (!URL.revokeObjectURL) URL.revokeObjectURL = jest.fn();
