import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Build URL from queryKey - first element is the base path
    const [basePath, ...params] = queryKey;
    let url = basePath as string;
    
    // Convert remaining parameters to query string
    if (params.length > 0) {
      const searchParams = new URLSearchParams();
      
      params.forEach((param, index) => {
        if (param && typeof param === 'object') {
          // Handle filter objects
          Object.entries(param as Record<string, any>).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "all") {
              searchParams.append(key, String(value));
            }
          });
        } else if (param !== undefined && param !== null && param !== "all") {
          // Handle primitive parameters with meaningful keys
          if (index === 0) searchParams.append('sortBy', String(param));
          else if (index === 1) searchParams.append('limit', String(param));
          else if (index === 2) searchParams.append('offset', String(param));
        }
      });
      
      if (searchParams.toString()) {
        url += '?' + searchParams.toString();
      }
    }

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
