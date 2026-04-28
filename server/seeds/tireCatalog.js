'use strict';

/* ─── Common tire sizes → [load_index, speed_index] ───────────────────────── */
const SZ = {
  // 12"
  '145/70R12': ['69', 'T'], '155/70R12': ['73', 'T'], '165/70R12': ['77', 'T'],
  // 13"
  '145/70R13': ['71', 'T'], '155/65R13': ['73', 'T'], '155/70R13': ['75', 'T'],
  '165/60R13': ['73', 'H'], '165/65R13': ['77', 'T'], '165/70R13': ['79', 'T'],
  '175/60R13': ['77', 'H'], '175/65R13': ['80', 'T'], '175/70R13': ['82', 'T'],
  '185/65R13': ['84', 'H'], '185/70R13': ['86', 'H'],
  // 14"
  '165/60R14': ['75', 'H'], '165/65R14': ['79', 'T'], '165/70R14': ['81', 'T'],
  '175/60R14': ['79', 'H'], '175/65R14': ['82', 'H'], '175/70R14': ['84', 'T'],
  '185/60R14': ['82', 'H'], '185/65R14': ['86', 'H'], '185/70R14': ['88', 'H'],
  '195/60R14': ['86', 'H'], '195/65R14': ['89', 'H'],
  // 15"
  '185/55R15': ['82', 'V'], '185/60R15': ['84', 'H'], '185/65R15': ['88', 'H'],
  '185/70R15': ['89', 'H'],
  '195/50R15': ['82', 'V'], '195/55R15': ['85', 'H'], '195/60R15': ['88', 'H'],
  '195/65R15': ['91', 'H'], '195/70R15': ['97', 'T'],
  '205/60R15': ['91', 'H'], '205/65R15': ['94', 'H'], '205/70R15': ['96', 'H'],
  '215/65R15': ['96', 'H'], '215/70R15': ['98', 'H'],
  '225/60R15': ['96', 'H'], '225/70R15': ['100', 'H'],
  '235/75R15': ['105', 'S'],
  // 16"
  '195/50R16': ['84', 'V'], '195/55R16': ['87', 'V'],
  '205/55R16': ['91', 'H'], '205/60R16': ['92', 'H'], '205/65R16': ['95', 'H'],
  '215/55R16': ['93', 'H'], '215/60R16': ['95', 'H'], '215/65R16': ['98', 'H'],
  '215/70R16': ['100', 'H'],
  '225/55R16': ['95', 'V'], '225/60R16': ['98', 'H'], '225/65R16': ['100', 'H'],
  '225/70R16': ['103', 'H'], '225/75R16': ['108', 'S'],
  '235/60R16': ['100', 'H'], '235/65R16': ['103', 'H'],
  '245/70R16': ['107', 'H'],
  '265/70R16': ['112', 'H'], '265/75R16': ['116', 'H'],
  '285/75R16': ['122', 'R'],
  // 17"
  '205/50R17': ['93', 'V'],
  '215/45R17': ['91', 'W'], '215/50R17': ['95', 'V'], '215/55R17': ['94', 'V'],
  '225/45R17': ['91', 'W'], '225/50R17': ['98', 'Y'], '225/55R17': ['97', 'H'],
  '225/60R17': ['99', 'H'], '225/65R17': ['102', 'H'],
  '235/45R17': ['94', 'Y'], '235/50R17': ['96', 'V'], '235/55R17': ['99', 'H'],
  '235/60R17': ['102', 'H'], '235/65R17': ['108', 'H'],
  '245/40R17': ['91', 'W'], '245/45R17': ['99', 'Y'], '245/65R17': ['111', 'H'],
  '255/60R17': ['106', 'H'], '255/65R17': ['110', 'H'],
  '265/65R17': ['112', 'H'], '265/70R17': ['115', 'H'],
  '275/55R17': ['109', 'H'], '275/65R17': ['115', 'H'],
  '285/65R17': ['116', 'H'],
  '315/70R17': ['121', 'S'],
  // 18"
  '225/40R18': ['88', 'Y'], '225/45R18': ['95', 'Y'],
  '235/40R18': ['91', 'Y'], '235/50R18': ['97', 'V'], '235/55R18': ['100', 'H'],
  '245/40R18': ['93', 'Y'], '245/45R18': ['100', 'Y'],
  '255/35R18': ['94', 'Y'], '255/40R18': ['95', 'Y'], '255/45R18': ['99', 'V'],
  '265/60R18': ['110', 'H'], '265/65R18': ['114', 'H'],
  '275/60R18': ['113', 'H'], '275/65R18': ['116', 'H'],
  '275/70R18': ['125', 'S'],
  '285/60R18': ['116', 'H'], '285/65R18': ['125', 'S'],
  '295/70R18': ['129', 'S'],
  // 19"
  '235/35R19': ['91', 'Y'],
  '245/35R19': ['89', 'Y'], '245/40R19': ['94', 'Y'],
  '255/35R19': ['92', 'Y'], '255/50R19': ['103', 'V'],
  '265/35R19': ['94', 'Y'], '265/50R19': ['110', 'V'],
  '275/40R19': ['105', 'Y'], '275/45R19': ['108', 'Y'],
  // 20"
  '245/35R20': ['91', 'Y'],
  '255/45R20': ['101', 'V'],
  '265/35R20': ['99', 'Y'], '265/50R20': ['107', 'V'],
  '275/35R20': ['102', 'Y'], '275/40R20': ['106', 'Y'], '275/55R20': ['117', 'H'],
  '285/50R20': ['112', 'V'],
  '295/30R20': ['97', 'Y'], '295/45R20': ['114', 'V'],
  // 21"
  '295/25R21': ['92', 'Y'], '305/30R21': ['104', 'Y'],
};

/* Helper: look up load/speed index from SZ table */
function sz(...keys) {
  return keys.map(k => {
    const [load_index = '', speed_index = ''] = SZ[k] || [];
    return { size: k, load_index, speed_index };
  });
}

/* ─── Brand / model catalog ────────────────────────────────────────────────── */
const BRANDS = [
  /* ── INTERNATIONAL BRANDS ── */
  {
    brand: 'Bridgestone',
    models: [
      { model: 'Ecopia EP150',    pattern: 'Ecopia',   type: 'Passenger',   sizes: sz('155/65R13','165/65R13','175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: 'Ecopia EP300',    pattern: 'Ecopia',   type: 'Passenger',   sizes: sz('185/65R15','195/65R15','205/55R16','205/60R16','215/60R16','215/55R17') },
      { model: 'Turanza T005',    pattern: 'Turanza',  type: 'Passenger',   sizes: sz('185/60R15','195/55R16','205/55R16','215/55R17','225/45R17','225/50R17','235/45R17') },
      { model: 'Turanza T001',    pattern: 'Turanza',  type: 'Passenger',   sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: 'Potenza Sport',   pattern: 'Potenza',  type: 'Performance', sizes: sz('225/45R17','235/45R17','245/40R18','255/40R18','255/35R19','275/35R19') },
      { model: 'Potenza RE003',   pattern: 'Potenza',  type: 'Performance', sizes: sz('205/55R16','215/55R17','225/45R17','235/45R17','245/40R18') },
      { model: 'Alenza Sport',    pattern: 'Alenza',   type: 'SUV',         sizes: sz('225/60R17','235/55R17','235/60R17','265/65R17','265/60R18','275/55R20') },
      { model: 'Dueler H/T 684',  pattern: 'Dueler',   type: '4x4',         sizes: sz('215/65R16','225/65R17','235/60R17','265/60R18','265/65R17','275/65R17') },
      { model: 'Dueler A/T 001',  pattern: 'Dueler',   type: '4x4',         sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17','285/65R17') },
    ],
  },
  {
    brand: 'Michelin',
    models: [
      { model: 'Energy XM2+',         pattern: 'Energy',       type: 'Passenger',   sizes: sz('155/65R13','165/65R13','175/65R14','185/60R14','185/65R14','185/65R15','195/65R15','205/65R15') },
      { model: 'Primacy 4',           pattern: 'Primacy',      type: 'Passenger',   sizes: sz('185/60R15','195/55R16','205/55R16','215/55R17','225/45R17','225/50R17','235/45R17') },
      { model: 'Primacy MXV4',        pattern: 'Primacy',      type: 'Passenger',   sizes: sz('205/60R16','215/60R16','225/60R16','225/55R17','235/55R17','235/60R17') },
      { model: 'Pilot Sport 4',       pattern: 'Pilot Sport',  type: 'Performance', sizes: sz('225/40R18','245/40R18','245/35R19','255/35R19','275/35R19') },
      { model: 'Pilot Sport 4S',      pattern: 'Pilot Sport',  type: 'Performance', sizes: sz('225/40R18','245/35R19','265/35R20','275/35R20','295/30R20') },
      { model: 'Latitude Tour HP',    pattern: 'Latitude',     type: 'SUV',         sizes: sz('225/60R17','235/65R17','255/55R18','255/50R19','265/50R19') },
      { model: 'CrossClimate 2',      pattern: 'CrossClimate', type: 'Passenger',   sizes: sz('195/65R15','205/55R16','215/55R17','225/45R17','235/45R17') },
      { model: 'Defender T+H',        pattern: 'Defender',     type: 'Passenger',   sizes: sz('185/65R15','195/65R15','205/65R15','215/60R16','225/60R16') },
    ],
  },
  {
    brand: 'Goodyear',
    models: [
      { model: 'Assurance TripleMax 2',     pattern: 'Assurance',     type: 'Passenger',   sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16','215/60R16') },
      { model: 'Assurance MaxGuard',        pattern: 'Assurance',     type: 'Passenger',   sizes: sz('185/65R15','195/65R15','205/65R15','205/60R16','215/60R16') },
      { model: 'EfficientGrip Performance', pattern: 'EfficientGrip', type: 'Passenger',   sizes: sz('195/55R16','205/55R16','215/55R17','225/45R17','225/50R17','235/45R17','245/40R18') },
      { model: 'Eagle F1 Asymmetric 5',    pattern: 'Eagle F1',      type: 'Performance', sizes: sz('225/40R18','245/40R18','255/35R19','275/35R19','275/40R20') },
      { model: 'Wrangler AT Adventure',    pattern: 'Wrangler',      type: '4x4',         sizes: sz('215/65R16','225/70R16','235/60R17','265/65R17','265/70R17','275/65R17') },
      { model: 'Wrangler HP All Weather',  pattern: 'Wrangler',      type: '4x4',         sizes: sz('215/65R16','235/65R17','265/65R17','265/60R18','275/55R20') },
    ],
  },
  {
    brand: 'Continental',
    models: [
      { model: 'ComfortContact CC6',  pattern: 'ComfortContact',  type: 'Passenger',   sizes: sz('175/65R14','185/60R15','185/65R15','195/65R15','205/65R15','205/55R16','205/60R16') },
      { model: 'UltraContact UC6',    pattern: 'UltraContact',    type: 'Passenger',   sizes: sz('185/65R15','195/65R15','205/55R16','215/55R17','225/50R17','225/45R17') },
      { model: 'PremiumContact 6',    pattern: 'PremiumContact',  type: 'Passenger',   sizes: sz('205/55R16','215/55R17','225/45R17','225/50R17','235/45R17','245/40R18') },
      { model: 'SportContact 7',      pattern: 'SportContact',    type: 'Performance', sizes: sz('225/40R18','245/35R19','255/35R19','275/35R19','295/30R20') },
      { model: 'CrossContact ATR',    pattern: 'CrossContact',    type: '4x4',         sizes: sz('215/65R16','225/60R17','235/60R18','265/60R18','275/55R20') },
      { model: 'CrossContact H/T',    pattern: 'CrossContact',    type: '4x4',         sizes: sz('215/65R16','225/65R17','235/65R17','265/65R17','265/60R18') },
    ],
  },
  {
    brand: 'Pirelli',
    models: [
      { model: 'Cinturato P7',             pattern: 'Cinturato',  type: 'Passenger',   sizes: sz('185/65R15','195/55R16','205/55R16','215/55R17','225/45R17','225/50R17','235/45R17') },
      { model: 'P Zero',                   pattern: 'P Zero',     type: 'Performance', sizes: sz('225/40R18','245/40R18','245/35R19','265/35R20','275/30R20','295/25R21') },
      { model: 'P Zero PZ4',              pattern: 'P Zero',     type: 'Performance', sizes: sz('225/40R18','245/35R19','255/35R19','275/35R19','305/30R21') },
      { model: 'Scorpion Verde',           pattern: 'Scorpion',   type: 'SUV',         sizes: sz('215/65R16','225/60R17','235/55R17','255/55R18','265/50R19','275/55R20') },
      { model: 'Scorpion All Terrain Plus',pattern: 'Scorpion',   type: '4x4',         sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17','285/65R17') },
      { model: 'Cinturato All Season SF2', pattern: 'Cinturato',  type: 'Passenger',   sizes: sz('195/65R15','205/55R16','225/45R17','235/45R17') },
    ],
  },
  {
    brand: 'Hankook',
    models: [
      { model: 'Kinergy Eco 2 K435', pattern: 'Kinergy',  type: 'Passenger',   sizes: sz('155/65R13','165/65R13','175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: 'Kinergy GT H436',    pattern: 'Kinergy',  type: 'Passenger',   sizes: sz('195/65R15','205/55R16','215/55R17','225/45R17','225/50R17','235/45R17') },
      { model: 'Optimo K715',        pattern: 'Optimo',   type: 'Passenger',   sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15') },
      { model: 'Ventus V12 evo2',    pattern: 'Ventus',   type: 'Performance', sizes: sz('205/55R16','215/55R17','225/45R17','225/50R17','245/40R18','255/35R19') },
      { model: 'Dynapro HP2',        pattern: 'Dynapro',  type: 'SUV',         sizes: sz('215/65R16','225/60R17','235/60R17','265/65R17','265/60R18','275/55R20') },
      { model: 'Dynapro AT2',        pattern: 'Dynapro',  type: '4x4',         sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17','285/65R17') },
    ],
  },
  {
    brand: 'Yokohama',
    models: [
      { model: 'BluEarth AE01',      pattern: 'BluEarth',  type: 'Passenger',   sizes: sz('165/65R14','175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: 'BluEarth GT AE51',   pattern: 'BluEarth',  type: 'Passenger',   sizes: sz('185/60R15','195/55R16','205/55R16','215/55R17','225/45R17','225/50R17') },
      { model: 'Advan Sport V105',   pattern: 'Advan',     type: 'Performance', sizes: sz('225/40R18','245/40R18','255/35R19','265/35R19','275/35R19') },
      { model: 'Advan Fleva V701',   pattern: 'Advan',     type: 'Performance', sizes: sz('205/55R16','215/55R17','225/45R17','235/45R17','245/40R18') },
      { model: 'Geolandar A/T G015', pattern: 'Geolandar', type: '4x4',         sizes: sz('215/70R16','225/70R16','235/60R17','265/65R17','265/70R17','275/65R17') },
      { model: 'Geolandar H/T G056', pattern: 'Geolandar', type: '4x4',         sizes: sz('215/65R16','225/65R17','235/65R17','265/65R17','265/60R18','275/55R20') },
    ],
  },
  {
    brand: 'Toyo Tires',
    models: [
      { model: 'NanoEnergy 3',       pattern: 'NanoEnergy',  type: 'Passenger',   sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: 'Proxes CF2',         pattern: 'Proxes',      type: 'Passenger',   sizes: sz('185/65R15','195/65R15','205/65R15','205/55R16','215/55R17','225/50R17') },
      { model: 'Proxes T1 Sport',    pattern: 'Proxes',      type: 'Performance', sizes: sz('205/55R16','225/45R17','235/45R17','245/40R18','255/35R19') },
      { model: 'Open Country A/T+',  pattern: 'Open Country',type: '4x4',         sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17','285/65R17') },
      { model: 'Open Country H/T',   pattern: 'Open Country',type: '4x4',         sizes: sz('215/65R16','225/65R17','235/65R17','265/65R17','265/60R18','275/55R20') },
    ],
  },
  {
    brand: 'Kumho',
    models: [
      { model: 'Solus KH17',         pattern: 'Solus',       type: 'Passenger',   sizes: sz('155/65R13','165/65R13','175/65R14','185/65R14','185/65R15','195/65R15') },
      { model: 'Solus HA31',         pattern: 'Solus',       type: 'Passenger',   sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16','215/55R17') },
      { model: 'Ecsta PS71',         pattern: 'Ecsta',       type: 'Performance', sizes: sz('205/55R16','215/55R17','225/45R17','235/45R17','245/40R18','255/35R19') },
      { model: 'Ecsta HS51',         pattern: 'Ecsta',       type: 'Performance', sizes: sz('195/55R16','205/55R16','215/55R17','225/45R17','235/45R17') },
      { model: 'Road Venture AT51',  pattern: 'Road Venture',type: '4x4',         sizes: sz('215/65R16','225/70R16','235/60R17','265/65R17','265/70R17','285/65R17') },
    ],
  },
  {
    brand: 'Nexen',
    models: [
      { model: "N'Blue HD Plus",     pattern: 'N\'Blue',  type: 'Passenger',   sizes: sz('165/65R13','175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: "N'Blue 4Season",     pattern: 'N\'Blue',  type: 'Passenger',   sizes: sz('185/65R15','195/65R15','205/55R16','215/55R17','225/45R17') },
      { model: "N'Fera Sport",       pattern: 'N\'Fera',  type: 'Performance', sizes: sz('205/55R16','215/55R17','225/45R17','235/45R17','245/40R18','255/35R19') },
      { model: "N'Fera SU1",         pattern: 'N\'Fera',  type: 'Performance', sizes: sz('195/55R16','205/55R16','215/55R17','225/45R17','235/45R17') },
      { model: 'Roadian HTX',        pattern: 'Roadian',  type: '4x4',         sizes: sz('215/65R16','225/65R17','235/65R17','265/65R17','265/70R17') },
      { model: 'Roadian AT 4x4',     pattern: 'Roadian',  type: '4x4',         sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17') },
    ],
  },
  {
    brand: 'Falken',
    models: [
      { model: 'Sincera SN832i',     pattern: 'Sincera',   type: 'Passenger',   sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: 'Ziex ZE960',         pattern: 'Ziex',      type: 'Passenger',   sizes: sz('195/55R16','205/55R16','215/55R17','225/45R17','235/45R17') },
      { model: 'Azenis FK520',       pattern: 'Azenis',    type: 'Performance', sizes: sz('225/45R17','235/45R17','245/40R18','255/35R19','275/35R19') },
      { model: 'Wildpeak AT3W',      pattern: 'Wildpeak',  type: '4x4',         sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17','285/65R17') },
    ],
  },
  {
    brand: 'GT Radial',
    models: [
      { model: 'Champiro BXT Pro',   pattern: 'Champiro',  type: 'Passenger',   sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: 'Champiro FE1',       pattern: 'Champiro',  type: 'Passenger',   sizes: sz('185/55R15','195/55R16','205/55R16','215/55R17','225/45R17') },
      { model: 'Champiro VP1',       pattern: 'Champiro',  type: 'Passenger',   sizes: sz('165/65R13','175/65R14','185/65R14','185/65R15','195/65R15') },
      { model: 'Savero HT2',         pattern: 'Savero',    type: '4x4',         sizes: sz('215/65R16','225/65R17','235/65R17','265/65R17','265/70R17') },
      { model: 'Maxtour LX',         pattern: 'Maxtour',   type: 'Passenger',   sizes: sz('195/65R15','205/55R16','215/55R17','225/50R17','225/45R17') },
    ],
  },
  {
    brand: 'Sailun',
    models: [
      { model: 'Atrezzo Elite',      pattern: 'Atrezzo',   type: 'Passenger',   sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: 'Atrezzo 4Seasons',   pattern: 'Atrezzo',   type: 'Passenger',   sizes: sz('185/65R15','195/65R15','205/55R16','215/55R17','225/45R17') },
      { model: 'Inspire',            pattern: 'Inspire',   type: 'Passenger',   sizes: sz('205/55R16','215/55R17','225/45R17','225/50R17','235/45R17') },
      { model: 'Terramax HT',        pattern: 'Terramax',  type: '4x4',         sizes: sz('215/65R16','225/65R17','235/65R17','265/65R17','275/65R17') },
      { model: 'Terramax AT',        pattern: 'Terramax',  type: '4x4',         sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17') },
    ],
  },
  {
    brand: 'Maxxis',
    models: [
      { model: 'Mecotra ME3',        pattern: 'Mecotra',   type: 'Passenger',   sizes: sz('155/65R13','165/65R13','175/65R14','185/65R14','185/65R15','195/65R15') },
      { model: 'Premitra HP5',       pattern: 'Premitra',  type: 'Passenger',   sizes: sz('175/65R14','185/65R15','195/65R15','205/65R15','205/55R16','215/55R17') },
      { model: 'Victra MA-Z4S',      pattern: 'Victra',    type: 'Performance', sizes: sz('205/55R16','215/55R17','225/45R17','235/45R17','245/40R18','255/35R19') },
      { model: 'Bravo AT-771',       pattern: 'Bravo',     type: '4x4',         sizes: sz('215/65R16','225/75R16','235/75R15','265/65R17','265/70R17','285/75R16') },
      { model: 'AT-811 Bravo',       pattern: 'Bravo',     type: '4x4',         sizes: sz('215/65R16','225/70R16','235/60R17','265/65R17','265/70R17') },
    ],
  },
  {
    brand: 'Giti',
    models: [
      { model: 'GitiComfort 228v1',  pattern: 'GitiComfort', type: 'Passenger', sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: 'GitiComfort SUV520', pattern: 'GitiComfort', type: 'SUV',       sizes: sz('215/65R16','225/60R17','235/55R17','235/65R17','265/60R18') },
      { model: 'GitiSport S1',       pattern: 'GitiSport',   type: 'Performance',sizes: sz('205/55R16','215/55R17','225/45R17','235/45R17','245/40R18') },
      { model: 'GitiAllSeason AS1',  pattern: 'GitiAll',     type: 'Passenger', sizes: sz('195/65R15','205/55R16','215/55R17','225/45R17') },
    ],
  },
  {
    brand: 'Linglong',
    models: [
      { model: 'Green-Max HP010',    pattern: 'Green-Max',  type: 'Passenger',  sizes: sz('155/65R13','165/65R13','175/65R14','185/65R14','185/65R15','195/65R15','205/55R16') },
      { model: 'Green-Max EX',       pattern: 'Green-Max',  type: 'Passenger',  sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15') },
      { model: 'CrossWind HP010',    pattern: 'CrossWind',  type: 'SUV',        sizes: sz('215/65R16','225/60R17','235/60R18','265/60R18','275/60R18') },
      { model: 'CrossWind AT100',    pattern: 'CrossWind',  type: '4x4',        sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17') },
    ],
  },
  {
    brand: 'Cooper',
    models: [
      { model: 'CS5 Ultra Touring',  pattern: 'CS5',        type: 'Passenger',   sizes: sz('185/65R15','195/65R15','205/55R16','215/55R17','225/50R17','235/50R17') },
      { model: 'Zeon RS3-G1',        pattern: 'Zeon',       type: 'Performance', sizes: sz('205/55R16','225/45R17','235/45R17','245/40R18','255/40R18') },
      { model: 'Discoverer AT3',     pattern: 'Discoverer', type: '4x4',         sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17','285/65R17','285/75R16') },
    ],
  },
  {
    brand: 'BFGoodrich',
    models: [
      { model: 'All-Terrain T/A KO2',  pattern: 'All-Terrain',type: '4x4',         sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17','285/65R17','285/75R16','315/70R17') },
      { model: 'g-Force COMP-2 A/S+',  pattern: 'g-Force',    type: 'Performance', sizes: sz('225/45R17','235/45R17','245/40R18','255/35R19','275/35R19') },
      { model: 'Advantage T/A Sport',  pattern: 'Advantage',  type: 'Passenger',   sizes: sz('185/65R15','195/65R15','205/55R16','215/55R17','225/50R17') },
    ],
  },
  {
    brand: 'Dunlop',
    models: [
      { model: 'SP Sport LM705',     pattern: 'SP Sport',   type: 'Passenger',   sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: 'SP Sport Maxx 050+', pattern: 'SP Sport',   type: 'Performance', sizes: sz('205/55R16','215/55R17','225/45R17','235/45R17','245/40R18','255/35R19') },
      { model: 'SportMaxx RT2',      pattern: 'SportMaxx',  type: 'Performance', sizes: sz('225/40R18','245/40R18','255/35R19','275/35R19','285/35R19') },
      { model: 'Enasave EC300+',     pattern: 'Enasave',    type: 'Passenger',   sizes: sz('185/65R15','195/65R15','205/55R16','215/55R17','225/45R17') },
      { model: 'Grandtrek AT22',     pattern: 'Grandtrek',  type: '4x4',         sizes: sz('215/65R16','225/65R17','235/65R17','265/65R17','265/60R18') },
    ],
  },
  {
    brand: 'Atlas',
    models: [
      { model: 'Gold A4 Plus',       pattern: 'Gold',       type: 'Passenger',   sizes: sz('155/65R13','165/65R13','175/65R14','185/65R14','185/65R15','195/65R15','205/65R15') },
      { model: 'Green HP',           pattern: 'Green',      type: 'Passenger',   sizes: sz('205/55R16','215/55R17','225/45R17','225/50R17') },
      { model: 'Sport HP',           pattern: 'Sport',      type: 'Performance', sizes: sz('205/55R16','215/55R17','225/45R17','235/45R17','245/40R18') },
    ],
  },
  {
    brand: 'Nitto',
    models: [
      { model: 'NT555 G2',           pattern: 'NT555',      type: 'Performance', sizes: sz('225/45R17','235/45R17','245/40R18','255/35R19','275/35R19') },
      { model: 'Ridge Grappler',     pattern: 'Grappler',   type: '4x4',         sizes: sz('265/65R17','265/70R17','275/65R18','285/65R18','295/70R18') },
    ],
  },

  /* ── PAKISTAN LOCAL MANUFACTURERS ── */
  {
    brand: 'General Tyre (Pakistan)',
    models: [
      // Passenger — locally manufactured for compact/sedan segment
      { model: 'ALTIMAX RT43',   pattern: 'ALTIMAX',   type: 'Passenger',
        sizes: sz('155/65R13','165/65R13','165/70R13','175/65R14','175/70R14','185/65R14','185/70R14','185/65R15','195/65R15','205/65R15','205/55R16','215/60R16') },
      { model: 'ALTIMAX HP',     pattern: 'ALTIMAX',   type: 'Passenger',
        sizes: sz('185/65R15','195/65R15','205/65R15','205/55R16','215/55R17','225/45R17','225/50R17') },
      { model: 'ALTIMAX ONE S',  pattern: 'ALTIMAX',   type: 'Passenger',
        sizes: sz('185/65R15','195/65R15','205/55R16','215/55R17','225/45R17') },
      // SUV / 4x4 — popular for local SUVs and double-cabs
      { model: 'Grabber HTS60',  pattern: 'Grabber',   type: 'SUV',
        sizes: sz('215/65R16','225/65R17','235/55R17','235/65R17','265/65R17','265/60R18','275/55R20') },
      { model: 'Grabber HP',     pattern: 'Grabber',   type: 'SUV',
        sizes: sz('215/65R16','225/60R17','235/60R17','265/65R17','265/60R18') },
      { model: 'Grabber AT2',    pattern: 'Grabber',   type: '4x4',
        sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17','285/65R17','285/75R16') },
    ],
  },
  {
    brand: 'Servis Tyres',
    models: [
      // Passenger — compact cars (Mehran, Alto, Cultus, City, Civic era)
      { model: 'Galaxy',    pattern: 'Galaxy',   type: 'Passenger',
        sizes: sz('145/70R12','155/70R12','155/65R13','165/65R13','165/70R13','175/65R14','185/65R14','185/70R14','195/65R15','205/65R15') },
      { model: 'Metro',     pattern: 'Metro',    type: 'Passenger',
        sizes: sz('155/65R13','165/65R13','175/65R14','185/65R14','185/65R15','195/65R15','205/65R15') },
      { model: 'Champion',  pattern: 'Champion', type: 'Passenger',
        sizes: sz('145/70R12','155/65R13','165/65R13','175/65R14','185/65R14','185/65R15') },
      // SUV / 4x4
      { model: 'Ranger',    pattern: 'Ranger',   type: '4x4',
        sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17') },
    ],
  },
  {
    brand: 'Ghauri Tyres',
    models: [
      { model: 'Ghauri Standard',  pattern: 'Standard',  type: 'Passenger',
        sizes: sz('155/65R13','165/65R13','175/65R14','185/65R14','185/65R15','195/65R15') },
      { model: 'Ghauri Comfort',   pattern: 'Comfort',   type: 'Passenger',
        sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15') },
    ],
  },

  /* ── POPULAR IMPORTED BRANDS IN PAKISTAN MARKET ── */
  {
    brand: 'Westlake',
    models: [
      { model: 'RP18',   pattern: 'RP18',   type: 'Passenger',
        sizes: sz('155/65R13','165/65R13','175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16','215/55R17') },
      { model: 'SA37',   pattern: 'SA37',   type: 'Performance',
        sizes: sz('195/55R16','205/55R16','215/55R17','225/45R17','235/45R17','245/40R18','255/35R19') },
      { model: 'HP018',  pattern: 'HP018',  type: 'SUV',
        sizes: sz('215/65R16','225/60R17','235/60R17','265/65R17','265/60R18','275/55R20') },
      { model: 'AT960',  pattern: 'AT960',  type: '4x4',
        sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17','285/65R17','285/75R16') },
      { model: 'SL369 HT', pattern: 'SL369', type: '4x4',
        sizes: sz('215/65R16','225/65R17','235/65R17','265/65R17','265/70R17') },
    ],
  },
  {
    brand: 'Triangle',
    models: [
      { model: 'TE301',   pattern: 'TE301',  type: 'Passenger',
        sizes: sz('155/65R13','165/65R13','165/70R13','175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16','215/55R17') },
      { model: 'TH201',   pattern: 'TH201',  type: 'Passenger',
        sizes: sz('185/65R15','195/65R15','205/65R15','205/55R16','215/55R17','225/50R17','225/45R17') },
      { model: 'TR918',   pattern: 'TR918',  type: 'SUV',
        sizes: sz('215/65R16','225/60R17','235/60R17','265/65R17','265/60R18','275/55R20') },
      { model: 'TR797',   pattern: 'TR797',  type: '4x4',
        sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17','285/65R17') },
      { model: 'TXE',     pattern: 'TXE',    type: 'Performance',
        sizes: sz('195/55R16','205/55R16','215/55R17','225/45R17','235/45R17','245/40R18') },
    ],
  },
  {
    brand: 'Marshal',
    models: [
      // Marshal is Kumho's value sub-brand, widely distributed in Pakistan
      { model: 'MH15',     pattern: 'MH15',     type: 'Passenger',
        sizes: sz('155/65R13','165/65R13','175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: 'MH22',     pattern: 'MH22',     type: 'Passenger',
        sizes: sz('185/65R15','195/65R15','205/55R16','215/55R17','225/45R17','225/50R17') },
      { model: 'MW15',     pattern: 'MW15',     type: 'Passenger',
        sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15') },
      { model: 'AT I',     pattern: 'AT',       type: '4x4',
        sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17','285/65R17') },
    ],
  },
  {
    brand: 'Roadstone',
    models: [
      // Nexen sub-brand, popular budget option in Pakistan
      { model: 'N8000',        pattern: 'N8000',    type: 'Performance',
        sizes: sz('205/55R16','215/55R17','225/45R17','235/45R17','245/40R18','255/35R19') },
      { model: 'N5000 Plus',   pattern: 'N5000',    type: 'Passenger',
        sizes: sz('185/65R15','195/65R15','205/65R15','205/55R16','215/55R17','225/50R17') },
      { model: 'Roadian ATX',  pattern: 'Roadian',  type: '4x4',
        sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17') },
      { model: 'Roadian AT II',pattern: 'Roadian',  type: '4x4',
        sizes: sz('215/65R16','225/70R16','265/65R17','265/70R17','285/65R17') },
    ],
  },
  {
    brand: 'Vitara',
    models: [
      // Pakistani brand by Ibrahim Fibres — economy passenger segment
      { model: 'Viva',     pattern: 'Viva',    type: 'Passenger',
        sizes: sz('155/65R13','165/65R13','175/65R14','185/65R14','185/65R15','195/65R15') },
      { model: 'Vital',    pattern: 'Vital',   type: 'Passenger',
        sizes: sz('165/65R13','175/65R14','185/65R14','185/65R15','195/65R15','205/65R15') },
      { model: 'Valor',    pattern: 'Valor',   type: 'Passenger',
        sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15') },
      { model: 'Ventoux',  pattern: 'Ventoux', type: 'SUV',
        sizes: sz('215/65R16','225/65R17','235/65R17','265/65R17') },
    ],
  },
  {
    brand: 'Techking',
    models: [
      { model: 'Eternity EM5',    pattern: 'Eternity',   type: 'Passenger',
        sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16','215/55R17') },
      { model: 'Eternity SPORT',  pattern: 'Eternity',   type: 'Performance',
        sizes: sz('205/55R16','215/55R17','225/45R17','235/45R17','245/40R18') },
      { model: 'Eternity X-SUV',  pattern: 'Eternity',   type: 'SUV',
        sizes: sz('215/65R16','225/60R17','235/60R17','265/65R17','265/60R18') },
    ],
  },
  {
    brand: 'Zeetex',
    models: [
      { model: 'ZT1000',   pattern: 'ZT1000',   type: 'Passenger',
        sizes: sz('155/65R13','165/65R13','175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16') },
      { model: 'HP2000 vfm',pattern: 'HP2000',  type: 'Performance',
        sizes: sz('195/55R16','205/55R16','215/55R17','225/45R17','235/45R17','245/40R18') },
      { model: 'HT6000',    pattern: 'HT6000',  type: 'SUV',
        sizes: sz('215/65R16','225/65R17','235/65R17','265/65R17','265/70R17','275/65R17') },
      { model: 'AT1000',    pattern: 'AT1000',  type: '4x4',
        sizes: sz('215/65R16','225/70R16','235/75R15','265/65R17','265/70R17') },
    ],
  },
  {
    brand: 'Davanti',
    models: [
      { model: 'DX390',     pattern: 'DX390',    type: 'Passenger',
        sizes: sz('175/65R14','185/65R14','185/65R15','195/65R15','205/65R15','205/55R16','215/55R17','225/45R17') },
      { model: 'DX640',     pattern: 'DX640',    type: 'Performance',
        sizes: sz('205/55R16','215/55R17','225/45R17','235/45R17','245/40R18','255/35R19') },
      { model: 'DX390S',    pattern: 'DX390S',   type: 'SUV',
        sizes: sz('215/65R16','225/60R17','235/65R17','265/65R17','265/60R18') },
    ],
  },
];

/* ─── Flatten catalog to row array ────────────────────────────────────────── */
function buildCatalog() {
  const rows = [];
  for (const { brand, models } of BRANDS) {
    for (const { model, pattern, type: tire_type, sizes } of models) {
      for (const { size, load_index, speed_index } of sizes) {
        rows.push({
          brand,
          model,
          size,
          pattern:     pattern     || null,
          load_index:  load_index  || null,
          speed_index: speed_index || null,
          tire_type:   tire_type   || null,
        });
      }
    }
  }
  return rows;
}

/* ─── Upsert: insert only if brand+model+size does not already exist ─────── */
async function upsertBatches(pool, sql, rows) {
  const BATCH = 20;
  for (let start = 0; start < rows.length; start += BATCH) {
    const batch = rows.slice(start, start + BATCH);
    // Build a single multi-row MERGE using a VALUES CTE
    const req = pool.request();
    const valueClauses = batch.map((row, i) => {
      req.input(`b${i}`,  sql.NVarChar, row.brand);
      req.input(`m${i}`,  sql.NVarChar, row.model);
      req.input(`s${i}`,  sql.NVarChar, row.size);
      req.input(`p${i}`,  sql.NVarChar, row.pattern);
      req.input(`li${i}`, sql.NVarChar, row.load_index);
      req.input(`si${i}`, sql.NVarChar, row.speed_index);
      req.input(`tt${i}`, sql.NVarChar, row.tire_type);
      return `(@b${i},@m${i},@s${i},@p${i},@li${i},@si${i},@tt${i})`;
    });
    await req.query(`
      INSERT INTO tire_catalog (brand, model, size, pattern, load_index, speed_index, tire_type)
      SELECT src.brand, src.model, src.size, src.pattern, src.load_index, src.speed_index, src.tire_type
      FROM (VALUES ${valueClauses.join(',')}) AS src(brand, model, size, pattern, load_index, speed_index, tire_type)
      WHERE NOT EXISTS (
        SELECT 1 FROM tire_catalog tc
        WHERE tc.brand = src.brand AND tc.model = src.model AND tc.size = src.size
      )
    `);
  }
}

/* ─── Public seed function — merges new entries, never deletes existing ───── */
async function seedTireCatalog(pool, sql) {
  const rows = buildCatalog();
  await upsertBatches(pool, sql, rows);

  const { recordset } = await pool.request().query('SELECT COUNT(*) AS cnt FROM tire_catalog');
  const totalBrands = BRANDS.length;
  console.log(`✅ Tire catalog synced: ${recordset[0].cnt} total entries across ${totalBrands} brands`);
}

/* ─── Copy catalog → tires for every org/branch (idempotent) ──────────────
   Inserts each (brand, model, size) only if it doesn't already exist for that
   org+branch. Prices and stock default to 0 so the shop can fill them in.    */
async function seedInventoryFromCatalog(pool, sql) {
  // Get all active orgs and their branches
  const orgsRes = await pool.request()
    .query(`
      SELECT b.organization_id, b.id AS branch_id
      FROM branches b
      JOIN organizations o ON o.id = b.organization_id
      WHERE b.is_active = 1 AND o.is_active = 1
    `);

  if (orgsRes.recordset.length === 0) return;

  let totalInserted = 0;

  for (const { organization_id, branch_id } of orgsRes.recordset) {
    const result = await pool.request()
      .input('orgId',    sql.Int, organization_id)
      .input('branchId', sql.Int, branch_id)
      .query(`
        INSERT INTO tires
          (organization_id, branch_id, brand, model, size, type, pattern, load_index, speed_index,
           stock, cost_price, sale_price, reorder_level)
        SELECT
          @orgId, @branchId,
          tc.brand, tc.model, tc.size,
          ISNULL(tc.tire_type, 'Passenger'),
          tc.pattern, tc.load_index, tc.speed_index,
          0, 0, 0, 10
        FROM tire_catalog tc
        WHERE NOT EXISTS (
          SELECT 1 FROM tires t
          WHERE t.brand            = tc.brand
            AND t.model            = tc.model
            AND t.size             = tc.size
            AND t.organization_id  = @orgId
            AND t.branch_id        = @branchId
        )
      `);
    totalInserted += result.rowsAffected[0];
  }

  if (totalInserted > 0) {
    console.log(`✅ Inventory seeded: ${totalInserted} tire SKU(s) added across ${orgsRes.recordset.length} branch(es)`);
  }
}

module.exports = { seedTireCatalog, seedInventoryFromCatalog };
