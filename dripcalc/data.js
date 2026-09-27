import {UNIT} from "./constants.js"

export const infusionPresets=[
  {name:"Noradrenalina x4 preset (16 mg/250 mL)",amount:16,unit:"mg",vol:250},
  {name:"Noradrenalina x8 preset (32 mg/250 mL)",amount:32,unit:"mg",vol:250},
  {name:"Vasopressina x1 preset (20 UI/100 mL)",amount:20,unit:"units",vol:100},
  {name:"Nitroglicerina x1 preset (50 mg/250 mL)",amount:50,unit:"mg",vol:250},
  {name:"Nitroprussiato x1 preset (50 mg/250 mL)",amount:50,unit:"mg",vol:250},
  {name:"Midazolam x2 preset (100 mg/100 mL)",amount:100,unit:"mg",vol:100},
  {name:"Fentanil x2 preset (1000 mcg/100 mL)",amount:1000,unit:"mcg",vol:100}
]

export const presentations=[
  {name:"Adrenalina 1mg/mL",amount:1,unit:"mg",vol:1},
  {name:"Noradrenalina 4mg/4mL",amount:4,unit:"mg",vol:4},
  {name:"Vasopressina 20UI/mL",amount:20,unit:"units",vol:1},
  {name:"Dobutamina 250mg/20mL",amount:250,unit:"mg",vol:20},
  {name:"Dopamina 50mg/10mL",amount:50,unit:"mg",vol:10},
  {name:"Nitroprussiato 50mg/2mL",amount:50,unit:"mg",vol:2},
  {name:"Nitroglicerina 50mg/10mL",amount:50,unit:"mg",vol:10},
  {name:"Esmolol 2500mg/10mL",amount:2500,unit:"mg",vol:10},
  {name:"Metoprolol 5mg/5mL",amount:5,unit:"mg",vol:5},
  {name:"Digoxina 0,5mg/2mL",amount:500,unit:"mcg",vol:2},
  {name:"Midazolam 15mg/3mL",amount:15,unit:"mg",vol:3},
  {name:"Midazolam 50mg/10mL",amount:50,unit:"mg",vol:10},
  {name:"Midazolam 5mg/5mL",amount:5,unit:"mg",vol:5},
  {name:"Fentanil 500mcg/10mL",amount:500,unit:"mcg",vol:10},
  {name:"Fentanil 100mcg/2mL",amount:100,unit:"mcg",vol:2},
  {name:"Propofol 1%",amount:200,unit:"mg",vol:20},
  {name:"Propofol 2%",amount:400,unit:"mg",vol:20},
  {name:"Cetamina 100mg/2mL",amount:100,unit:"mg",vol:2},
  {name:"Cetamina 500mg/10mL",amount:500,unit:"mg",vol:10},
  {name:"Morfina 10mg/mL",amount:10,unit:"mg",vol:1},
  {name:"Morfina 2mg/2mL",amount:2,unit:"mg",vol:2},
  {name:"Fenitoina 250mg/5mL",amount:250,unit:"mg",vol:5},
  {name:"Levetiracetam 500mg/5mL",amount:500,unit:"mg",vol:5},
  {name:"Fenobarbital 200mg/2mL",amount:200,unit:"mg",vol:2},
  {name:"MgSO4 10%",amount:1,unit:"g",vol:10},
  {name:"MgSO4 50%",amount:5,unit:"g",vol:10}
]

export const infusionUnits={
  Adrenalina:UNIT.MCG_MIN,
  Noradrenalina:UNIT.MCG_KG_MIN,
  Dobutamina:UNIT.MCG_KG_MIN,
  Dopamina:UNIT.MCG_KG_MIN,
  Esmolol:UNIT.MCG_KG_MIN,
  Fenitoina:UNIT.MG_MIN,
  Midazolam:UNIT.MG_HR,
  Fentanil:UNIT.MCG_HR,
  Propofol:UNIT.MCG_KG_MIN,
  Cetamina:UNIT.MG_KG_HR,
  Vasopressina:UNIT.UNITS_MIN
}

export const infusionUnitOptions=[
  {value:UNIT.MCG_MIN,label:"mcg/min"},
  {value:UNIT.MCG_KG_MIN,label:"mcg/kg/min"},
  {value:UNIT.MCG_KG_HR,label:"mcg/kg/h"},
  {value:UNIT.MCG_HR,label:"mcg/h"},
  {value:UNIT.MG_MIN,label:"mg/min"},
  {value:UNIT.MG_KG_HR,label:"mg/kg/h"},
  {value:UNIT.MG_HR,label:"mg/h"},
  {value:UNIT.UNITS_MIN,label:"UI/min"},
  {value:UNIT.UNITS_HR,label:"UI/h"}
]

export const ivPushUnitOptions=[
  {value:"mg",label:"mg"},
  {value:"mcg",label:"mcg"},
  {value:"units",label:"UI"},
  {value:"g",label:"g"}
]

export function buildCatalogForMode(currentMode){
  if(currentMode==="forward"||currentMode==="reverse"){
    return [
      ...infusionPresets.map(item=>({...item,group:"Presets de bomba"})),
      ...presentations.map(item=>({...item,group:"Ampolas / frascos"}))
    ]
  }
  return []
}

export function detectDrug(name){
  const lower=String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")

  if(lower.includes("noradrenalina")||lower.includes("norepinefrina")) return "Noradrenalina"
  if(lower.includes("adrenalina")||lower.includes("epinefrina")) return "Adrenalina"
  if(lower.includes("dobutamina")) return "Dobutamina"
  if(lower.includes("dopamina")) return "Dopamina"
  if(lower.includes("esmolol")) return "Esmolol"
  if(lower.includes("fenito")) return "Fenitoina"
  if(lower.includes("midazolam")) return "Midazolam"
  if(lower.includes("fentanil")) return "Fentanil"
  if(lower.includes("propofol")) return "Propofol"
  if(lower.includes("cetamina")) return "Cetamina"
  if(lower.includes("vasopressina")) return "Vasopressina"
  return null
}
