"use client";

import { useState } from "react";
import { LoanSimulation } from "@/types/loan";
import { getPeriodsPerYear, formatPercentage } from "@/lib/financial-utils";
import { CurrencyFormatter } from "@/lib/currency-formatter";

interface CalculationDetailsPanelProps {
  readonly simulation: LoanSimulation;
  readonly currency: CurrencyFormatter;
}

export default function CalculationDetailsPanel({
  simulation,
  currency,
}: CalculationDetailsPanelProps) {
  const {
    effectiveRate,
    anticipatedEffectiveRate,
    nominalRate,
    anticipatedNominalRate,
  } = simulation;

  const { term, interestRate, rateType, isAnticipated } = simulation.loanData;
  const presentValue = currency.format(simulation.presentValue);
  const periodicPayment = currency.format(simulation.periodicPayment);
  const futureValue = currency.format(simulation.futureValue);
  const paymentFrequencyName = simulation.loanData.paymentFrequency;
  const paymentFrequency = getPeriodsPerYear(
    simulation.loanData.paymentFrequency
  );

  const [isExpanded, setIsExpanded] = useState(false);

  const quotaExplanation = `
Cálculo de la Cuota (C)
==================================================

Fórmula de Cuota:
C = P × [i × (1 + i)^n] / [(1 + i)^n - 1]

= ${presentValue} × [${effectiveRate} × (1 + ${effectiveRate})^${term}] / [(1 + ${effectiveRate})^${term} - 1]

Donde:
  P = Valor Presente (Monto del Préstamo)
  P = ${presentValue}
  i = Tasa de Interés Efectiva por Periodo
  i = ${formatPercentage(effectiveRate)}
  n = Número de Periodos
  n = ${term}

Resultado:
  Cuota = ${periodicPayment}
  `.trim();

  const futureValueExplanation = `
Cálculo del Valor Futuro (S)
==================================================

Fórmula de Interés Compuesto: 
S = P × (1 + i)^n

= ${presentValue} × (1 + ${effectiveRate})^${term}

Donde:
  P = Valor Presente (Monto del Préstamo)
  P = ${presentValue}
  i = Tasa de Interés Efectiva por Periodo
  i = ${formatPercentage(effectiveRate)}
  n = Número de Periodos
  n = ${term}

Resultado:
  S = ${futureValue}
  `.trim();

  const effectiveRateExplanation = `
Cálculo de la Tasa Efectiva ${paymentFrequencyName}
==================================================

${
  rateType === "efectiva" && !isAnticipated
    ? `La tasa efectiva fue ingresada directamente por el usuario:

Tasa Efectiva por Periodo = ${formatPercentage(interestRate)}`
    : ""
}${`La tasa efectiva se puede calcular a partir de la tasa nominal:

Fórmula de Tasa Efectiva por Periodo: 
i = j / m

= ${interestRate} / ${paymentFrequency}

Donde: 
  j = Tasa Nominal
  j = ${formatPercentage(interestRate)}
  m = Número de periodos en un año
  m = ${paymentFrequency}

Resultado:
  i = ${formatPercentage(effectiveRate)}

------------------------------------------------

`}${
    isAnticipated
      ? `La tasa efectiva se puede calcular a partir de la tasa anticipada efectiva:

Fórmula de la Tasa Efectiva por Periodo: 
i = ia / (1 - ia)

= ${anticipatedEffectiveRate} / (1 - ${anticipatedEffectiveRate})

Donde: 
  i = Tasa Efectiva
  ia = Tasa Anticipada Efectiva
  ia = ${formatPercentage(anticipatedEffectiveRate)}

Resultado:
  i = ${formatPercentage(effectiveRate)}
`
      : ""
  }`.trim();

  const nominalRateExplanation = `
Cálculo de la Tasa Nominal ${paymentFrequencyName}
==================================================

${
  rateType === "nominal" && !isAnticipated
    ? `La tasa nominal fue ingresada directamente por el usuario:

Tasa Nominal por Periodo = ${formatPercentage(interestRate)}`
    : ""
}${`La tasa nominal se calcula a partir de la tasa efectiva:
     
Fórmula de Tasa Nominal por Periodo: 
j = i × m

= ${interestRate} × ${paymentFrequency}

Donde: 
  i = Tasa Efectiva
  i = ${formatPercentage(interestRate)}%
  m = Número de periodos en un año
  m = ${paymentFrequency}

Resultado:
  j = ${formatPercentage(nominalRate)}

------------------------------------------------

`}${
    isAnticipated
      ? `La tasa nominal se calcula a partir de la tasa nominal efectiva:

Fórmula de la Tasa Nominal por Periodo: 
j = ja / (1 - ja)

= ${anticipatedNominalRate} / (1 - ${anticipatedNominalRate})

Donde: 
  j = Tasa Nominal
  ja = Tasa Anticipada Nominal
  ja = ${formatPercentage(anticipatedNominalRate)}

Resultado:
  j = ${formatPercentage(nominalRate)}
`
      : ""
  }`.trim();

  const anticipatedEffectiveRateExplanation = `
Cálculo de la Tasa Anticipada Efectiva ${paymentFrequencyName}
==================================================

${
  rateType === "efectiva" && isAnticipated
    ? `La tasa anticipada efectiva fue ingresada directamente por el usuario:

Tasa Anticipada Efectiva por Periodo = ${formatPercentage(interestRate)}`
    : ""
}${
    rateType === "nominal" && isAnticipated
      ? `La tasa anticipada efectiva se calcula a partir de la tasa efectiva:

Fórmula de la Tasa Anticipada Efectiva por Periodo: 
ia = i / (1 + i)

= ${effectiveRate} / (1 + ${effectiveRate})

Donde: 
  ia = Tasa Anticipada Efectiva
  i = Tasa Efectiva
  i = ${formatPercentage(effectiveRate)}

Resultado:
  ia = ${formatPercentage(anticipatedEffectiveRate)}
`
      : ""
  }`.trim();

  const anticipatedNominalRateExplanation = `
Cálculo de la Tasa Anticipada Nominal ${paymentFrequencyName}
==================================================

${
  rateType === "nominal" && isAnticipated
    ? `La tasa anticipada nominal fue ingresada directamente por el usuario:

Tasa Anticipada Nominal por Periodo = ${formatPercentage(interestRate)}`
    : ""
}${
    rateType === "efectiva" && isAnticipated
      ? `La tasa anticipada nominal se calcula a partir de la tasa nominal:

Fórmula de la Tasa Anticipada Nominal por Periodo: 
ja = j / (1 + i)

= ${nominalRate} / (1 + ${nominalRate})

Donde: 
  ja = Tasa Anticipada Nominal
  j = Tasa Nominal
  j = ${formatPercentage(nominalRate)}

Resultado:
  ja = ${formatPercentage(anticipatedNominalRate)}
`
      : ""
  }`.trim();

  return (
    <>
      {/* Collapsed State */}
      {!isExpanded && (
        <div className="fixed bottom-4 right-4 z-60 flex flex-col items-end">
          {/* Animated Popup */}
          <div className="bg-yellow-500 text-white text-sm px-3 py-2 rounded-lg shadow-lg mb-2 animate-bounce">
            Verifica los cálculos aquí
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-yellow-600"></div>
          </div>

          {/* Button */}
          <button
            onClick={() => setIsExpanded(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="Ver detalles de cálculos"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div className="fixed top-4 right-4 bottom-4 w-120 bg-white shadow-xl z-60 overflow-hidden flex flex-col rounded-lg">
          <div className="flex items-center justify-between p-4 bg-yellow-500 text-white">
            <h3 className="text-lg font-semibold">Detalles de Cálculos</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="hover:bg-blue-700 p-1 rounded"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Cuota por Periodo (C)
              </h4>
              <pre className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-700 whitespace-pre-wrap">
                {quotaExplanation}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Valor Futuro (S)
              </h4>
              <pre className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-700 whitespace-pre-wrap">
                {futureValueExplanation}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Tasa Efectiva {paymentFrequencyName}
              </h4>
              <pre className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-700 whitespace-pre-wrap">
                {effectiveRateExplanation}
              </pre>
            </div>
            {isAnticipated && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Tasa Efectiva Anticipada {paymentFrequencyName}
                </h4>
                <pre className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-700 whitespace-pre-wrap">
                  {anticipatedEffectiveRateExplanation}
                </pre>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Tasa Nominal {paymentFrequencyName}
              </h4>
              <pre className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-700 whitespace-pre-wrap">
                {nominalRateExplanation}
              </pre>
            </div>
            {isAnticipated && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Tasa Nominal Anticipada {paymentFrequencyName}
                </h4>
                <pre className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-700 whitespace-pre-wrap">
                  {anticipatedNominalRateExplanation}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
