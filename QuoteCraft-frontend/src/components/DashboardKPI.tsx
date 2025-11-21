import { Card } from '@/components/ui/card';
import { BOQItem, MatchView, Selection } from '@/lib/types';

interface DashboardKPIProps {
  boqItems: BOQItem[];
  matches: MatchView[];
  selections: Selection[];
}

export default function DashboardKPI({ boqItems, matches, selections }: DashboardKPIProps) {
  // Total vendors derived from matches
  const vendors = Array.from(new Set(matches.map((m) => m.quote.vendor)));

  // Coverage: how many BOQ items have at least one matched quote
  const matchedBoqIds = new Set(matches.filter((m) => m.matchedBoqId).map((m) => m.matchedBoqId as string));
  const coveredCount = boqItems.filter((b) => matchedBoqIds.has(b.id)).length;
  const coveragePct = boqItems.length > 0 ? Math.round((coveredCount / boqItems.length) * 100) : 0;

  // Totals and savings based on selections vs baseRate
  const projectTotal = selections.reduce((acc, sel) => {
    const item = boqItems.find((b) => b.id === sel.boqItemId);
    if (!item) return acc;
    return acc + item.quantity * sel.finalRate;
  }, 0);

  const baseTotal = boqItems.reduce((acc, item) => acc + (item.baseRate ? item.baseRate * item.quantity : 0), 0);
  const savings = baseTotal > 0 ? baseTotal - projectTotal : 0;

  const kpi = [
    { label: 'BOQ Items', value: boqItems.length.toString() },
    { label: 'Vendors', value: vendors.length.toString() },
    { label: 'Coverage', value: `${coveragePct}%` },
    { label: 'Project Total', value: `₹${projectTotal.toFixed(2)}` },
  ];

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Key metrics for your current comparison</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map((m) => (
          <div key={m.label} className="rounded-lg border border-border p-4 bg-card">
            <div className="text-sm text-muted-foreground">{m.label}</div>
            <div className="mt-1 text-2xl font-bold text-foreground">{m.value}</div>
          </div>
        ))}
      </div>
      {baseTotal > 0 && (
        <div className="mt-4 rounded-lg border border-success/30 bg-success/5 p-4">
          <div className="text-sm text-muted-foreground">Savings vs. Base</div>
          <div className="mt-1 text-xl font-semibold text-success">₹{savings.toFixed(2)}</div>
        </div>
      )}
    </Card>
  );
}
