import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BOQItem, MatchView, Selection } from '@/lib/types';
import { Search } from 'lucide-react';

interface ComparisonTableProps {
  boqItems: BOQItem[];
  matches: MatchView[];
  onSelectionsChange: (selections: Selection[]) => void;
}

export default function ComparisonTable({
  boqItems,
  matches,
  onSelectionsChange,
}: ComparisonTableProps) {
  const [searchText, setSearchText] = useState('');
  const [selections, setSelections] = useState<Map<string, Selection>>(new Map());

  // Group matches by BOQ item
  const vendorRates = useMemo(() => {
    const ratesMap = new Map<string, Map<string, number>>();

    matches.forEach((match) => {
      if (!match.matchedBoqId) return;

      if (!ratesMap.has(match.matchedBoqId)) {
        ratesMap.set(match.matchedBoqId, new Map());
      }

      const vendorMap = ratesMap.get(match.matchedBoqId)!;
      const existingRate = vendorMap.get(match.quote.vendor);

      // Keep the lowest rate if multiple matches for same vendor
      if (!existingRate || match.quote.rate < existingRate) {
        vendorMap.set(match.quote.vendor, match.quote.rate);
      }
    });

    return ratesMap;
  }, [matches]);

  // Get unique vendors
  const vendors = useMemo(() => {
    const vendorSet = new Set<string>();
    matches.forEach((m) => vendorSet.add(m.quote.vendor));
    return Array.from(vendorSet).sort();
  }, [matches]);

  // Filter BOQ items
  const filteredItems = useMemo(() => {
    if (!searchText) return boqItems;
    const lower = searchText.toLowerCase();
    return boqItems.filter(
      (item) =>
        item.itemNumber.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        item.section?.toLowerCase().includes(lower)
    );
  }, [boqItems, searchText]);

  // Initialize selections with lowest rates
  useMemo(() => {
    const initialSelections = new Map<string, Selection>();

    boqItems.forEach((item) => {
      const rates = vendorRates.get(item.id);
      if (!rates || rates.size === 0) return;

      // Find lowest rate
      let lowestVendor = '';
      let lowestRate = Infinity;

      rates.forEach((rate, vendor) => {
        if (rate < lowestRate) {
          lowestRate = rate;
          lowestVendor = vendor;
        }
      });

      if (lowestVendor) {
        initialSelections.set(item.id, {
          boqItemId: item.id,
          selectedVendor: lowestVendor,
          finalRate: lowestRate,
        });
      }
    });

    setSelections(initialSelections);
    onSelectionsChange(Array.from(initialSelections.values()));
  }, [boqItems, vendorRates]);

  const handleSelectVendor = (boqItemId: string, vendor: string, rate: number) => {
    const newSelections = new Map(selections);
    newSelections.set(boqItemId, {
      boqItemId,
      selectedVendor: vendor,
      finalRate: rate,
    });
    setSelections(newSelections);
    onSelectionsChange(Array.from(newSelections.values()));
  };

  const calculateTotal = (item: BOQItem, rate: number) => {
    return item.quantity * rate;
  };

  const projectTotal = useMemo(() => {
    let total = 0;
    selections.forEach((selection) => {
      const item = boqItems.find((b) => b.id === selection.boqItemId);
      if (item) {
        total += calculateTotal(item, selection.finalRate);
      }
    });
    return total;
  }, [selections, boqItems]);

  const baseTotal = useMemo(() => {
    let total = 0;
    boqItems.forEach((item) => {
      if (item.baseRate) {
        total += calculateTotal(item, item.baseRate);
      }
    });
    return total;
  }, [boqItems]);

  const savings = baseTotal > 0 ? baseTotal - projectTotal : 0;

  if (boqItems.length === 0 || matches.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Comparison Table
          </h2>
          <p className="text-sm text-muted-foreground">
            Compare vendor rates and select the best option
          </p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>No matched data available yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Comparison Table
        </h2>
        <p className="text-sm text-muted-foreground">
          Click on a vendor cell to select it for that item
        </p>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by item number, description, or section..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full">
            <thead className="bg-table-header sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-foreground border-b border-table-border sticky left-0 bg-table-header z-20">
                  Item
                </th>
                <th className="text-left p-3 text-sm font-medium text-foreground border-b border-table-border min-w-64">
                  Description
                </th>
                <th className="text-center p-3 text-sm font-medium text-foreground border-b border-table-border">
                  Unit
                </th>
                <th className="text-right p-3 text-sm font-medium text-foreground border-b border-table-border">
                  Qty
                </th>
                {vendors.map((vendor) => (
                  <th
                    key={vendor}
                    className="text-center p-3 text-sm font-medium text-foreground border-b border-table-border min-w-32"
                  >
                    {vendor}
                  </th>
                ))}
                <th className="text-center p-3 text-sm font-medium text-foreground border-b border-table-border min-w-32">
                  Selected
                </th>
                <th className="text-right p-3 text-sm font-medium text-foreground border-b border-table-border min-w-32">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const rates = vendorRates.get(item.id);
                const selection = selections.get(item.id);
                const lowestRate = rates
                  ? Math.min(...Array.from(rates.values()))
                  : null;

                return (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="p-3 text-sm border-b border-table-border sticky left-0 bg-card z-10">
                      {item.itemNumber}
                    </td>
                    <td className="p-3 text-sm border-b border-table-border">
                      {item.description}
                    </td>
                    <td className="p-3 text-sm text-center border-b border-table-border">
                      {item.unit}
                    </td>
                    <td className="p-3 text-sm text-right border-b border-table-border">
                      {item.quantity}
                    </td>
                    {vendors.map((vendor) => {
                      const rate = rates?.get(vendor);
                      const isLowest = rate === lowestRate;
                      const isSelected =
                        selection?.selectedVendor === vendor;

                      return (
                        <td
                          key={vendor}
                          className={`p-3 text-sm text-center border-b border-table-border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/10 font-medium'
                              : isLowest
                              ? 'bg-success/10'
                              : rate
                              ? 'hover:bg-muted'
                              : 'bg-muted/30'
                          }`}
                          onClick={() =>
                            rate && handleSelectVendor(item.id, vendor, rate)
                          }
                        >
                          {rate ? `₹${rate.toFixed(2)}` : '-'}
                        </td>
                      );
                    })}
                    <td className="p-3 text-sm text-center border-b border-table-border font-medium">
                      {selection ? selection.selectedVendor : '-'}
                    </td>
                    <td className="p-3 text-sm text-right border-b border-table-border font-medium">
                      {selection
                        ? `₹${calculateTotal(item, selection.finalRate).toFixed(2)}`
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-table-header sticky bottom-0">
              <tr>
                <td
                  colSpan={4 + vendors.length + 1}
                  className="p-3 text-sm font-semibold text-right border-t border-table-border"
                >
                  Project Total:
                </td>
                <td className="p-3 text-sm font-semibold text-right border-t border-table-border">
                  ₹{projectTotal.toFixed(2)}
                </td>
              </tr>
              {baseTotal > 0 && (
                <tr>
                  <td
                    colSpan={4 + vendors.length + 1}
                    className="p-3 text-sm text-right text-muted-foreground"
                  >
                    Savings vs. Base Rate:
                  </td>
                  <td className="p-3 text-sm font-medium text-right text-success">
                    ₹{savings.toFixed(2)}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>
    </Card>
  );
}
