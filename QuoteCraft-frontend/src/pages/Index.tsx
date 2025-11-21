import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import UploadBOQ from '@/components/UploadBOQ';
import UploadQuotes from '@/components/UploadQuotes';
import AutoMatch from '@/components/AutoMatch';
import ComparisonTable from '@/components/ComparisonTable';
import ExportButton from '@/components/ExportButton';
import DashboardKPI from '@/components/DashboardKPI';
import { BOQItem, QuotationItem, MatchView, Selection } from '@/lib/types';
import HealthStatus from '@/components/HealthStatus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ApproveButton from '@/components/ApproveButton';

interface VendorQuote {
  vendor: string;
  items: QuotationItem[];
  fileName: string;
}

const Index = () => {
  const [boqData, setBoqData] = useState<BOQItem[] | null>(null);
  const [quotes, setQuotes] = useState<VendorQuote[]>([]);
  const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([]);
  const [matches, setMatches] = useState<MatchView[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);

  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    boq: true,
    quotes: true,
    match: true,
    dashboard: true,
    comparison: true,
    approval: true,
    export: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SectionHeader = ({
    title,
    section,
    stepNumber,
  }: {
    title: string;
    section: string;
    stepNumber: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          {stepNumber}
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg shadow-sm">
            <div className="container mx-auto px-4 lg:px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="space-y-1 animate-fade-in">
                        <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                            Quote<span className="text-primary">Craft</span>
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            AI-Powered Procurement Intelligence Platform
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs text-muted-foreground">Powered by</div>
                            <div className="text-sm font-semibold text-primary">IBM watsonx</div>
                        </div>
                        <div>
                          {/* Backend Health Indicator */}
                          <HealthStatus />
                        </div>
                    </div>
                </div>
            </div>
        </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
        {/* Step 1: Upload BOQ */}
        <Card>
          <SectionHeader title="Upload BOQ" section="boq" stepNumber={1} />
          {expandedSections.boq && (
            <div className="p-6 pt-0">
              <UploadBOQ onDataLoaded={setBoqData} boqData={boqData} />
            </div>
          )}
        </Card>

        {/* Step 2: Upload Quotes */}
        <Card>
          <SectionHeader
            title="Upload Vendor Quotes"
            section="quotes"
            stepNumber={2}
          />
          {expandedSections.quotes && (
            <div className="p-6 pt-0">
              <UploadQuotes
                onQuotesLoaded={setQuoteItems}
                quotes={quotes}
                setQuotes={setQuotes}
              />
            </div>
          )}
        </Card>

        {/* Step 3: Auto-Match */}
        <Card>
          <SectionHeader
            title="Auto-Match (AI Staged)"
            section="match"
            stepNumber={3}
          />
          {expandedSections.match && (
            <div className="p-6 pt-0">
              <AutoMatch
                boqItems={boqData || []}
                quoteItems={quoteItems}
                onMatchesChange={setMatches}
              />
            </div>
          )}
        </Card>

        {/* Step 4: Dashboard */}
        <Card>
          <SectionHeader
            title="Dashboard"
            section="dashboard"
            stepNumber={4}
          />
          {expandedSections.dashboard && (
            <div className="p-6 pt-0">
              <DashboardKPI boqItems={boqData || []} matches={matches} selections={selections} />
            </div>
          )}
        </Card>

        {/* Step 5: Comparison Table */}
        <Card>
          <SectionHeader
            title="Comparison Table"
            section="comparison"
            stepNumber={5}
          />
          {expandedSections.comparison && (
            <div className="p-6 pt-0">
              <ComparisonTable
                boqItems={boqData || []}
                matches={matches}
                onSelectionsChange={setSelections}
              />
            </div>
          )}
        </Card>

        {/* Step 6: Approval */}
        <Card>
          <SectionHeader title="Approval" section="approval" stepNumber={6} />
          {expandedSections.approval && (
            <div className="p-6 pt-0">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Approve your selections to finalize the comparison and generate a summary file.</p>
                <ApproveButton
                  boqItems={boqData || []}
                  selections={selections}
                  disabled={!boqData || quotes.length === 0 || matches.length === 0}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Step 7: Export */}
        <Card>
          <SectionHeader title="Export" section="export" stepNumber={7} />
          {expandedSections.export && (
            <div className="p-6 pt-0">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Export the updated BOQ with selected vendor rates
                </p>
                <ExportButton
                  boqItems={boqData || []}
                  selections={selections}
                  disabled={
                    !boqData || quotes.length === 0 || matches.length === 0
                  }
                />
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Index;
