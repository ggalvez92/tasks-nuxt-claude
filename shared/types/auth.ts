/**
 * Auth Types
 * Tipos TypeScript para el sistema de autenticación basado en el backend
 */

// Enums
export enum SessionPlatform {
  WEB = 'WEB',
  MOBILE = 'MOBILE'
}

// User Interface
export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Responses
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Auth Requests
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  platform: SessionPlatform;
  deviceLabel?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutDeviceRequest {
  jti: string;
}

// Generic Response
export interface MessageResponse {
  message: string;
}

// Error Response
export interface ErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

// Session Info (for JWT payload)
export interface SessionInfo {
  userId: string;
  email: string;
  jti: string;
  platform: SessionPlatform;
  deviceLabel?: string;
}
