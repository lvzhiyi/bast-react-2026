import axios, { type AxiosInstance } from 'axios';

export interface CreateApiClientOptions {
  baseURL?: string;
  tokenKey?: string;
  onUnauthorized?: () => void;
}

export function createApiClient(options: CreateApiClientOptions = {}): AxiosInstance {
  const { baseURL = '/api', tokenKey = 'access_token', onUnauthorized } = options;

  const client = axios.create({
    baseURL,
    timeout: 15000,
  });

  client.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem(tokenKey);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response.data,
    (error: unknown) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        typeof onUnauthorized === 'function'
      ) {
        onUnauthorized();
      }
      return Promise.reject(error);
    },
  );

  return client;
}
