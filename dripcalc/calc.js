import {UNIT} from "./constants.js"

export function parseLocaleNumber(value){
  if(value===null||value===undefined) return NaN
  if(typeof value==="number") return value

  const normalized=String(value)
    .trim()
    .replace(/\s+/g,"")
    .replace(/,/g,".")

  if(!normalized) return NaN
  return Number(normalized)
}

export function isPositiveNumber(value){
  return Number.isFinite(value)&&value>0
}

export function toBaseUnit(value,unit){
  const numeric=parseLocaleNumber(value)
  if(unit==="mg") return numeric*1000
  if(unit==="g") return numeric*1000000
  return numeric
}

export function calculateConcentration(totalAmount,amountUnit,totalVolume){
  return toBaseUnit(totalAmount,amountUnit)/totalVolume
}

export function needsWeight(selectedUnit){
  return [
    UNIT.MCG_KG_MIN,UNIT.MCG_KG_HR,UNIT.MG_KG_HR,
    UNIT.MG_KG,UNIT.MCG_KG,UNIT.UNITS_KG
  ].includes(selectedUnit)
}

export function formatUnit(selectedUnit){
  const labels={
    [UNIT.MCG_MIN]:"mcg/min",
    [UNIT.MCG_KG_MIN]:"mcg/kg/min",
    [UNIT.MCG_KG_HR]:"mcg/kg/h",
    [UNIT.MCG_HR]:"mcg/h",
    [UNIT.MG_MIN]:"mg/min",
    [UNIT.MG_KG]:"mg/kg",
    [UNIT.MG_KG_HR]:"mg/kg/h",
    [UNIT.MG_HR]:"mg/h",
    [UNIT.UNITS_MIN]:"UI/min",
    [UNIT.UNITS_HR]:"UI/h",
    [UNIT.MCG_KG]:"mcg/kg",
    [UNIT.MCG]:"mcg",
    [UNIT.MG]:"mg",
    [UNIT.UNITS_KG]:"UI/kg",
    [UNIT.UNITS]:"UI",
    mg:"mg",
    mcg:"mcg",
    units:"UI",
    g:"g"
  }
  return labels[selectedUnit]||selectedUnit
}

export function formatNumber(value,decimals=2){
  return value.toLocaleString("pt-BR",{
    minimumFractionDigits:0,
    maximumFractionDigits:decimals
  })
}

export function calculateBolusDoseBase(prescribedDose,selectedUnit,patientWeight){
  switch(selectedUnit){
    case UNIT.MG_KG: return prescribedDose*patientWeight*1000
    case UNIT.MCG_KG: return prescribedDose*patientWeight
    case UNIT.UNITS_KG: return prescribedDose*patientWeight
    case UNIT.MG: return prescribedDose*1000
    case UNIT.MCG: return prescribedDose
    case UNIT.UNITS: return prescribedDose
    default: return NaN
  }
}

export function calculateIvPushVolume(doseValue,doseUnit,totalDoseValue,totalDoseUnit,totalVolume){
  const desiredDoseBase=toBaseUnit(doseValue,doseUnit)
  const totalDoseBase=toBaseUnit(totalDoseValue,totalDoseUnit)
  const volumeMl=parseLocaleNumber(totalVolume)

  if(!isPositiveNumber(desiredDoseBase)) return {error:"Dose deve ser maior que zero."}
  if(!isPositiveNumber(totalDoseBase)) return {error:"Dose total na solucao deve ser maior que zero."}
  if(!isPositiveNumber(volumeMl)) return {error:"Volume deve ser maior que zero."}

  const concentration=totalDoseBase/volumeMl
  const volumeToPush=desiredDoseBase/concentration
  return {
    volumeMl:volumeToPush,
    concentration,
    desiredDoseBase,
    totalDoseBase
  }
}

export function calculateFluidPumpRate(volumeMl,timeValue,timeUnit){
  const volume=parseLocaleNumber(volumeMl)
  const time=parseLocaleNumber(timeValue)

  if(!isPositiveNumber(volume)) return {error:"Volume deve ser maior que zero."}
  if(!isPositiveNumber(time)) return {error:"Tempo deve ser maior que zero."}

  const hours=timeUnit==="min" ? time/60 : time
  if(!isPositiveNumber(hours)) return {error:"Tempo deve ser maior que zero."}

  return {
    mlh:volume/hours,
    hours
  }
}

export function calculateForwardRate(prescribedDose,selectedUnit,patientWeight,concentration){
  let perHour
  switch(selectedUnit){
    case UNIT.MCG_MIN: perHour=prescribedDose*60; break
    case UNIT.MCG_KG_MIN: perHour=prescribedDose*patientWeight*60; break
    case UNIT.MCG_KG_HR: perHour=prescribedDose*patientWeight; break
    case UNIT.MCG_HR: perHour=prescribedDose; break
    case UNIT.MG_MIN: perHour=prescribedDose*1000*60; break
    case UNIT.MG_KG_HR: perHour=prescribedDose*patientWeight*1000; break
    case UNIT.MG_HR: perHour=prescribedDose*1000; break
    case UNIT.UNITS_MIN: perHour=prescribedDose*60; break
    case UNIT.UNITS_HR: perHour=prescribedDose; break
    case UNIT.MG_KG:
    case UNIT.MCG_KG:
    case UNIT.MG:
    case UNIT.MCG:
    case UNIT.UNITS_KG:
    case UNIT.UNITS:
      return {error:"Essa unidade e de bolus. Use o modo Bolus."}
    default:
      return {error:"Unidade invalida"}
  }
  return {mlh:perHour/concentration}
}

export function calculateReverseRate(mlh,selectedUnit,patientWeight,concentration){
  const perHour=mlh*concentration
  let doseOut
  switch(selectedUnit){
    case UNIT.MCG_MIN: doseOut=perHour/60; break
    case UNIT.MCG_KG_MIN: doseOut=perHour/(patientWeight*60); break
    case UNIT.MCG_KG_HR: doseOut=perHour/patientWeight; break
    case UNIT.MCG_HR: doseOut=perHour; break
    case UNIT.MG_MIN: doseOut=perHour/(1000*60); break
    case UNIT.MG_KG_HR: doseOut=perHour/(patientWeight*1000); break
    case UNIT.MG_HR: doseOut=perHour/1000; break
    case UNIT.UNITS_MIN: doseOut=perHour/60; break
    case UNIT.UNITS_HR: doseOut=perHour; break
    case UNIT.MG_KG:
    case UNIT.MCG_KG:
    case UNIT.MG:
    case UNIT.MCG:
    case UNIT.UNITS_KG:
    case UNIT.UNITS:
      return {error:"Essa unidade e de bolus. Use o modo Bolus."}
    default:
      return {error:"Unidade invalida"}
  }
  return {dose:doseOut}
}
