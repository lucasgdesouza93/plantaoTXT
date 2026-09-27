export const aiPromptTemplates = {
  promptResultadosLaboratoriaisLinha: `Vou enviar resultados de exames laboratoriais em seguida.

Sua tarefa é reorganiza-los em formato corrido, sem interpretar clinicamente os achados.

Regras de formatacao:
- Cada coleta deve ficar em uma unica linha.
- Antes dos resultados, informe obrigatoriamente a data e a hora da coleta no formato: DD/MM/AAAA HHhMM >>
- Depois, organize os exames por grupos, sempre na mesma ordem, separados por " | ".
- Nao use bullets.
- Nao pule linhas.
- Nao acrescente comentarios, conclusoes ou hipoteses.
- Preserve valores e unidades, quando informados.
- Se algum exame nao estiver presente, apenas omita.
- Se houver mais de uma coleta, faca uma linha para cada horario.
- Responda somente com o texto final formatado.

Obrigatorio:
- Usar nomes de exames obrigatoriamente abreviados/contraidos.
- Nunca escrever nomes por extenso.
- Converter automaticamente termos longos para abreviacoes de prontuario.
- Manter padrao curto e objetivo, evitando texto longo.

Abreviacoes padrao:
Hb, Ht, Leuco, Neut, Linf, Plq, Ur, Cr, Na, K, Cl, Ca (ion), Mg, P, TAP, INR, TTPa, Glic, PCR, TGO, TGP, BT, BD, BI, Alb, Trop, CK-MB, BNP, Amil, Lip, Gaso A, Gaso V, Lact

Ordem fixa dos grupos:
HMG | renal | eletrolitos | gaso/lactato | coagulacao | metabolicos | inflamatorios | hepatica | cardiacos | outros

Regras especificas da gasometria:
- Identificar o tipo de gasometria:
  - Gasometria arterial = "Gaso A"
  - Gasometria venosa = "Gaso V"
- Se nao estiver especificado, usar apenas "Gaso"
- Manter parametros como: pH, pCO2, pO2, HCO3, BE, SatO2, Lact

Modelo de saida:
DD/MM/AAAA HHhMM >> HMG Hb 10,2, Ht 31, Leuco 18.400, Neut 86%, Linf 9%, Plq 245.000 | Ur 68, Cr 1,8 | Na 128, K 4,2, Cl 102, Ca (ion) 1,08, Mg 1,9, P 3,1 | Gaso A pH 7,31, pCO2 29, pO2 88, HCO3 15, BE -9, SatO2 96%, Lact 2,8 | TAP 78%, INR 1,12, TTPa 31 (R 1,0) | Glic 268 | PCR 12,4 | TGO 45, TGP 38, BT 1,1 | Trop 18 | Amil 54, Lip 31`,
};
