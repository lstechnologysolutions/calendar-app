import { useState, useEffect, useCallback } from 'react';
import { UseScriptOptions, UseScriptReturn } from '@/types/hooks/useScript';
declare global {
  interface Window {
    MercadoPago: any;
    Mercadopago: any;
  }
}

export default function useScript(
  url: string,
  name: string,
  options: UseScriptOptions = { removeOnUnmount: true }
): UseScriptReturn {
  const [state, setState] = useState<Omit<UseScriptReturn, 'MercadoPago'>>({
    isScriptLoaded: false,
    isScriptLoadSucceed: false,
    error: null,
    initialized: false,
  });
  const [mercadoPago, setMercadoPago] = useState<(() => any) | null>(null);

  useEffect(() => {
    if (!url) {
      return;
    }

    let script: HTMLScriptElement | null = document.querySelector(`script[src="${url}"]`);
    
    const handleScriptLoad = () => {
      const MP = window.MercadoPago || window.Mercadopago;
      if (MP) {
        // Store a function that will create a new instance when called
        setMercadoPago(() => MP);
        setState(prev => ({
          ...prev,
          isScriptLoaded: true,
          isScriptLoadSucceed: true,
          initialized: true,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isScriptLoaded: true,
          isScriptLoadSucceed: false,
          error: new Error('MercadoPago SDK not found after script load'),
          initialized: false,
        }));
      }
    };

    const handleScriptError = (error: Event | string) => {
      const errorMessage = typeof error === 'string' ? error : 'Failed to load script';
      setState(prev => ({
        ...prev,
        isScriptLoaded: true,
        isScriptLoadSucceed: false,
        error: new Error(errorMessage),
        initialized: false,
      }));
    };

    if (!script) {
      script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.setAttribute('data-status', 'loading');
      script.onload = handleScriptLoad;
      script.onerror = () => handleScriptError('Error loading script');
      document.body.appendChild(script);
    } else if (script.getAttribute('data-status') === 'ready') {
      handleScriptLoad();
    }

    return () => {
      if (script && options.removeOnUnmount) {
        // Remove the onload/onerror handlers that were set directly on the script element
        script.onload = null;
        script.onerror = null;
        script.remove();
      }
    };
  }, [url, options.removeOnUnmount]);

  return {
    ...state,
    MercadoPago: mercadoPago, // This will be the function that creates a new instance
  };
}
