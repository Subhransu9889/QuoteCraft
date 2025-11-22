import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WatsonxStatus() {
  return (
    <Card className="mt-4 animate-fade-in">
      <CardHeader>
        <CardTitle>watsonx Orchestrate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Latest Flow: Approval Flow</p>
            <p className="text-sm text-muted-foreground">Status: <span className="font-medium">COMPLETED</span></p>
          </div>
          <Badge variant="secondary">COMPLETED</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
