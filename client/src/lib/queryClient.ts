import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Check if we're in production (Netlify) or development environment
const isNetlify = import.meta.env.PROD;

// Transform API URLs for Netlify Functions if needed
function transformUrl(url: string): string {
  if (!isNetlify) return url; // Use the original URL in development
  
  // Transform API URLs to use Netlify Functions format
  if (url.startsWith('/api/')) {
    // Replace /api/ with /.netlify/functions/
    const endpoint = url.replace('/api/', '');
    
    // Handle special cases for nested paths
    if (endpoint.includes('/')) {
      // For paths like /api/incidents/all or /api/incidents/1
      const parts = endpoint.split('/');
      if (parts.length >= 2) {
        // We'll handle the logic in the function itself based on the path
        return `/.netlify/functions/${parts[0]}`;
      }
    }
    
    // For simple paths like /api/stats
    return `/.netlify/functions/${endpoint}`;
  }
  
  return url;
}

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
  try {
    // Transform the URL if needed for Netlify
    const transformedUrl = transformUrl(url);
    
    console.log(`Making ${method} request to ${transformedUrl}`, data);
    const res = await fetch(transformedUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    // Log the response status
    console.log(`Response from ${transformedUrl}:`, res.status);
    
    if (!res.ok) {
      // Try to get the error message from the response
      try {
        const errorData = await res.json();
        console.error(`API Error (${res.status}):`, errorData);
      } catch (parseError) {
        console.error(`API Error (${res.status}):`, await res.text());
      }
    }
    
    return res;
  } catch (error) {
    console.error(`API Request Failed:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Transform the URL if it's the first item in queryKey and it's a string
    const url = typeof queryKey[0] === 'string' ? transformUrl(queryKey[0]) : queryKey[0];
    
    const res = await fetch(url as string, {
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
