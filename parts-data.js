export const listedModels = [
  "Toyota Corolla",
  "Honda Fit",
  "Mazda Demio",
  "Nissan AD Van",
  "Toyota Wish",
  "Toyota Hiace"
];

const PREFIX_RULES = [
  { match: /air filter/i, prefix: "AF" },
  { match: /oil filter/i, prefix: "OF" },
  { match: /engine oil|motor oil/i, prefix: "OL" },
  { match: /brake fluid/i, prefix: "BF" },
  { match: /brake pad/i, prefix: "BP" },
  { match: /brake disc|rotor/i, prefix: "BD" },
  { match: /brake shoe/i, prefix: "BS" },
  { match: /brake cleaner/i, prefix: "BC" },
  { match: /coolant/i, prefix: "CL" },
  { match: /water pump/i, prefix: "WP" },
  { match: /cooling fan/i, prefix: "CF" },
  { match: /cv boot/i, prefix: "CB" },
  { match: /cv grease/i, prefix: "CG" },
  { match: /cv joint/i, prefix: "CJ" },
  { match: /tripod/i, prefix: "TP" },
  { match: /spark plug/i, prefix: "SP" },
  { match: /ignition coil/i, prefix: "IC" },
  { match: /fuel pump/i, prefix: "FP" },
  { match: /fuel filter/i, prefix: "FF" },
  { match: /battery water/i, prefix: "BW" },
  { match: /battery terminal/i, prefix: "BT" },
  { match: /blade fuse|fuse pack/i, prefix: "FU" },
  { match: /jumper cable/i, prefix: "JC" },
  { match: /hydraulic jack|car jack/i, prefix: "JK" },
  { match: /shock absorber/i, prefix: "SA" },
  { match: /wheel bearing/i, prefix: "WB" },
  { match: /wheel nut/i, prefix: "WN" },
  { match: /wheel stud/i, prefix: "WS" },
  { match: /tyre valve/i, prefix: "TV" },
  { match: /tyre/i, prefix: "TY" },
  { match: /radiator/i, prefix: "RD" },
  { match: /engine mount/i, prefix: "EM" },
  { match: /valve cover gasket/i, prefix: "VG" },
  { match: /starter motor/i, prefix: "SM" },
  { match: /alternator/i, prefix: "AL" },
  { match: /clutch kit/i, prefix: "CK" },
  { match: /power steering fluid/i, prefix: "PS" },
  { match: /atf fluid/i, prefix: "AT" },
  { match: /hose clamp/i, prefix: "HC" },
  { match: /cable tie/i, prefix: "CT" },
  { match: /screwdriver/i, prefix: "SD" },
  { match: /spanner/i, prefix: "SN" },
  { match: /engine cleaner/i, prefix: "EC" },
  { match: /ball joint/i, prefix: "BJ" },
  { match: /tie rod/i, prefix: "TR" },
  { match: /drive belt|v-belt/i, prefix: "DB" },
  { match: /grease/i, prefix: "GR" }
];

function inferStockLabel(stockQty) {
  if (stockQty >= 20) return "In Stock";
  if (stockQty >= 6) return "Low Stock";
  if (stockQty >= 1) return "Order Ready";
  return "Out of Stock";
}

function getPartPrefix(name = "", category = "") {
  const source = `${name} ${category}`.trim();
  const matchedRule = PREFIX_RULES.find((rule) => rule.match.test(source));
  if (matchedRule) return matchedRule.prefix;

  const words = source
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !["TOYOTA", "HONDA", "MAZDA", "NISSAN", "UNIVERSAL"].includes(word));

  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`;
  if (words.length === 1) return `${words[0][0]}${words[0][1] || "X"}`;
  return "PT";
}

function hashToDigits(value = "") {
  const input = String(value || "AES");
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 100000;
  }

  return String(hash).padStart(5, "0");
}

export function buildReadablePartId(name, category, barcode = "", existingIds = []) {
  const prefix = getPartPrefix(name, category);
  const baseDigits = Number(hashToDigits(`${prefix}-${barcode || name}-${category}`));
  const taken = new Set(existingIds.filter((id) => String(id).startsWith(prefix)));

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const candidateDigits = String((baseDigits + attempt) % 100000).padStart(5, "0");
    const candidate = `${prefix}${candidateDigits}`;
    if (!taken.has(candidate)) return candidate;
  }

  return `${prefix}${hashToDigits(`${Date.now()}-${name}`)}`;
}

function createSeedPart({
  partId,
  name,
  category,
  vehicles,
  stockQty,
  barcode,
  description,
  imageUrl = "",
  price = null
}) {
  const readableId = partId && !String(partId).startsWith("EAS-")
    ? partId
    : buildReadablePartId(name, category, barcode);

  return {
    partId: readableId,
    name,
    category,
    vehicles,
    vehicle: vehicles.includes("Universal") ? "Universal" : vehicles[0],
    stockQty,
    stock: inferStockLabel(stockQty),
    barcode,
    description,
    imageUrl,
    price,
    createdAt: new Date()
  };
}

export const demoParts = [
  createSeedPart({
    partId: "EAS-2001",
    name: "Engine Oil 5L 10W30 / 20W50",
    category: "Fluids",
    vehicles: ["Universal"],
    stockQty: 60,
    barcode: "EAS-ENGOIL-5L",
    description: "Universal engine oil for everyday servicing across the Eastern Auto Spares fleet."
  }),
  createSeedPart({
    partId: "EAS-2002",
    name: "Brake Fluid DOT3 / DOT4 500ml",
    category: "Brakes",
    vehicles: ["Universal"],
    stockQty: 40,
    barcode: "EAS-BRAKEFLUID-500",
    description: "Brake fluid for regular top-ups and service work across all supported models."
  }),
  createSeedPart({
    partId: "EAS-2003",
    name: "CV Grease Sachet 100g",
    category: "Suspension",
    vehicles: ["Universal"],
    stockQty: 50,
    barcode: "EAS-CVGREASE-100",
    description: "CV grease sachet for joint, boot, and axle service tasks."
  }),
  createSeedPart({
    partId: "EAS-2004",
    name: "Coolant 5L",
    category: "Cooling",
    vehicles: ["Universal"],
    stockQty: 30,
    barcode: "EAS-COOLANT-5L",
    description: "Cooling system refill coolant for passenger and light commercial vehicles."
  }),
  createSeedPart({
    partId: "EAS-2005",
    name: "Engine Cleaner 500ml Spray",
    category: "Engine",
    vehicles: ["Universal"],
    stockQty: 20,
    barcode: "EAS-ENGCLEAN-500",
    description: "Workshop-ready cleaner spray for engine bay maintenance."
  }),
  createSeedPart({
    partId: "EAS-2006",
    name: "Battery Water Distilled 1L",
    category: "Electrical",
    vehicles: ["Universal"],
    stockQty: 50,
    barcode: "EAS-BATWATER-1L",
    description: "Distilled battery water for routine electrical maintenance."
  }),
  createSeedPart({
    partId: "EAS-2007",
    name: "Blade Fuse Pack",
    category: "Electrical",
    vehicles: ["Universal"],
    stockQty: 30,
    barcode: "EAS-FUSE-BLADE",
    description: "Universal blade fuse packs for fast roadside and workshop replacements."
  }),
  createSeedPart({
    partId: "EAS-2008",
    name: "Tyre Valves Rubber",
    category: "Tyres",
    vehicles: ["Universal"],
    stockQty: 100,
    barcode: "EAS-TYREVALVE-RUB",
    description: "Rubber tyre valves suited to multiple passenger and light commercial wheels."
  }),
  createSeedPart({
    partId: "EAS-2009",
    name: "Battery Terminals Universal Clamps",
    category: "Electrical",
    vehicles: ["Universal"],
    stockQty: 20,
    barcode: "EAS-BATTERM-UNI",
    description: "Universal battery clamps for quick replacements and rewiring jobs."
  }),
  createSeedPart({
    partId: "EAS-2010",
    name: "Jumper Cables 400-600A",
    category: "Emergency",
    vehicles: ["Universal"],
    stockQty: 10,
    barcode: "EAS-JUMPER-600A",
    description: "Heavy-duty jumper cables for roadside recovery and workshop use."
  }),
  createSeedPart({
    partId: "EAS-2011",
    name: "2-Ton Hydraulic Jack",
    category: "Tools",
    vehicles: ["Universal"],
    stockQty: 5,
    barcode: "EAS-JACK-2TON",
    description: "2-ton hydraulic jack suitable for home garages and workshop bays."
  }),
  createSeedPart({
    partId: "EAS-2012",
    name: "Toyota Corolla Oil Filter M20x1.5",
    category: "Filters",
    vehicles: ["Toyota Corolla", "Mazda Demio"],
    stockQty: 150,
    barcode: "EAS-OILFILTER-M20X15",
    description: "Spin-on oil filter used on Toyota Corolla and compatible Mazda Demio applications."
  }),
  createSeedPart({
    partId: "EAS-2013",
    name: "Toyota Corolla Front Brake Pad Set",
    category: "Brakes",
    vehicles: ["Toyota Corolla"],
    stockQty: 40,
    barcode: "EAS-COROLLA-BPAD-F",
    description: "Front brake pad set for Toyota Corolla."
  }),
  createSeedPart({
    partId: "EAS-2014",
    name: "Toyota Corolla Lower Ball Joint",
    category: "Suspension",
    vehicles: ["Toyota Corolla"],
    stockQty: 20,
    barcode: "EAS-COROLLA-BJ-LOW",
    description: "Lower ball joint for Toyota Corolla suspension maintenance."
  }),
  createSeedPart({
    partId: "EAS-2015",
    name: "Toyota Corolla Outer CV Joint 23-26 Spline",
    category: "Suspension",
    vehicles: ["Toyota Corolla"],
    stockQty: 15,
    barcode: "EAS-COROLLA-CV-OUT",
    description: "Outer CV joint assembly for Toyota Corolla driveline repairs."
  }),
  createSeedPart({
    partId: "EAS-2016",
    name: "Toyota Corolla Inner CV Tripod 23 Spline",
    category: "Suspension",
    vehicles: ["Toyota Corolla"],
    stockQty: 15,
    barcode: "EAS-COROLLA-CV-IN",
    description: "Inner CV tripod for Toyota Corolla axle service."
  }),
  createSeedPart({
    partId: "EAS-2017",
    name: "Toyota Corolla Aluminium Radiator",
    category: "Cooling",
    vehicles: ["Toyota Corolla"],
    stockQty: 5,
    barcode: "EAS-COROLLA-RAD",
    description: "Aluminium radiator assembly for Toyota Corolla cooling systems."
  }),
  createSeedPart({
    partId: "EAS-2018",
    name: "Spark Plug 14mm NGK Equivalent",
    category: "Electrical",
    vehicles: ["Toyota Corolla", "Nissan AD Van"],
    stockQty: 120,
    barcode: "EAS-SPARK-14MM",
    description: "14mm spark plug set compatible with Toyota Corolla and Nissan AD Van applications."
  }),
  createSeedPart({
    partId: "EAS-2019",
    name: "Toyota Corolla Wheel Nut M12x1.5",
    category: "Tyres",
    vehicles: ["Toyota Corolla"],
    stockQty: 60,
    barcode: "EAS-COROLLA-WNUT",
    description: "Replacement wheel nuts for Toyota Corolla."
  }),
  createSeedPart({
    partId: "EAS-2020",
    name: "Tyre 175/70 R13",
    category: "Tyres",
    vehicles: ["Toyota Corolla"],
    stockQty: 20,
    barcode: "EAS-TYRE-17570R13",
    description: "Tyre size 175/70 R13 stocked for Toyota Corolla."
  }),
  createSeedPart({
    partId: "EAS-2021",
    name: "Honda Fit Front Brake Pad Set",
    category: "Brakes",
    vehicles: ["Honda Fit"],
    stockQty: 40,
    barcode: "EAS-FIT-BPAD-F",
    description: "Front brake pad set for Honda Fit."
  }),
  createSeedPart({
    partId: "EAS-2022",
    name: "Honda Fit Tie Rod End Set",
    category: "Suspension",
    vehicles: ["Honda Fit"],
    stockQty: 20,
    barcode: "EAS-FIT-TIEROD",
    description: "Inner and outer tie rod ends for Honda Fit steering work."
  }),
  createSeedPart({
    partId: "EAS-2023",
    name: "Honda Fit Inner CV Tripod 23 Splines",
    category: "Suspension",
    vehicles: ["Honda Fit"],
    stockQty: 15,
    barcode: "EAS-FIT-CV-IN",
    description: "Inner CV tripod for Honda Fit axle repair."
  }),
  createSeedPart({
    partId: "EAS-2024",
    name: "Honda Fit Ignition Coil",
    category: "Electrical",
    vehicles: ["Honda Fit"],
    stockQty: 12,
    barcode: "EAS-FIT-IGNCOIL",
    description: "Coil-on-plug ignition coil for Honda Fit."
  }),
  createSeedPart({
    partId: "EAS-2025",
    name: "Honda Fit Drive Belt V-Belt",
    category: "Engine",
    vehicles: ["Honda Fit"],
    stockQty: 15,
    barcode: "EAS-FIT-VBELT",
    description: "Drive belt for Honda Fit engine accessories."
  }),
  createSeedPart({
    partId: "EAS-2026",
    name: "Tyre 185/70 R14",
    category: "Tyres",
    vehicles: ["Honda Fit"],
    stockQty: 20,
    barcode: "EAS-TYRE-18570R14",
    description: "Tyre size 185/70 R14 for Honda Fit stock requirements."
  }),
  createSeedPart({
    partId: "EAS-2027",
    name: "Mazda Demio Shock Absorber Set",
    category: "Suspension",
    vehicles: ["Mazda Demio"],
    stockQty: 10,
    barcode: "EAS-DEMIO-SHOCK",
    description: "Front and rear strut shock absorber stock for Mazda Demio."
  }),
  createSeedPart({
    partId: "EAS-2028",
    name: "Mazda Demio Wheel Bearing 35x68x37",
    category: "Suspension",
    vehicles: ["Mazda Demio"],
    stockQty: 16,
    barcode: "EAS-DEMIO-BEARING",
    description: "Wheel bearing sized 35x68x37 mm for Mazda Demio."
  }),
  createSeedPart({
    partId: "EAS-2029",
    name: "Mazda Demio Fuel Pump 12V",
    category: "Engine",
    vehicles: ["Mazda Demio"],
    stockQty: 10,
    barcode: "EAS-DEMIO-FPUMP",
    description: "12V electric fuel pump for Mazda Demio."
  }),
  createSeedPart({
    partId: "EAS-2030",
    name: "Air Filter Panel 250x200 mm",
    category: "Filters",
    vehicles: ["Nissan AD Van", "Toyota Wish"],
    stockQty: 100,
    barcode: "EAS-AIRFILTER-250200",
    description: "Panel air filter for Nissan AD Van and Toyota Wish."
  }),
  createSeedPart({
    partId: "EAS-2031",
    name: "Nissan AD Van Rear Brake Shoe Set",
    category: "Brakes",
    vehicles: ["Nissan AD Van"],
    stockQty: 20,
    barcode: "EAS-ADVAN-BSHOE-R",
    description: "Rear drum brake shoe set for Nissan AD Van."
  }),
  createSeedPart({
    partId: "EAS-2032",
    name: "Nissan AD Van Mechanical Water Pump",
    category: "Cooling",
    vehicles: ["Nissan AD Van"],
    stockQty: 8,
    barcode: "EAS-ADVAN-WPUMP",
    description: "Mechanical water pump for Nissan AD Van."
  }),
  createSeedPart({
    partId: "EAS-2033",
    name: "Nissan AD Van Starter Motor 12V",
    category: "Electrical",
    vehicles: ["Nissan AD Van"],
    stockQty: 3,
    barcode: "EAS-ADVAN-STARTER",
    description: "12V starter motor for Nissan AD Van."
  }),
  createSeedPart({
    partId: "EAS-2034",
    name: "Nissan AD Van Valve Cover Gasket",
    category: "Engine",
    vehicles: ["Nissan AD Van"],
    stockQty: 15,
    barcode: "EAS-ADVAN-VCGASKET",
    description: "Rubber valve cover gasket for Nissan AD Van."
  }),
  createSeedPart({
    partId: "EAS-2035",
    name: "Nissan AD Van Wheel Stud M12x1.5",
    category: "Tyres",
    vehicles: ["Nissan AD Van"],
    stockQty: 40,
    barcode: "EAS-ADVAN-WSTUD",
    description: "Wheel stud replacement stock for Nissan AD Van."
  }),
  createSeedPart({
    partId: "EAS-2036",
    name: "Tyre 195/R14C",
    category: "Tyres",
    vehicles: ["Nissan AD Van", "Toyota Hiace"],
    stockQty: 20,
    barcode: "EAS-TYRE-195R14C",
    description: "Commercial tyre size 195/R14C for Nissan AD Van and Toyota Hiace."
  }),
  createSeedPart({
    partId: "EAS-2037",
    name: "Toyota Wish Brake Disc 260-280 mm",
    category: "Brakes",
    vehicles: ["Toyota Wish"],
    stockQty: 10,
    barcode: "EAS-WISH-BDISC",
    description: "Brake disc rotor stock for Toyota Wish."
  }),
  createSeedPart({
    partId: "EAS-2038",
    name: "Toyota Wish Cooling Fan 12V",
    category: "Cooling",
    vehicles: ["Toyota Wish"],
    stockQty: 5,
    barcode: "EAS-WISH-COOLFAN",
    description: "12V electric cooling fan assembly for Toyota Wish."
  }),
  createSeedPart({
    partId: "EAS-2039",
    name: "Toyota Wish Engine Mount",
    category: "Engine",
    vehicles: ["Toyota Wish"],
    stockQty: 10,
    barcode: "EAS-WISH-ENGMOUNT",
    description: "Rubber engine mount for Toyota Wish."
  }),
  createSeedPart({
    partId: "EAS-2040",
    name: "Toyota Hiace Fuel Filter Inline Cartridge",
    category: "Filters",
    vehicles: ["Toyota Hiace"],
    stockQty: 80,
    barcode: "EAS-HIACE-FFILTER",
    description: "Inline fuel filter cartridge for Toyota Hiace."
  }),
  createSeedPart({
    partId: "EAS-2041",
    name: "Toyota Hiace Clutch Kit 200-240 mm",
    category: "Engine",
    vehicles: ["Toyota Hiace"],
    stockQty: 5,
    barcode: "EAS-HIACE-CLUTCH",
    description: "Clutch kit stock for Toyota Hiace."
  }),
  createSeedPart({
    partId: "EAS-2042",
    name: "Toyota Hiace Alternator 12V 90A",
    category: "Electrical",
    vehicles: ["Toyota Hiace"],
    stockQty: 3,
    barcode: "EAS-HIACE-ALT90A",
    description: "12V 90A alternator for Toyota Hiace."
  }),
  createSeedPart({
    partId: "EAS-2043",
    name: "ATF Fluid Dexron III 1L",
    category: "Fluids",
    vehicles: ["Universal"],
    stockQty: 25,
    barcode: "EAS-ATF-DEX3-1L",
    description: "ATF fluid for transmission service and top-up work."
  }),
  createSeedPart({
    partId: "EAS-2044",
    name: "CV Boot Kit",
    category: "Suspension",
    vehicles: ["Universal"],
    stockQty: 30,
    barcode: "EAS-CVBOOT-KIT",
    description: "CV boot kit with grease for axle service work."
  }),
  createSeedPart({
    partId: "EAS-2045",
    name: "Power Steering Fluid Dexron III 1L",
    category: "Fluids",
    vehicles: ["Universal"],
    stockQty: 15,
    barcode: "EAS-PSF-DEX3-1L",
    description: "Power steering fluid for workshop and retail service needs."
  }),
  createSeedPart({
    partId: "EAS-2046",
    name: "Lithium Grease 400g",
    category: "Tools",
    vehicles: ["Universal"],
    stockQty: 15,
    barcode: "EAS-GREASE-LITHIUM",
    description: "Lithium grease stock for wheel, bearing, and chassis lubrication."
  }),
  createSeedPart({
    partId: "EAS-2047",
    name: "Brake Cleaner Aerosol Spray",
    category: "Brakes",
    vehicles: ["Universal"],
    stockQty: 15,
    barcode: "EAS-BRAKECLEAN-AERO",
    description: "Brake cleaner spray for fast degreasing and workshop cleanup."
  }),
  createSeedPart({
    partId: "EAS-2048",
    name: "Cable Ties 200mm Pack",
    category: "Tools",
    vehicles: ["Universal"],
    stockQty: 20,
    barcode: "EAS-CABLETIE-200",
    description: "Cable tie packs for neat workshop routing and quick fixes."
  }),
  createSeedPart({
    partId: "EAS-2049",
    name: "Hose Clamp 10-40 mm",
    category: "Cooling",
    vehicles: ["Universal"],
    stockQty: 50,
    barcode: "EAS-HCLAMP-1040",
    description: "Hose clamps for cooling, fuel, and workshop plumbing repairs."
  }),
  createSeedPart({
    partId: "EAS-2050",
    name: "Screwdriver Set Flat / Phillips",
    category: "Tools",
    vehicles: ["Universal"],
    stockQty: 10,
    barcode: "EAS-SCREWDRIVER-SET",
    description: "Workshop screwdriver set for day-to-day service jobs."
  }),
  createSeedPart({
    partId: "EAS-2051",
    name: "Spanner Set 8-19mm Metric",
    category: "Tools",
    vehicles: ["Universal"],
    stockQty: 10,
    barcode: "EAS-SPANNER-SET",
    description: "Metric spanner set for general workshop maintenance."
  })
];

export const categoryColorMap = {
  Brakes: "from-rose-500 to-red-700",
  Suspension: "from-blue-500 to-indigo-700",
  Electrical: "from-amber-400 to-orange-600",
  Cooling: "from-cyan-500 to-sky-700",
  Engine: "from-slate-600 to-slate-900",
  Fluids: "from-emerald-500 to-green-700",
  Tools: "from-violet-500 to-indigo-700",
  Emergency: "from-red-500 to-orange-500",
  Tyres: "from-zinc-600 to-zinc-900",
  Filters: "from-lime-500 to-emerald-700"
};

export function getCategoryGradient(category) {
  return categoryColorMap[category] || "from-blue-500 to-orange-500";
}

export function getVehicleOptions(parts = demoParts) {
  const vehicles = new Set();
  parts.forEach((part) => (part.vehicles || [part.vehicle]).forEach((vehicle) => vehicles.add(vehicle)));
  return ["all", ...[...vehicles].sort()];
}

export function inferStockState(stockQty) {
  return inferStockLabel(stockQty);
}
