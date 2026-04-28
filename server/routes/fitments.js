'use strict';
/**
 * Vehicle fitment routes — Pakistan-market OEM tyre lookup.
 * Mounted at: /api/fitments
 */

const express = require('express');
const router  = express.Router();
const { getPool, sql } = require('../db');

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/fitments/categories
   Returns all distinct categories in sorted order.
───────────────────────────────────────────────────────────────────────────── */
router.get('/categories', async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(`
      SELECT DISTINCT category FROM vehicle_fitments ORDER BY category
    `);
    res.json(result.recordset.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/fitments/makes?category=SUV
   Returns distinct makes, optionally filtered by category.
───────────────────────────────────────────────────────────────────────────── */
router.get('/makes', async (req, res) => {
  try {
    const pool = await getPool();
    const { category } = req.query;
    const req2 = pool.request();
    let where = '';
    if (category) {
      req2.input('cat', sql.NVarChar(50), category);
      where = 'WHERE category = @cat';
    }
    const result = await req2.query(
      `SELECT DISTINCT make FROM vehicle_fitments ${where} ORDER BY make`
    );
    res.json(result.recordset.map(r => r.make));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/fitments/models?make=Toyota&category=SUV
   Returns distinct models, filtered by make (required) and optional category.
───────────────────────────────────────────────────────────────────────────── */
router.get('/models', async (req, res) => {
  try {
    const pool = await getPool();
    const { make, category } = req.query;
    if (!make) return res.status(400).json({ error: 'make is required' });

    const req2 = pool.request().input('make', sql.NVarChar(50), make);
    const conditions = ['make = @make'];
    if (category) {
      req2.input('cat', sql.NVarChar(50), category);
      conditions.push('category = @cat');
    }
    const result = await req2.query(`
      SELECT DISTINCT model FROM vehicle_fitments
      WHERE ${conditions.join(' AND ')} ORDER BY model
    `);
    res.json(result.recordset.map(r => r.model));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/fitments/search?make=Toyota&model=Corolla&category=Passenger
   Returns fitment rows + matching tire_catalog entries for each size.
───────────────────────────────────────────────────────────────────────────── */
router.get('/search', async (req, res) => {
  try {
    const pool = await getPool();
    const { make, model, category } = req.query;

    if (!make && !model) {
      return res.status(400).json({ error: 'At least make or model is required' });
    }

    const req2 = pool.request();
    const conditions = [];
    if (make)     { req2.input('make', sql.NVarChar(50),  make);     conditions.push('vf.make = @make'); }
    if (model)    { req2.input('model', sql.NVarChar(100), model);   conditions.push('vf.model = @model'); }
    if (category) { req2.input('cat',  sql.NVarChar(50),  category); conditions.push('vf.category = @cat'); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    // Fetch fitment rows
    const fitRes = await req2.query(`
      SELECT id, make, model, variant, year_from, year_to, category, tire_size
      FROM vehicle_fitments vf
      ${where}
      ORDER BY make, model, year_from, variant
    `);

    if (fitRes.recordset.length === 0) {
      return res.json({ fitments: [], catalogMatches: {} });
    }

    // Collect all distinct sizes from the results
    const sizes = [...new Set(fitRes.recordset.map(r => r.tire_size))];

    // For each size, find matching catalog entries
    const catalogMatches = {};
    for (const size of sizes) {
      const catReq = pool.request().input('size', sql.NVarChar(50), size);
      const catRes = await catReq.query(`
        SELECT id, brand, model AS tire_model, size, pattern, load_index, speed_index, tire_type
        FROM tire_catalog
        WHERE size = @size
        ORDER BY brand, model
      `);
      catalogMatches[size] = catRes.recordset;
    }

    res.json({ fitments: fitRes.recordset, catalogMatches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
