import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BOQItem, QuotationItem, MatchView } from '@/lib/types';
import { matcher } from '@/lib/matching';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface AutoMatchProps {
  boqItems: BOQItem[];
  quoteItems: QuotationItem[];
  onMatchesChange: (matches: MatchView[]) => void;
}

export default function AutoMatch({
  boqItems,
  quoteItems,
  onMatchesChange,
}: AutoMatchProps) {
  const [matches, setMatches] = useState<MatchView[]>([]);

  useEffect(() => {
    if (boqItems.length > 0 && quoteItems.length > 0) {
      const initialMatches = matcher.match(boqItems, quoteItems);
      setMatches(initialMatches);
      onMatchesChange(initialMatches);
    }
  }, [boqItems, quoteItems]);

  const handleMatchChange = (quoteIndex: number, newBoqId: string) => {
    const updatedMatches = [...matches];
    updatedMatches[quoteIndex] = {
      ...updatedMatches[quoteIndex],
      matchedBoqId: newBoqId,
      confidence: 1.0, // Manual match = 100% confidence
    };
    setMatches(updatedMatches);
    onMatchesChange(updatedMatches);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return (
        <Badge variant="default" className="bg-success hover:bg-success">
          <CheckCircle className="h-3 w-3 mr-1" />
          High ({(confidence * 100).toFixed(0)}%)
        </Badge>
      );
    } else if (confidence >= 0.5) {
      return (
        <Badge variant="default" className="bg-warning hover:bg-warning">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Medium ({(confidence * 100).toFixed(0)}%)
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Low ({(confidence * 100).toFixed(0)}%)
        </Badge>
      );
    }
  };

  if (boqItems.length === 0 || quoteItems.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Auto-Match (AI Staged)
          </h2>
          <p className="text-sm text-muted-foreground">
            Automatically match vendor quotes to BOQ items
          </p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>Please upload BOQ and vendor quotes to start matching</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Auto-Match (AI Staged)
        </h2>
        <p className="text-sm text-muted-foreground">
          Review and adjust automatic matches. Click confidence badges to see
          alternatives.
        </p>
      </div>

      <div className="space-y-3">
        {matches.map((match, index) => {
          const matchedBoq = boqItems.find((b) => b.id === match.matchedBoqId);
          return (
            <div
              key={index}
              className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {match.quote.vendor}
                    </span>
                    {getConfidenceBadge(match.confidence)}
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {match.quote.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {match.quote.unit} • ₹{match.quote.rate.toFixed(2)}
                  </p>
                </div>

                <div className="flex-shrink-0 w-80">
                  <Select
                    value={match.matchedBoqId || ''}
                    onValueChange={(value) => handleMatchChange(index, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select BOQ item">
                        {matchedBoq
                          ? `${matchedBoq.itemNumber} — ${matchedBoq.description.substring(0, 40)}...`
                          : 'No match'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {matchedBoq && (
                        <>
                          <SelectItem value={matchedBoq.id} className="font-medium">
                            ✓ {matchedBoq.itemNumber} — {matchedBoq.description}
                          </SelectItem>
                          {match.alternatives.length > 0 && (
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                              Alternatives
                            </div>
                          )}
                        </>
                      )}
                      {match.alternatives.map((alt) => {
                        const altBoq = boqItems.find((b) => b.id === alt.boqId);
                        if (!altBoq) return null;
                        return (
                          <SelectItem key={alt.boqId} value={alt.boqId}>
                            {alt.label} ({(alt.score * 100).toFixed(0)}%)
                          </SelectItem>
                        );
                      })}
                      <div className="border-t border-border my-1" />
                      {boqItems
                        .filter(
                          (b) =>
                            b.id !== match.matchedBoqId &&
                            !match.alternatives.some((a) => a.boqId === b.id)
                        )
                        .slice(0, 10)
                        .map((boq) => (
                          <SelectItem key={boq.id} value={boq.id}>
                            {boq.itemNumber} — {boq.description}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
