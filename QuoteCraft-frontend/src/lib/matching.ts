import Fuse from 'fuse.js';
import { BOQItem, QuotationItem, MatchView } from './types';

export interface MatchProvider {
  match(boqItems: BOQItem[], quoteItems: QuotationItem[]): MatchView[];
}

export class FuzzyMatcher implements MatchProvider {
  match(boqItems: BOQItem[], quoteItems: QuotationItem[]): MatchView[] {
    const fuse = new Fuse(boqItems, {
      keys: [
        { name: 'description', weight: 0.8 },
        { name: 'unit', weight: 0.2 },
      ],
      threshold: 0.4,
      distance: 100,
      includeScore: true,
      ignoreLocation: true,
    });

    return quoteItems.map((quote) => {
      const results = fuse.search(quote.description);
      
      // Get top match
      const topMatch = results[0];
      const matchedBoqId = topMatch ? topMatch.item.id : null;
      const confidence = topMatch ? 1 - (topMatch.score || 0) : 0;

      // Get top 3 alternatives (excluding the top match)
      const alternatives = results
        .slice(1, 4)
        .map((result) => ({
          boqId: result.item.id,
          label: `${result.item.itemNumber} — ${result.item.description}`,
          score: 1 - (result.score || 0),
        }));

      return {
        quote,
        matchedBoqId,
        confidence,
        alternatives,
      };
    });
  }
}

/**
 * TODO: LLM-based matching
 * 
 * This class provides a placeholder for future LLM integration (OpenAI, Gemini, etc.)
 * 
 * Implementation notes:
 * - Use same interface as FuzzyMatcher
 * - Send BOQ descriptions + quote descriptions to LLM
 * - Ask LLM to return matches with confidence scores
 * - Include context like unit matching, quantity validation
 * - Consider batch processing for performance
 * - Handle rate limits and errors gracefully
 * 
 * Example prompt structure:
 * "Match these vendor quote items to BOQ items. Return matches with confidence 0-1.
 *  BOQ Items: [{itemNumber, description, unit}...]
 *  Quote Items: [{vendor, description, unit}...]"
 */
export class LLMMatch implements MatchProvider {
  match(boqItems: BOQItem[], quoteItems: QuotationItem[]): MatchView[] {
    throw new Error('LLM matching not yet implemented. Use FuzzyMatcher for now.');
  }
}

// Default matcher
export const matcher: MatchProvider = new FuzzyMatcher();
