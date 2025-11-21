import { useQuery } from '@tanstack/react-query';
import { api, API_BASE } from '@/lib/api';

export default function HealthStatus() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['health', API_BASE],
    queryFn: api.health,
    refetchInterval: 15000,
  });

  const statusColor = error ? 'bg-destructive/20 text-destructive' : data ? 'bg-success/20 text-success' : 'bg-muted text-foreground';
  const label = error ? 'Backend: Unreachable' : isLoading ? 'Backend: Checking…' : `Backend: ${data?.status}`;

  return (
    <div className={`text-xs px-2 py-1 rounded-md ${statusColor}`} title={`API: ${API_BASE}`}>
      {label}
    </div>
  );
}
