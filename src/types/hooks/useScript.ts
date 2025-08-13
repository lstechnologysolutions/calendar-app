export interface UseScriptOptions {
  removeOnUnmount?: boolean;
}

export interface UseScriptReturn {
  isScriptLoaded: boolean;
  isScriptLoadSucceed: boolean;
  error: Error | null;
  MercadoPago: typeof window.MercadoPago | null;
  initialized: boolean;
}
