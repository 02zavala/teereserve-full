import { useEffect, useState } from 'react';

export function useTenant() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get tenant ID from the server-side header
    const getTenantId = async () => {
      try {
        const response = await fetch('/api/tenant');
        if (response.ok) {
          const data = await response.json();
          setTenantId(data.tenantId);
        }
      } catch (error) {
        console.error('Error fetching tenant ID:', error);
      } finally {
        setLoading(false);
      }
    };

    getTenantId();
  }, []);

  return { tenantId, loading };
}

