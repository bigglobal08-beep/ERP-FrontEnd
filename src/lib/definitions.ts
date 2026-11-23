export type ApiFieldError = { field: string; message: string };

// Respuesta estándar del backend
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  error?: ApiFieldError[];
  total?: number;
  page?: number;
  limit?: number;
  dataExtra?: Record<string, unknown>;
}

// Respuesta estándar de una server action: nunca lanza el error hacia el componente
export interface ActionResponse<T = null> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  fieldErrors?: ApiFieldError[];
  total?: number;
  page?: number;
  limit?: number;
  dataExtra?: Record<string, unknown>;
}

export type ListArgs = {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
};
