// Demo Script: Generate mock data for Amazon Competitor Selection workflow
// Run with: npx tsx scripts/generate-data.ts

import XRaySDK from '../src/lib/xray';
import { FileStorageAdapter } from '../src/lib/storage';
import { Candidate, FilterEvaluation, FilterOutput } from '../src/types';

// Initialize SDK with explicit storage adapter (demonstrates adapter pattern)
const storage = new FileStorageAdapter();
const xray = XRaySDK.getInstance(storage);

// Helper to generate random candidates
function generateCandidates(count: number, scenario: 'perfect' | 'failure' | 'partial'): Candidate[] {
  const candidates: Candidate[] = [];

  for (let i = 0; i < count; i++) {
    let price: number;
    let rating: number;

    switch (scenario) {
      case 'perfect':
        // Most items pass: price >= 15 and rating >= 3.8
        price = 15 + Math.random() * 85; // $15-$100
        rating = 3.8 + Math.random() * 1.2; // 3.8-5.0
        break;
      case 'failure':
        // All items fail: either low price or low rating
        price = 5 + Math.random() * 12; // $5-$17 (some below $15)
        rating = 2.0 + Math.random() * 2.0; // 2.0-4.0 (most below 3.8)
        break;
      case 'partial':
        // Mixed: some pass, some fail
        if (i % 4 === 0) {
          price = 20 + Math.random() * 50;
          rating = 4.0 + Math.random() * 1.0;
        } else {
          price = 8 + Math.random() * 20;
          rating = 2.5 + Math.random() * 2.5;
        }
        break;
    }

    candidates.push({
      asin: `B${String(i + 1).padStart(2, '0')}${scenario.charAt(0).toUpperCase()}`,
      price: Math.round(price * 100) / 100,
      rating: Math.round(rating * 10) / 10,
      reviews: Math.floor(Math.random() * 5000) + 50,
      title: `Product ${i + 1} - ${scenario} scenario`,
    });
  }

  return candidates;
}

// Type definitions for step inputs/outputs (for type-safe SDK)
// Using index signatures to satisfy Record<string, unknown> constraint
interface KeywordInput { productName: string;[key: string]: unknown }
interface KeywordOutput { keywords: string[]; reasoning: string;[key: string]: unknown }

interface SearchInput { keywords: string[];[key: string]: unknown }
interface SearchOutput { total_results: number; candidates: Candidate[];[key: string]: unknown }

interface FilterInput { candidates_count: number; filters: { min_price: number; min_rating: number };[key: string]: unknown }

interface RankInput { qualified_candidates: number;[key: string]: unknown }
interface RankOutput {
  selected: Candidate | null;
  ranking: Array<{ asin: string; reviews: number; rank: number }>;
  [key: string]: unknown;
}

// Step 1: Keyword Generation
function keywordGeneration(productName: string): KeywordOutput {
  const keywordMap: Record<string, KeywordOutput> = {
    'Stainless Steel Water Bottle': {
      keywords: ['stainless steel water bottle', 'insulated bottle', 'metal water bottle', 'vacuum flask'],
      reasoning: 'Extracted attributes: material (steel), feature (insulated), product type (water bottle)',
    },
    'Wireless Bluetooth Earbuds': {
      keywords: ['wireless earbuds', 'bluetooth earphones', 'TWS earbuds', 'wireless headphones'],
      reasoning: 'Extracted attributes: connectivity (wireless, bluetooth), product type (earbuds/earphones)',
    },
    'Yoga Mat Premium': {
      keywords: ['yoga mat', 'exercise mat', 'fitness mat', 'non-slip yoga mat'],
      reasoning: 'Extracted attributes: activity (yoga, exercise), feature (non-slip), quality (premium)',
    },
  };

  return keywordMap[productName] || {
    keywords: [productName.toLowerCase()],
    reasoning: `Basic keyword extraction for: ${productName}`,
  };
}

// Step 2: Candidate Search
function candidateSearch(keywords: string[], scenario: 'perfect' | 'failure' | 'partial'): SearchOutput {
  const candidates = generateCandidates(50, scenario);
  return {
    total_results: Math.floor(Math.random() * 3000) + 500,
    candidates,
  };
}

// Step 3: Apply Filters - THE MOST IMPORTANT STEP
function applyFilters(candidates: Candidate[]): FilterOutput {
  const MIN_PRICE = 15;
  const MIN_RATING = 3.8;

  const evaluations: FilterEvaluation[] = [];
  const passedCandidates: Candidate[] = [];

  for (const candidate of candidates) {
    const failReasons: string[] = [];

    if (candidate.price < MIN_PRICE) {
      failReasons.push(`Price $${candidate.price.toFixed(2)} < Min $${MIN_PRICE}`);
    }
    if (candidate.rating < MIN_RATING) {
      failReasons.push(`Rating ${candidate.rating} < Min ${MIN_RATING}`);
    }

    const qualified = failReasons.length === 0;

    evaluations.push({
      asin: candidate.asin,
      qualified,
      reason: qualified ? 'Passed all checks' : `Failed: ${failReasons.join('; ')}`,
    });

    if (qualified) {
      passedCandidates.push(candidate);
    }
  }

  return {
    passed: passedCandidates.length,
    failed: candidates.length - passedCandidates.length,
    evaluations,
    passedCandidates,
  };
}

// Step 4: Rank & Select
function rankAndSelect(candidates: Candidate[]): RankOutput {
  if (candidates.length === 0) {
    return { selected: null, ranking: [] };
  }

  // Sort by reviews (descending)
  const sorted = [...candidates].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));

  const ranking = sorted.slice(0, 10).map((c, idx) => ({
    asin: c.asin,
    reviews: c.reviews || 0,
    rank: idx + 1,
  }));

  return {
    selected: sorted[0],
    ranking,
  };
}

// Generate a complete trace for a product
async function generateTrace(
  traceId: string,
  productName: string,
  scenario: 'perfect' | 'failure' | 'partial'
): Promise<void> {
  console.log(`\n🔄 Generating trace for: ${productName} (${scenario})`);

  xray.startTrace(traceId, `${productName} - Competitor Analysis`);

  // Step 1: Keyword Generation (Type-safe)
  const kwResult = keywordGeneration(productName);
  xray.addStep<KeywordInput, KeywordOutput>({
    stepName: 'Keyword Generation',
    input: { productName },
    output: kwResult,
    reasoning: kwResult.reasoning,
    status: 'success',
  });

  // Step 2: Candidate Search (Type-safe)
  const searchResult = candidateSearch(kwResult.keywords, scenario);
  xray.addStep<SearchInput, SearchOutput>({
    stepName: 'Candidate Search',
    input: { keywords: kwResult.keywords },
    output: searchResult,
    reasoning: `Found ${searchResult.total_results} total results in marketplace. Retrieved top ${searchResult.candidates.length} candidates for analysis.`,
    status: 'success',
  });

  // Step 3: Apply Filters (THE MOST IMPORTANT STEP) - Type-safe
  const filterResult = applyFilters(searchResult.candidates);
  const filterStatus = filterResult.passed > 0 ? 'success' : 'failure';
  xray.addStep<FilterInput, FilterOutput>({
    stepName: 'Apply Filters',
    input: {
      candidates_count: searchResult.candidates.length,
      filters: { min_price: 15, min_rating: 3.8 }
    },
    output: filterResult,
    reasoning: `Applied quality filters. ${filterResult.passed} candidates passed (Price >= $15 AND Rating >= 3.8). ${filterResult.failed} candidates eliminated.`,
    status: filterStatus,
  });

  // Step 4: Rank & Select (Type-safe)
  const rankResult = rankAndSelect(filterResult.passedCandidates);
  const rankStatus = rankResult.selected ? 'success' : 'failure';
  xray.addStep<RankInput, RankOutput>({
    stepName: 'Rank & Select',
    input: { qualified_candidates: filterResult.passed },
    output: rankResult,
    reasoning: rankResult.selected
      ? `Selected ${rankResult.selected.asin} with ${rankResult.selected.reviews} reviews as the top competitor.`
      : 'No qualified candidates available for selection. Pipeline failed.',
    status: rankStatus,
  });

  // Set overall trace status
  if (!rankResult.selected) {
    xray.setTraceStatus('failure');
  }

  await xray.save();
}

// Main execution
async function main() {
  console.log('🚀 X-Ray Demo Script - Generating Mock Data\n');
  console.log('='.repeat(50));
  console.log('📦 Using FileStorageAdapter (Adapter Pattern Demo)');

  // Generate 3 different traces
  await generateTrace('trace-001', 'Stainless Steel Water Bottle', 'perfect');
  await generateTrace('trace-002', 'Wireless Bluetooth Earbuds', 'failure');
  await generateTrace('trace-003', 'Yoga Mat Premium', 'partial');

  console.log('\n' + '='.repeat(50));
  console.log('✨ All traces generated successfully!');
  console.log('📁 Data saved to: data/traces.json');
}

main().catch(console.error);
