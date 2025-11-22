
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type WebhookEvent = {
  id: string;
  source: 'Email' | 'Cloud Storage';
  fileName: string;
  status: 'Processing' | 'Completed' | 'Failed';
  timestamp: string;
};

const mockEvents: WebhookEvent[] = [
  { id: 'evt_1', source: 'Email', fileName: 'vendor-quote-A.pdf', status: 'Completed', timestamp: '2025-11-21 10:30 AM' },
  { id: 'evt_2', source: 'Cloud Storage', fileName: 'boq-latest.xlsx', status: 'Processing', timestamp: '2025-11-21 10:35 AM' },
  { id: 'evt_3', source: 'Email', fileName: 'quote-B-revised.docx', status: 'Failed', timestamp: '2025-11-21 10:40 AM' },
];

export default function WebhookStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automated Document Ingestion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
              <div>
                <p className="font-medium">{event.fileName}</p>
                <p className="text-sm text-muted-foreground">
                  from {event.source} - {event.timestamp}
                </p>
              </div>
              <Badge variant={event.status === 'Completed' ? 'default' : event.status === 'Processing' ? 'secondary' : 'destructive'}>
                {event.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
