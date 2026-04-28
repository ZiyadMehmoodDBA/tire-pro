'use strict';
/**
 * GTR Scraper — General Tyre & Rubber Company Pakistan
 * Site: https://www.gtr.com.pk/
 *
 * Strategy:
 *  1. Attempt live scraping of the product listing and individual product pages.
 *  2. Parse any size tables / text from static HTML (GTR uses JS for some specs).
 *  3. Merge discovered models with a comprehensive hardcoded BG-series dataset
 *     (primary source of truth for sizes / speed ratings when live data is absent).
 *  4. Return a flat array of tire_catalog-compatible rows.
 */

const axios   = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.gtr.com.pk';
const BRAND    = 'General Tyre (Pakistan)';

/* ─────────────────────────────────────────────────────────────────────────────
   Comprehensive BG-series product data
   Source: GTR official product brochures / Pakistan market data
   ───────────────────────────────────────────────────────────────────────────── */
const KNOWN_PRODUCTS = [
  /* ── Passenger Car – Economy ─────────────────────────────────────────────── */
  {
    model: 'BG ECONO', type: 'Passenger', speed_index: 'T',
    sizes: [
      { size: '155/80R13', load_index: '79' },
      { size: '165/70R13', load_index: '79' },
      { size: '165/80R13', load_index: '83' },
      { size: '175/65R13', load_index: '80' },
      { size: '175/70R13', load_index: '82' },
      { size: '185/70R13', load_index: '86' },
      { size: '175/65R14', load_index: '82' },
      { size: '185/65R14', load_index: '86' },
      { size: '195/65R14', load_index: '89' },
      { size: '185/60R14', load_index: '82' },
      { size: '195/60R14', load_index: '86' },
      { size: '185/60R15', load_index: '84' },
      { size: '195/60R15', load_index: '88' },
    ],
  },
  {
    model: 'BG ALRO PLUS', type: 'Passenger', speed_index: 'T',
    sizes: [
      { size: '165/80R13', load_index: '83' },
      { size: '175/70R13', load_index: '82' },
      { size: '185/70R13', load_index: '86' },
      { size: '185/65R14', load_index: '86' },
      { size: '195/65R14', load_index: '89' },
      { size: '205/65R15', load_index: '94' },
    ],
  },

  /* ── Passenger Car – Mid-Range ───────────────────────────────────────────── */
  {
    model: 'BG FALCON', type: 'Passenger', speed_index: 'H',
    sizes: [
      { size: '175/70R13', load_index: '82' },
      { size: '185/70R13', load_index: '86' },
      { size: '185/65R14', load_index: '86' },
      { size: '195/65R14', load_index: '89' },
      { size: '195/65R15', load_index: '91' },
      { size: '205/60R15', load_index: '91' },
      { size: '205/65R15', load_index: '94' },
      { size: '215/60R16', load_index: '95' },
      { size: '225/60R16', load_index: '98' },
      { size: '225/55R17', load_index: '97' },
    ],
  },
  {
    model: 'BG TEMPO PLUS', type: 'Passenger', speed_index: 'H',
    sizes: [
      { size: '185/65R14', load_index: '86' },
      { size: '195/65R14', load_index: '89' },
      { size: '195/65R15', load_index: '91' },
      { size: '205/60R15', load_index: '91' },
      { size: '205/65R15', load_index: '94' },
      { size: '215/60R16', load_index: '95' },
    ],
  },

  /* ── Passenger Car – Premium ─────────────────────────────────────────────── */
  {
    model: 'BG LUXO PLUS', type: 'Passenger', speed_index: 'H',
    sizes: [
      { size: '185/65R14', load_index: '86' },
      { size: '195/65R14', load_index: '89' },
      { size: '195/65R15', load_index: '91' },
      { size: '205/65R15', load_index: '94' },
      { size: '205/55R16', load_index: '91' },
      { size: '215/60R16', load_index: '95' },
      { size: '215/55R17', load_index: '94' },
      { size: '225/55R17', load_index: '97' },
    ],
  },
  {
    model: 'BG THUNDER MAX', type: 'Passenger', speed_index: 'V',
    sizes: [
      { size: '175/70R13', load_index: '82' },
      { size: '185/65R14', load_index: '86' },
      { size: '195/65R14', load_index: '89' },
      { size: '195/65R15', load_index: '91' },
      { size: '205/65R15', load_index: '94' },
      { size: '205/55R16', load_index: '91' },
      { size: '215/55R16', load_index: '93' },
      { size: '215/45R17', load_index: '91' },
      { size: '225/45R17', load_index: '91' },
    ],
  },

  /* ── Performance ─────────────────────────────────────────────────────────── */
  {
    model: 'BG MAX SPORT', type: 'Performance', speed_index: 'W',
    sizes: [
      { size: '195/50R15', load_index: '82' },
      { size: '195/55R15', load_index: '85' },
      { size: '205/50R16', load_index: '87' },
      { size: '205/45R17', load_index: '88' },
      { size: '215/45R17', load_index: '91' },
      { size: '225/45R17', load_index: '91' },
      { size: '225/40R18', load_index: '88' },
      { size: '245/40R18', load_index: '93' },
    ],
  },

  /* ── SUV / Crossover ─────────────────────────────────────────────────────── */
  {
    model: 'BG ALVO PLUS', type: 'SUV', speed_index: 'H',
    sizes: [
      { size: '205/65R15', load_index: '94' },
      { size: '215/65R15', load_index: '96' },
      { size: '225/65R17', load_index: '102' },
      { size: '235/65R17', load_index: '108' },
      { size: '265/65R17', load_index: '112' },
      { size: '255/60R18', load_index: '112' },
      { size: '265/60R18', load_index: '110' },
      { size: '255/55R19', load_index: '111' },
    ],
  },

  /* ── Van / Light Commercial ──────────────────────────────────────────────── */
  {
    model: 'BG VANO PLUS', type: 'Van', speed_index: 'R',
    sizes: [
      { size: '185R14C',    load_index: '102' },
      { size: '195R14C',    load_index: '106' },
      { size: '195R15C',    load_index: '106' },
      { size: '205/70R15C', load_index: '106' },
      { size: '215/70R15C', load_index: '109' },
    ],
  },

  /* ── Light Truck ─────────────────────────────────────────────────────────── */
  {
    model: 'BG TRAKO PLUS', type: 'LT', speed_index: 'J',
    sizes: [
      { size: '7.50R16',  load_index: '122' },
      { size: '8.25R16',  load_index: '128' },
      { size: '9.00R16',  load_index: '133' },
      { size: '9.00R20',  load_index: '144' },
      { size: '10.00R20', load_index: '149' },
    ],
  },

  /* ── Truck & Bus ─────────────────────────────────────────────────────────── */
  {
    model: 'EURO TYCOON', type: 'Truck', speed_index: 'J',
    sizes: [
      { size: '10.00R20', load_index: '149' },
      { size: '11.00R20', load_index: '152' },
      { size: '12.00R20', load_index: '154' },
    ],
  },
  {
    model: 'EURO TYCOON 2', type: 'Truck', speed_index: 'J',
    sizes: [
      { size: '10.00R20', load_index: '149' },
      { size: '11.00R20', load_index: '152' },
      { size: '12.00R20', load_index: '154' },
      { size: '13R22.5',  load_index: '156' },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HTTP helpers
   ───────────────────────────────────────────────────────────────────────────── */
const HTTP_HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

async function fetchPage(url, timeoutMs = 15000) {
  const res = await axios.get(url, { timeout: timeoutMs, headers: HTTP_HEADERS });
  return cheerio.load(res.data);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ─────────────────────────────────────────────────────────────────────────────
   Size parsing helpers
   ───────────────────────────────────────────────────────────────────────────── */
// Matches standard metric sizes: 195/65R15, 215/60R16C, 7.50R16, etc.
const SIZE_REGEX = /\b(\d{2,3}(?:[./]\d{2})?[RBD]\d{2}[A-Z]?\d*(?:[CL])?)\b/gi;

function extractSizesFromText(text) {
  const matches = new Set();
  for (const m of text.matchAll(SIZE_REGEX)) {
    matches.add(m[1].toUpperCase().replace(/\s+/g, ''));
  }
  return [...matches];
}

function inferTypeFromBreadcrumbs($) {
  const text = $('nav, .breadcrumb, .woocommerce-breadcrumb').text().toLowerCase();
  if (text.includes('passenger') || text.includes('car'))     return 'Passenger';
  if (text.includes('suv') || text.includes('crossover'))     return 'SUV';
  if (text.includes('light truck') || text.includes(' lt'))   return 'LT';
  if (text.includes('truck') || text.includes('bus'))         return 'Truck';
  if (text.includes('van') || text.includes('commercial'))    return 'Van';
  if (text.includes('performance') || text.includes('sport')) return 'Performance';
  return '';
}

/* ─────────────────────────────────────────────────────────────────────────────
   Discover product URLs from the GTR website
   ───────────────────────────────────────────────────────────────────────────── */
async function discoverProductUrls() {
  const urls = new Set();
  try {
    const $ = await fetchPage(`${BASE_URL}/product/`);
    $('a[href]').each((_, el) => {
      const href = ($(el).attr('href') || '').trim();
      // Accept /product/something/ but not /product/ or /product/page/ itself
      if (
        href.startsWith(`${BASE_URL}/product/`) &&
        href !== `${BASE_URL}/product/` &&
        !href.includes('/page/') &&
        !href.includes('?')
      ) {
        urls.add(href.replace(/\/+$/, '/'));
      }
    });
  } catch (err) {
    console.warn('[GTR Scraper] Product URL discovery failed:', err.message);
  }
  return [...urls];
}

/* ─────────────────────────────────────────────────────────────────────────────
   Scrape a single product page
   ───────────────────────────────────────────────────────────────────────────── */
async function scrapeProductPage(url) {
  try {
    const $ = await fetchPage(url);
    const bodyText = $('body').text();

    // Product name from <h1>
    const title = $('h1').first().text().trim()
      .replace(/^general\s+tyre\s*/i, '').toUpperCase();

    // Sizes from body text
    const sizes = extractSizesFromText(bodyText);

    // Category from breadcrumbs
    const category = inferTypeFromBreadcrumbs($);

    // Try JSON-LD Product schema
    let speedIndex = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || '{}');
        if (data['@type'] === 'Product' && data.description) {
          // Sometimes speed rating is mentioned in the description
          const m = data.description.match(/speed[^:]*:\s*([A-Z])/i);
          if (m) speedIndex = m[1];
        }
      } catch { /* ignore */ }
    });

    return { title, sizes, category, speedIndex };
  } catch (err) {
    return { title: '', sizes: [], category: '', speedIndex: null };
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main export
   ───────────────────────────────────────────────────────────────────────────── */
async function scrapeGTR() {
  const webDiscovered = new Map(); // model → { sizes[], category, speedIndex }
  const results       = [];

  /* Step 1 — live scraping (best-effort; failures don't abort the job) */
  try {
    console.log('[GTR Scraper] Discovering product URLs...');
    const productUrls = await discoverProductUrls();
    console.log(`[GTR Scraper] Found ${productUrls.length} product URL(s)`);

    for (const url of productUrls.slice(0, 30)) {
      const data = await scrapeProductPage(url);
      if (data.title) {
        webDiscovered.set(data.title, {
          sizes:      data.sizes,
          category:   data.category,
          speedIndex: data.speedIndex,
        });
      }
      await sleep(800); // be polite to the server
    }
  } catch (err) {
    console.warn('[GTR Scraper] Live scraping partial failure:', err.message);
  }

  /* Step 2 — build catalog rows from KNOWN_PRODUCTS, enriched by live data */
  for (const product of KNOWN_PRODUCTS) {
    const web       = webDiscovered.get(product.model) || {};
    const finalSizes = (web.sizes && web.sizes.length > 0)
      ? web.sizes.map(s => ({ size: s }))
      : product.sizes;
    const type       = web.category   || product.type;
    const speedIdx   = web.speedIndex || product.speed_index || null;

    for (const entry of finalSizes) {
      results.push({
        brand:       BRAND,
        model:       product.model,
        size:        (entry.size || entry).toString().toUpperCase().replace(/\s+/g, ''),
        pattern:     product.model,        // GTR uses model name as the pattern name
        load_index:  entry.load_index || null,
        speed_index: speedIdx,
        tire_type:   type,
      });
    }
  }

  /* Step 3 — add newly discovered models not in KNOWN_PRODUCTS */
  for (const [model, { sizes, category, speedIndex }] of webDiscovered) {
    const known = KNOWN_PRODUCTS.some(p => p.model === model);
    if (!known && sizes.length > 0) {
      for (const size of sizes) {
        results.push({
          brand:       BRAND,
          model,
          size:        size.toUpperCase().replace(/\s+/g, ''),
          pattern:     model,
          load_index:  null,
          speed_index: speedIndex || null,
          tire_type:   category   || 'Passenger',
        });
      }
    }
  }

  console.log(`[GTR Scraper] Prepared ${results.length} catalog entries`);
  return results;
}

module.exports = { scrapeGTR, BRAND, KNOWN_PRODUCTS };
