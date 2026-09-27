
export const UNIT=Object.freeze({
  MCG_MIN:   "mcg_min",
  MCG_KG_MIN:"mcg_kg_min",
  MCG_KG_HR: "mcg_kg_hr",
  MCG_HR:    "mcg_hr",
  MG_MIN:    "mg_min",
  MG_KG_HR:  "mg_kg_hr",
  MG_HR:     "mg_hr",
  UNITS_MIN: "units_min",
  UNITS_HR:  "units_hr",
  MG_KG:     "mg_kg",
  MCG_KG:    "mcg_kg",
  MG:        "mg",
  MCG:       "mcg",
  UNITS_KG:  "units_kg",
  UNITS:     "units"
})

export const AMOUNT_UNIT=Object.freeze({
  MG:    "mg",
  MCG:   "mcg",
  UNITS: "units",
  G:     "g"
})

export const DEFAULT_MODE="forward"
export const DEFAULT_INFUSION_UNIT=UNIT.MCG_KG_MIN
export const DEFAULT_BOLUS_UNIT=UNIT.MG
export const DEFAULT_TIME_UNIT="min"
