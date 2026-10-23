import { ApiHttpError } from './http-error';

export class HttpClientService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL!) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    config: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.headers as Record<string, string>),
    };

    // Adiciona token de bypass da Vercel se disponível
    const vercelBypassToken = process.env.VERCEL_AUTOMATION_API_BYPASS_SECRET;
    if (vercelBypassToken) {
      headers['x-vercel-protection-bypass'] = vercelBypassToken;
    }

    try {
      const response = await fetch(url, { ...config, headers });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          body &&
          typeof body === 'object' &&
          'message' in body &&
          typeof (body as { message: unknown }).message === 'string'
            ? (body as { message: string }).message
            : undefined;
        throw new ApiHttpError(response.status, body, message);
      }

      return body as T;
    } catch (error) {
      if (error instanceof ApiHttpError) {
        throw error;
      }
      console.error(error);
      throw error;
    }
  }

  public get<T>(endpoint: string, config?: RequestInit) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  public post<T>(endpoint: string, body: unknown, config?: RequestInit) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public put<T>(endpoint: string, body: unknown, config?: RequestInit) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public patch<T>(endpoint: string, body: unknown, config?: RequestInit) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  public delete<T>(endpoint: string, config?: RequestInit) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}
