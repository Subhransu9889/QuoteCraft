import ERPIntegration from '@/components/ERPIntegration';
import WebhookStatus from '@/components/WebhookStatus';
import WatsonxStatus from '@/components/WatsonxStatus';
import { Card } from '@/components/ui/card';

export default function Integrations() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-semibold mb-4">Integrations & Orchestration</h1>
      <Card>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <ERPIntegration />
          <WebhookStatus />
          <WatsonxStatus />
        </div>
      </Card>
    </main>
  );
}
