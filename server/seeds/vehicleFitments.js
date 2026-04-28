'use strict';
/**
 * Pakistan-market vehicle → OEM tyre fitment data.
 * Sources: general knowledge + GTR catalogue reference sizes.
 * Categories: Passenger, SUV, Pickup, Van, Commercial
 */

const FITMENTS = [
  // ── Toyota ────────────────────────────────────────────────────────────────
  { make: 'Toyota', model: 'Corolla',            variant: 'XLi / GLi 1.3',          year_from: 2014, year_to: 2021, category: 'Passenger', tire_size: '185/65R15' },
  { make: 'Toyota', model: 'Corolla',            variant: 'Altis 1.6',               year_from: 2014, year_to: 2021, category: 'Passenger', tire_size: '195/65R15' },
  { make: 'Toyota', model: 'Corolla',            variant: 'Altis X 1.6',             year_from: 2021, year_to: null, category: 'Passenger', tire_size: '205/55R16' },
  { make: 'Toyota', model: 'Yaris',              variant: 'ATIV 1.0',                year_from: 2020, year_to: null, category: 'Passenger', tire_size: '175/65R14' },
  { make: 'Toyota', model: 'Yaris',              variant: 'ATIV 1.3',                year_from: 2020, year_to: null, category: 'Passenger', tire_size: '185/65R15' },
  { make: 'Toyota', model: 'Yaris',              variant: 'ATIV CVT 1.5 / 1.5 GLi', year_from: 2020, year_to: null, category: 'Passenger', tire_size: '195/60R15' },
  { make: 'Toyota', model: 'Hilux Revo',         variant: 'Single / Extra Cab',      year_from: 2016, year_to: null, category: 'Pickup',    tire_size: '265/65R17' },
  { make: 'Toyota', model: 'Hilux Revo',         variant: 'Double Cab GR-S',         year_from: 2020, year_to: null, category: 'Pickup',    tire_size: '265/60R18' },
  { make: 'Toyota', model: 'Hilux Vigo',         variant: 'All Variants',            year_from: 2005, year_to: 2015, category: 'Pickup',    tire_size: '265/65R17' },
  { make: 'Toyota', model: 'Fortuner',           variant: '2.7 VVTi',                year_from: 2016, year_to: null, category: 'SUV',       tire_size: '265/65R17' },
  { make: 'Toyota', model: 'Fortuner',           variant: '2.8 Legender / Sigma 4',  year_from: 2020, year_to: null, category: 'SUV',       tire_size: '265/60R18' },
  { make: 'Toyota', model: 'Land Cruiser Prado', variant: 'All Variants',            year_from: 2018, year_to: null, category: 'SUV',       tire_size: '265/65R17' },
  { make: 'Toyota', model: 'Land Cruiser 200',   variant: 'All Variants',            year_from: 2008, year_to: 2021, category: 'SUV',       tire_size: '285/60R18' },
  { make: 'Toyota', model: 'Land Cruiser 300',   variant: 'All Variants',            year_from: 2021, year_to: null, category: 'SUV',       tire_size: '265/60R20' },
  { make: 'Toyota', model: 'Rush',               variant: 'G / S',                   year_from: 2019, year_to: null, category: 'SUV',       tire_size: '215/65R16' },
  { make: 'Toyota', model: 'Prius',              variant: 'Alpha S / G',             year_from: 2015, year_to: null, category: 'Passenger', tire_size: '215/55R17' },
  { make: 'Toyota', model: 'Hiace',              variant: 'Grand Cabin / Commuter',  year_from: 2010, year_to: null, category: 'Van',       tire_size: '215/65R16' },

  // ── Honda ─────────────────────────────────────────────────────────────────
  { make: 'Honda', model: 'Civic',   variant: '1.5 VTEC Turbo Oriel',      year_from: 2016, year_to: 2022, category: 'Passenger', tire_size: '215/55R16' },
  { make: 'Honda', model: 'Civic',   variant: '1.5 VTEC Turbo RS',         year_from: 2019, year_to: 2022, category: 'Passenger', tire_size: '225/45R17' },
  { make: 'Honda', model: 'Civic',   variant: '1.5 eHEV / 2.0 RS e:HEV',  year_from: 2022, year_to: null, category: 'Passenger', tire_size: '235/40R18' },
  { make: 'Honda', model: 'City',    variant: '1.2 Aspire',                year_from: 2021, year_to: null, category: 'Passenger', tire_size: '185/60R15' },
  { make: 'Honda', model: 'City',    variant: '1.5 RS',                    year_from: 2021, year_to: null, category: 'Passenger', tire_size: '195/55R16' },
  { make: 'Honda', model: 'City',    variant: '1.3 / 1.5 (5th Gen)',       year_from: 2009, year_to: 2021, category: 'Passenger', tire_size: '185/65R15' },
  { make: 'Honda', model: 'BR-V',    variant: 'i-VTEC Oriel',              year_from: 2017, year_to: 2023, category: 'SUV',       tire_size: '205/65R15' },
  { make: 'Honda', model: 'HR-V',    variant: 'All Variants',              year_from: 2022, year_to: null, category: 'SUV',       tire_size: '225/50R17' },
  { make: 'Honda', model: 'Accord',  variant: 'All Variants',              year_from: 2016, year_to: 2022, category: 'Passenger', tire_size: '225/50R17' },

  // ── Suzuki ────────────────────────────────────────────────────────────────
  { make: 'Suzuki', model: 'Alto',    variant: 'VX',               year_from: 2019, year_to: null, category: 'Passenger',  tire_size: '145/80R13' },
  { make: 'Suzuki', model: 'Alto',    variant: 'VXL / VXR / AGS',  year_from: 2019, year_to: null, category: 'Passenger',  tire_size: '155/70R13' },
  { make: 'Suzuki', model: 'Cultus',  variant: 'VXL / AGS',        year_from: 2017, year_to: null, category: 'Passenger',  tire_size: '175/65R14' },
  { make: 'Suzuki', model: 'Swift',   variant: 'GL / GLX',         year_from: 2021, year_to: null, category: 'Passenger',  tire_size: '185/55R16' },
  { make: 'Suzuki', model: 'Wagon R', variant: 'VXL / AGS',        year_from: 2014, year_to: null, category: 'Passenger',  tire_size: '165/70R14' },
  { make: 'Suzuki', model: 'Jimny',   variant: 'All Variants',      year_from: 2019, year_to: null, category: 'SUV',        tire_size: '195/80R15' },
  { make: 'Suzuki', model: 'Vitara',  variant: 'All Variants',      year_from: 2019, year_to: null, category: 'SUV',        tire_size: '215/55R17' },
  { make: 'Suzuki', model: 'Ravi',    variant: 'Pickup',            year_from: 2010, year_to: null, category: 'Commercial', tire_size: '155R13C'   },
  { make: 'Suzuki', model: 'Bolan',   variant: 'Van',               year_from: 2010, year_to: null, category: 'Van',        tire_size: '155/70R13' },
  { make: 'Suzuki', model: 'Every',   variant: 'All Variants',      year_from: 2014, year_to: null, category: 'Van',        tire_size: '155/70R13' },
  { make: 'Suzuki', model: 'Liana',   variant: 'RXi / LXi',        year_from: 2006, year_to: 2015, category: 'Passenger',  tire_size: '185/65R14' },

  // ── Hyundai ───────────────────────────────────────────────────────────────
  { make: 'Hyundai', model: 'Tucson',        variant: 'FWD Active / GLS',    year_from: 2021, year_to: null, category: 'SUV',       tire_size: '215/60R17' },
  { make: 'Hyundai', model: 'Tucson',        variant: 'AWD Ultimate',         year_from: 2021, year_to: null, category: 'SUV',       tire_size: '235/55R18' },
  { make: 'Hyundai', model: 'Elantra',       variant: 'GLS',                  year_from: 2021, year_to: null, category: 'Passenger', tire_size: '225/45R17' },
  { make: 'Hyundai', model: 'Sonata',        variant: 'All Variants',         year_from: 2015, year_to: null, category: 'Passenger', tire_size: '225/50R17' },
  { make: 'Hyundai', model: 'Grand Starex',  variant: 'Wagon / H-1',          year_from: 2018, year_to: null, category: 'Van',       tire_size: '215/65R16' },
  { make: 'Hyundai', model: 'Porter',        variant: 'All Variants',         year_from: 2018, year_to: null, category: 'Commercial', tire_size: '185R14C'  },

  // ── KIA ───────────────────────────────────────────────────────────────────
  { make: 'KIA', model: 'Sportage', variant: 'Alpha / FWD',   year_from: 2021, year_to: null, category: 'SUV',       tire_size: '225/60R17' },
  { make: 'KIA', model: 'Sportage', variant: 'AWD',           year_from: 2021, year_to: null, category: 'SUV',       tire_size: '235/55R18' },
  { make: 'KIA', model: 'Picanto',  variant: 'All Variants',  year_from: 2017, year_to: null, category: 'Passenger', tire_size: '165/65R14' },
  { make: 'KIA', model: 'Stonic',   variant: 'All Variants',  year_from: 2020, year_to: null, category: 'SUV',       tire_size: '205/60R16' },
  { make: 'KIA', model: 'Sorento',  variant: 'All Variants',  year_from: 2021, year_to: null, category: 'SUV',       tire_size: '235/65R17' },
  { make: 'KIA', model: 'Carnival', variant: 'All Variants',  year_from: 2022, year_to: null, category: 'Van',       tire_size: '235/60R18' },

  // ── Changan ───────────────────────────────────────────────────────────────
  { make: 'Changan', model: 'Alsvin',    variant: 'Comfort / Lumiere',    year_from: 2020, year_to: null, category: 'Passenger', tire_size: '195/55R16' },
  { make: 'Changan', model: 'Karvaan',   variant: 'MPV',                  year_from: 2019, year_to: null, category: 'Van',       tire_size: '195/65R15' },
  { make: 'Changan', model: 'Oshan X7',  variant: 'All Variants',         year_from: 2021, year_to: null, category: 'SUV',       tire_size: '235/55R18' },
  { make: 'Changan', model: 'Uni-T',     variant: 'All Variants',         year_from: 2021, year_to: null, category: 'SUV',       tire_size: '215/55R17' },
  { make: 'Changan', model: 'M9',        variant: 'Pickup',               year_from: 2020, year_to: null, category: 'Commercial', tire_size: '195/65R15' },

  // ── MG ────────────────────────────────────────────────────────────────────
  { make: 'MG', model: 'HS',      variant: '1.5 Turbo / 2.0 Turbo',  year_from: 2020, year_to: null, category: 'SUV',       tire_size: '235/50R18' },
  { make: 'MG', model: 'HS PHEV', variant: 'All Variants',            year_from: 2022, year_to: null, category: 'SUV',       tire_size: '245/45R19' },
  { make: 'MG', model: 'ZS',      variant: 'All Variants',            year_from: 2020, year_to: null, category: 'SUV',       tire_size: '215/55R17' },
  { make: 'MG', model: '5',       variant: 'All Variants',            year_from: 2021, year_to: null, category: 'Passenger', tire_size: '215/55R17' },
  { make: 'MG', model: 'RX5',     variant: 'All Variants',            year_from: 2023, year_to: null, category: 'SUV',       tire_size: '235/55R18' },

  // ── Proton ────────────────────────────────────────────────────────────────
  { make: 'Proton', model: 'Saga',  variant: 'Standard / Premium',  year_from: 2021, year_to: null, category: 'Passenger', tire_size: '185/60R15' },
  { make: 'Proton', model: 'X50',   variant: 'All Variants',        year_from: 2022, year_to: null, category: 'SUV',       tire_size: '215/55R17' },
  { make: 'Proton', model: 'X70',   variant: 'All Variants',        year_from: 2022, year_to: null, category: 'SUV',       tire_size: '235/50R18' },

  // ── Haval ─────────────────────────────────────────────────────────────────
  { make: 'Haval', model: 'H6',     variant: 'All Variants',  year_from: 2021, year_to: null, category: 'SUV', tire_size: '225/55R18' },
  { make: 'Haval', model: 'Jolion', variant: 'All Variants',  year_from: 2021, year_to: null, category: 'SUV', tire_size: '215/55R17' },

  // ── Prince / DFSK ─────────────────────────────────────────────────────────
  { make: 'Prince', model: 'Pearl', variant: 'All Variants',  year_from: 2019, year_to: null, category: 'Passenger',  tire_size: '155/70R13' },
  { make: 'Prince', model: 'Star',  variant: 'Pickup',        year_from: 2021, year_to: null, category: 'Commercial', tire_size: '165/70R13' },

  // ── FAW ───────────────────────────────────────────────────────────────────
  { make: 'FAW', model: 'V2',     variant: 'Carrier Plus',  year_from: 2012, year_to: 2022, category: 'Passenger', tire_size: '185/65R15' },
  { make: 'FAW', model: 'Sirius', variant: 'All Variants',  year_from: 2012, year_to: 2020, category: 'Passenger', tire_size: '185/65R15' },

  // ── Daihatsu (imported/used) ───────────────────────────────────────────────
  { make: 'Daihatsu', model: 'Mira',  variant: 'All Variants',  year_from: 2012, year_to: null, category: 'Passenger', tire_size: '155/65R13' },
  { make: 'Daihatsu', model: 'Move',  variant: 'All Variants',  year_from: 2012, year_to: null, category: 'Passenger', tire_size: '155/65R13' },
  { make: 'Daihatsu', model: 'Copen', variant: 'All Variants',  year_from: 2014, year_to: null, category: 'Passenger', tire_size: '165/50R15' },

  // ── Nissan (imported/CBU) ──────────────────────────────────────────────────
  { make: 'Nissan', model: 'Navara',   variant: 'All Variants',  year_from: 2014, year_to: null, category: 'Pickup', tire_size: '265/65R17' },
  { make: 'Nissan', model: 'Patrol',   variant: 'Y62',           year_from: 2012, year_to: null, category: 'SUV',    tire_size: '285/60R18' },
  { make: 'Nissan', model: 'X-Trail',  variant: 'All Variants',  year_from: 2014, year_to: null, category: 'SUV',    tire_size: '225/60R17' },

  // ── Mitsubishi (imported/CBU) ──────────────────────────────────────────────
  { make: 'Mitsubishi', model: 'L200 Triton', variant: 'All Variants',  year_from: 2016, year_to: null, category: 'Pickup', tire_size: '265/60R18' },
  { make: 'Mitsubishi', model: 'Pajero',      variant: 'All Variants',  year_from: 2010, year_to: null, category: 'SUV',    tire_size: '265/65R17' },
  { make: 'Mitsubishi', model: 'Outlander',   variant: 'All Variants',  year_from: 2018, year_to: null, category: 'SUV',    tire_size: '225/55R18' },

  // ── BAIC ──────────────────────────────────────────────────────────────────
  { make: 'BAIC', model: 'BJ40',  variant: 'All Variants',  year_from: 2021, year_to: null, category: 'SUV', tire_size: '235/75R15' },

  // ── Isuzu ─────────────────────────────────────────────────────────────────
  { make: 'Isuzu', model: 'D-Max',     variant: 'All Variants',  year_from: 2017, year_to: null, category: 'Pickup',     tire_size: '265/65R17' },
  { make: 'Isuzu', model: 'NKR (Bus)', variant: 'All Variants',  year_from: 2015, year_to: null, category: 'Commercial', tire_size: '7.00R16'   },
];

/**
 * Seeds vehicle_fitments table.
 * Uses MERGE so it is safe to run on every restart — skips existing rows.
 */
async function seedVehicleFitments(dbPool, sql) {
  let added = 0;
  for (const f of FITMENTS) {
    const result = await dbPool.request()
      .input('make',      sql.NVarChar(50),  f.make)
      .input('model',     sql.NVarChar(100), f.model)
      .input('variant',   sql.NVarChar(100), f.variant)
      .input('year_from', sql.SmallInt,      f.year_from)
      .input('year_to',   sql.SmallInt,      f.year_to ?? null)
      .input('category',  sql.NVarChar(50),  f.category)
      .input('tire_size', sql.NVarChar(50),  f.tire_size)
      .query(`
        MERGE vehicle_fitments AS tgt
        USING (SELECT @make AS make, @model AS model, @variant AS variant,
                      @year_from AS year_from, @tire_size AS tire_size) AS src
          ON tgt.make = src.make AND tgt.model = src.model
         AND tgt.variant = src.variant AND tgt.year_from = src.year_from
         AND tgt.tire_size = src.tire_size
        WHEN NOT MATCHED THEN
          INSERT (make, model, variant, year_from, year_to, category, tire_size)
          VALUES (@make, @model, @variant, @year_from, @year_to, @category, @tire_size);
        SELECT @@ROWCOUNT AS affected;
      `);
    added += result.recordset[0]?.affected || 0;
  }
  if (added > 0) console.log(`✅ Vehicle fitments seeded: ${added} new rows`);
}

module.exports = { seedVehicleFitments };
