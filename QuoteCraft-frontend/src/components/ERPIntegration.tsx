import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ERPIntegration() {
  const handleCreateMockPO = () => {
    toast.success('Mock PO created in ERP (simulated).');
  };

  return (
    <Card className="mt-4 animate-fade-in">
      <CardHeader>
        <CardTitle>ERP Integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Connect your ERP to create and track Purchase Orders automatically.</p>
        <div className="flex gap-2">
          <Button onClick={handleCreateMockPO} size="sm">Create Mock PO</Button>
          <Button variant="outline" size="sm">Configure Integration</Button>
        </div>
      </CardContent>
    </Card>
  );
}
