import { LoanData, PaymentDetail } from "@/types/loan";

export const formatPercentage = (value: number, maxDecimals: number = 3) => {
  return (
    new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals,
    }).format(value * 100) + "%"
  );
};

export const round = (value: number, decimals = 3) => {
  return Number(value.toFixed(decimals));
};

// Función para obtener el número de periodos por año según la frecuencia
export function getPeriodsPerYear(
  frequency: LoanData["paymentFrequency"]
): number {
  switch (frequency) {
    case "mensual":
      return 12;
    case "bimestral":
      return 6;
    case "trimestral":
      return 4;
    case "cuatrimestral":
      return 3;
    case "semestral":
      return 2;
    case "anual":
      return 1;
    default:
      return 12;
  }
}

// Función para convertir tasa efectiva por frecuencia a tasa nominal anual
// FÓRMULA: j = i × m (donde i es efectiva por periodo, m es periodos por año)
export function convertEffectiveToNominal(
  effectiveRate: number,
  periodsPerYear: number
): number {
  // j = i × m
  return round(effectiveRate * periodsPerYear, 6);
}

// Función para convertir tasa nominal anual a tasa efectiva por frecuencia
// FÓRMULA: i = j/m (donde j es nominal anual, m es periodos por año)
export function convertNominalToEffective(
  nominalRate: number,
  periodsPerYear: number
): number {
  // i = j/m
  return round(nominalRate / periodsPerYear, 6);
}

export function convertAnticipatedToRegularRate(
  anticipatedRate: number
): number {
  let aux = Number(Number(1 - anticipatedRate).toFixed(3));
  return round(anticipatedRate / aux, 6);
}

// Función para convertir tasa regular a tasa anticipada
export function convertRegularToAnticipatedRate(regularRate: number): number {
  return round(regularRate / (1 + regularRate), 6);
}

// Función principal para obtener la tasa por periodo (tasa efectiva regular)
export function getEffectiveRate(loanData: LoanData): number {
  const periodsPerYear = getPeriodsPerYear(loanData.paymentFrequency);
  let effectiveRate: number;

  if (loanData.rateType === "nominal") {
    effectiveRate = convertNominalToEffective(
      loanData.interestRate,
      periodsPerYear
    );
  } else {
    effectiveRate = loanData.interestRate;
  }

  if (loanData.isAnticipated) {
    if (loanData.rateType === "efectiva") {
      effectiveRate = convertAnticipatedToRegularRate(loanData.interestRate);
    } else {
      effectiveRate = convertNominalToEffective(
        convertAnticipatedToRegularRate(loanData.interestRate),
        periodsPerYear
      );
    }
  }
  return effectiveRate;
}

// Calcular el pago mensual usando la fórmula de anualidades
export function calculatePeriodicPayment(
  principal: number,
  periodicRate: number,
  numberOfPeriods: number
): number {
  if (periodicRate === 0) {
    return principal / numberOfPeriods;
  }

  return (
    (principal * periodicRate * Math.pow(1 + periodicRate, numberOfPeriods)) /
    (Math.pow(1 + periodicRate, numberOfPeriods) - 1)
  );
}

// Calcular valor futuro con interés compuesto: S = P(1 + i)^n
export function calculateCompoundInterest(
  effectiveRate: number,
  loanData: LoanData
): number {
  return loanData.amount * Math.pow(1 + effectiveRate, loanData.term);
}

// Generar la tabla de amortización
export function generateAmortizationSchedule(
  effectiveRate: number,
  loanData: LoanData
): PaymentDetail[] {
  const periodicPayment = calculatePeriodicPayment(
    loanData.amount,
    effectiveRate,
    loanData.term
  );

  const payments: PaymentDetail[] = [];
  let remainingBalance = loanData.amount;

  // Calcular la fecha de inicio (hoy)
  const startDate = new Date();

  // Obtener los días para sumar según la frecuencia
  const getDaysToAdd = (
    frequency: LoanData["paymentFrequency"],
    paymentNumber: number
  ): number => {
    switch (frequency) {
      case "mensual":
        return paymentNumber * 30;
      case "bimestral":
        return paymentNumber * 60;
      case "trimestral":
        return paymentNumber * 90;
      case "cuatrimestral":
        return paymentNumber * 120;
      case "semestral":
        return paymentNumber * 180;
      case "anual":
        return paymentNumber * 365;
      default:
        return paymentNumber * 30;
    }
  };

  for (let i = 1; i <= loanData.term; i++) {
    const interestPayment = remainingBalance * effectiveRate;
    let principalPayment = periodicPayment - interestPayment;

    // En el último pago, ajustar para que el saldo sea exactamente 0
    if (i === loanData.term) {
      principalPayment = remainingBalance;
    }

    remainingBalance -= principalPayment;

    // Calcular la fecha de pago
    const paymentDate = new Date(startDate);
    paymentDate.setDate(
      paymentDate.getDate() + getDaysToAdd(loanData.paymentFrequency, i)
    );

    payments.push({
      paymentNumber: i,
      paymentDate: paymentDate.toISOString(),
      principalPayment,
      interestPayment,
      totalPayment: principalPayment + interestPayment,
      remainingBalance: Math.max(0, remainingBalance),
    });
  }

  return payments;
}
