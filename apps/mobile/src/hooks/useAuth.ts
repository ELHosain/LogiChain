// src/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { AuthAPI } from '../services/api';
import { useAuthStore } from '../store';

export function useAuth() {
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      AuthAPI.login(email, password),
    onSuccess: (data) => setAuth(data.token, data.user),
  });

  const logout = async () => {
    await AuthAPI.logout();
    clearAuth();
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
  };
}
