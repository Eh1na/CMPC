
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills para Jest
global.TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Mock para Blob
class MockBlob {
  constructor(public parts: any[], public options: any) {}
}
global.Blob = MockBlob as any;