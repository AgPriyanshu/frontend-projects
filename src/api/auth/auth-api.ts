import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../api';
import { setTokens } from '../token';
import { queryClient } from '../query-client';
import { toCamelCase } from '../case-converter';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

/**
 * Login mutation hook
 * Usage: const { mutate: login, isPending } = useLogin();
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      // Convert snake_case response from server to camelCase
      return toCamelCase<LoginResponse>(response.data);
    },
    onSuccess: (data) => {
      // Store tokens after successful login
      setTokens(data.accessToken, data.refreshToken);
      
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

/**
 * User profile query hook
 * Usage: const { data: profile, isLoading } = useUserProfile();
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await api.get<UserProfile>('/user/profile');
      // Convert snake_case response from server to camelCase
      return toCamelCase<UserProfile>(response.data);
    },
    // Only fetch if user is authenticated (has access token)
    enabled: !!localStorage.getItem('access_token'),
  });
};

/**
 * Logout mutation hook
 * Usage: const { mutate: logout } = useLogout();
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      // Clear all cached queries
      queryClient.clear();
      
      // Redirect to login
      window.location.href = '/login';
    },
  });
};
