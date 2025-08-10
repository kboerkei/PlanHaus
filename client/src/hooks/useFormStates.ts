import { useState, useCallback } from "react";

export interface FormState {
  loading: boolean;
  error: string | null;
  success: string | null;
  touched: boolean;
  dirty: boolean;
}

export interface UseFormStateReturn extends FormState {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setTouched: (touched: boolean) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
  clearMessages: () => void;
}

export const useFormState = (initialState?: Partial<FormState>): UseFormStateReturn => {
  const [state, setState] = useState<FormState>({
    loading: false,
    error: null,
    success: null,
    touched: false,
    dirty: false,
    ...initialState
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, success: null }));
  }, []);

  const setSuccess = useCallback((success: string | null) => {
    setState(prev => ({ ...prev, success, error: null }));
  }, []);

  const setTouched = useCallback((touched: boolean) => {
    setState(prev => ({ ...prev, touched }));
  }, []);

  const setDirty = useCallback((dirty: boolean) => {
    setState(prev => ({ ...prev, dirty }));
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: null,
      touched: false,
      dirty: false
    });
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, error: null, success: null }));
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    setSuccess,
    setTouched,
    setDirty,
    reset,
    clearMessages
  };
};

// Hook for button interaction states
export interface ButtonState {
  hover: boolean;
  pressed: boolean;
  focused: boolean;
  disabled: boolean;
  loading: boolean;
}

export const useButtonState = (disabled?: boolean, loading?: boolean) => {
  const [state, setState] = useState<ButtonState>({
    hover: false,
    pressed: false,
    focused: false,
    disabled: disabled || false,
    loading: loading || false
  });

  const setHover = useCallback((hover: boolean) => {
    setState(prev => ({ ...prev, hover }));
  }, []);

  const setPressed = useCallback((pressed: boolean) => {
    setState(prev => ({ ...prev, pressed }));
  }, []);

  const setFocused = useCallback((focused: boolean) => {
    setState(prev => ({ ...prev, focused }));
  }, []);

  const updateDisabled = useCallback((disabled: boolean) => {
    setState(prev => ({ ...prev, disabled }));
  }, []);

  const updateLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  return {
    ...state,
    setHover,
    setPressed,
    setFocused,
    updateDisabled,
    updateLoading
  };
};

// Hook for input interaction states
export interface InputState {
  focused: boolean;
  dirty: boolean;
  touched: boolean;
  error: string | null;
  success: string | null;
}

export const useInputState = () => {
  const [state, setState] = useState<InputState>({
    focused: false,
    dirty: false,
    touched: false,
    error: null,
    success: null
  });

  const setFocused = useCallback((focused: boolean) => {
    setState(prev => ({ ...prev, focused }));
  }, []);

  const setDirty = useCallback((dirty: boolean) => {
    setState(prev => ({ ...prev, dirty }));
  }, []);

  const setTouched = useCallback((touched: boolean) => {
    setState(prev => ({ ...prev, touched }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, success: null }));
  }, []);

  const setSuccess = useCallback((success: string | null) => {
    setState(prev => ({ ...prev, success, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      focused: false,
      dirty: false,
      touched: false,
      error: null,
      success: null
    });
  }, []);

  return {
    ...state,
    setFocused,
    setDirty,
    setTouched,
    setError,
    setSuccess,
    reset
  };
};