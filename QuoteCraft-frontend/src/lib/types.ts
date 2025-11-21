export interface BOQItem {
  id: string;
  itemNumber: string;
  description: string;
  unit: string;
  quantity: number;
  baseRate?: number;
  section?: string;
}

export interface QuotationItem {
  vendor: string;
  description: string;
  unit: string;
  rate: number;
  quantity?: number;
}

export interface MatchView {
  quote: QuotationItem;
  matchedBoqId: string | null;
  confidence: number;
  alternatives: { boqId: string; label: string; score: number }[];
}

export interface Selection {
  boqItemId: string;
  selectedVendor: string;
  finalRate: number;
}

export interface ColumnMapping {
  itemNumber?: string;
  description?: string;
  unit?: string;
  quantity?: string;
  baseRate?: string;
  section?: string;
}
