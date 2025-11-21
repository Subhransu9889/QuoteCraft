import { MatchedItem, UnmatchedItem, BOQItem, QuoteItem } from '../models/types';

class VendorMatcherService {
  matchItems(boqItems: BOQItem[], quoteItems: QuoteItem[]): {
    matches: MatchedItem[];
    unmatched: UnmatchedItem[];
  } {
    const matches: MatchedItem[] = [];
    const unmatched: UnmatchedItem[] = [];

    quoteItems.forEach((quoteItem) => {
      const boqItem = boqItems.find((item) => item.sku === quoteItem.sku);

      if (boqItem) {
        const variance = this.calculateVariance(
          boqItem.estimatedPrice,
          quoteItem.unitPrice
        );

        matches.push({
          boqLineNo: boqItem.lineNo,
          sku: quoteItem.sku,
          description: boqItem.description,
          boqQty: boqItem.qty,
          boqPrice: boqItem.estimatedPrice,
          quoteQty: quoteItem.qty,
          quotePrice: quoteItem.unitPrice,
          variance,
          matched: true,
          isOutlier: Math.abs(variance) > 30,
          outlierReason:
            Math.abs(variance) > 30
              ? `Price variance ${variance.toFixed(2)}% exceeds 30% threshold`
              : undefined
        });
      } else {
        unmatched.push({
          sku: quoteItem.sku,
          qty: quoteItem.qty,
          quotePrice: quoteItem.unitPrice,
          matched: false,
          reason: 'SKU not in BOQ'
        });
      }
    });

    return { matches, unmatched };
  }

  calculateVariance(boqPrice: number, quotePrice: number): number {
    return ((quotePrice - boqPrice) / boqPrice) * 100;
  }
}

export default new VendorMatcherService();
