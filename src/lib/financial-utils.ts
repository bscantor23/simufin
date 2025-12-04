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

// Función para convertir una tasa efectiva de una frecuencia a otra
// Usando la fórmula: (1 + i1)^(m1) = (1 + i2)^(m2)
// donde i1 es la tasa origen, i2 es la tasa destino, m1 y m2 son las frecuencias
export function convertEffectiveRateFrequency(
  effectiveRate: number,
  fromFrequency: LoanData["paymentFrequency"],
  toFrequency: LoanData["paymentFrequency"]
): number {
  if (fromFrequency === toFrequency) {
    return effectiveRate;
  }

  const fromPeriods = getPeriodsPerYear(fromFrequency);
  const toPeriods = getPeriodsPerYear(toFrequency);

  // Convertir a tasa anual efectiva
  const annualEffectiveRate = Math.pow(1 + effectiveRate, fromPeriods) - 1;
  
  // Convertir a la nueva frecuencia
  const newEffectiveRate = Math.pow(1 + annualEffectiveRate, 1 / toPeriods) - 1;
  
  return round(newEffectiveRate, 6);
}

export function getEffectiveRate(loanData: LoanData): number {
  const rateFrequencyPeriods = getPeriodsPerYear(loanData.rateFrequency);
  const paymentFrequencyPeriods = getPeriodsPerYear(loanData.paymentFrequency);
  
  let workingRate = loanData.interestRate;
  
  // ESCENARIO 1: Tasa Nominal Anticipada
  if (loanData.rateType === "nominal" && loanData.isAnticipated) {
    // 1. Calcular tasa nominal regular
    const nominalRegular = convertAnticipatedToRegularRate(workingRate);
    
    // 2. Calcular tasa efectiva en frecuencia original
    const effectiveOriginal = convertNominalToEffective(nominalRegular, rateFrequencyPeriods);
    
    // 3. Si las frecuencias son distintas, hacer cambio de frecuencias
    let effectiveFinal = effectiveOriginal;
    if (loanData.rateFrequency !== loanData.paymentFrequency) {
      effectiveFinal = convertEffectiveRateFrequency(
        effectiveOriginal,
        loanData.rateFrequency,
        loanData.paymentFrequency
      );
    }
    
    return effectiveFinal;
  }
  
  // ESCENARIO 2: Tasa Nominal Regular
  else if (loanData.rateType === "nominal" && !loanData.isAnticipated) {
    // 1. Calcular tasa efectiva en frecuencia original
    const effectiveOriginal = convertNominalToEffective(workingRate, rateFrequencyPeriods);
    
    // 2. Si las frecuencias son distintas, hacer cambio de frecuencias
    let effectiveFinal = effectiveOriginal;
    if (loanData.rateFrequency !== loanData.paymentFrequency) {
      effectiveFinal = convertEffectiveRateFrequency(
        effectiveOriginal,
        loanData.rateFrequency,
        loanData.paymentFrequency
      );
    }
    
    return effectiveFinal;
  }
  
  // ESCENARIO 3: Tasa Efectiva Anticipada
  else if (loanData.rateType === "efectiva" && loanData.isAnticipated) {
    // 1. Calcular tasa efectiva regular
    const effectiveRegular = convertAnticipatedToRegularRate(workingRate);
    
    // 2. Si las frecuencias son distintas, hacer cambio de frecuencias
    let effectiveFinal = effectiveRegular;
    if (loanData.rateFrequency !== loanData.paymentFrequency) {
      effectiveFinal = convertEffectiveRateFrequency(
        effectiveRegular,
        loanData.rateFrequency,
        loanData.paymentFrequency
      );
    }
    
    return effectiveFinal;
  }
  
  // ESCENARIO 4: Tasa Efectiva Regular
  else {
    // 1. Si las frecuencias son distintas, hacer cambio de frecuencias
    let effectiveFinal = workingRate;
    if (loanData.rateFrequency !== loanData.paymentFrequency) {
      effectiveFinal = convertEffectiveRateFrequency(
        workingRate,
        loanData.rateFrequency,
        loanData.paymentFrequency
      );
    }
    
    return effectiveFinal;
  }
}

// Función para obtener todas las tasas equivalentes en la frecuencia de pago
export function getAllRatesInPaymentFrequency(loanData: LoanData) {
  const effectiveRatePaymentFreq = getEffectiveRate(loanData);
  const paymentFrequencyPeriods = getPeriodsPerYear(loanData.paymentFrequency);
  
  // Calcular tasa nominal: j = i × m (tasa efectiva por períodos por año)
  const nominalRatePaymentFreq = effectiveRatePaymentFreq * paymentFrequencyPeriods;
  
  // Calcular tasa anticipada efectiva en frecuencia de pago
  const anticipatedEffectivePaymentFreq = convertRegularToAnticipatedRate(effectiveRatePaymentFreq);
  
  // Calcular tasa anticipada nominal: j = i × m (tasa anticipada efectiva por períodos por año)  
  const anticipatedNominalPaymentFreq = anticipatedEffectivePaymentFreq * paymentFrequencyPeriods;
  
  return {
    effectiveRate: effectiveRatePaymentFreq,
    nominalRate: nominalRatePaymentFreq,
    anticipatedEffectiveRate: anticipatedEffectivePaymentFreq,
    anticipatedNominalRate: anticipatedNominalPaymentFreq,
    frequency: loanData.paymentFrequency
  };
}

// Calcular el pago periódico considerando amortización o capitalización
export function calculatePeriodicPayment(
  principal: number,
  periodicRate: number,
  numberOfPeriods: number,
  annuityType: "amortización" | "capitalización" = "amortización"
): number {
  if (periodicRate === 0) {
    if (annuityType === "capitalización") {
      return 0; // Solo intereses, pero sin tasa no hay pago
    }
    return principal / numberOfPeriods;
  }

  if (annuityType === "capitalización") {
    // Solo pagar intereses, el capital se mantiene
    return principal * periodicRate;
  }

  // Amortización: fórmula tradicional de anualidades
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

// Generar la tabla de amortización o capitalización
export function generateAmortizationSchedule(
  effectiveRate: number,
  loanData: LoanData
): PaymentDetail[] {
  const periodicPayment = calculatePeriodicPayment(
    loanData.amount,
    effectiveRate,
    loanData.term,
    loanData.annuityType
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
    let principalPayment: number;
    let totalPayment: number;

    if (loanData.annuityType === "capitalización") {
      // En capitalización, solo se pagan intereses
      principalPayment = 0;
      totalPayment = interestPayment;
      
      // En el último pago de capitalización, también se paga el capital
      if (i === loanData.term) {
        principalPayment = remainingBalance;
        totalPayment = interestPayment + principalPayment;
        remainingBalance = 0;
      }
    } else {
      // Amortización normal
      principalPayment = periodicPayment - interestPayment;
      totalPayment = periodicPayment;
      
      // En el último pago, ajustar para que el saldo sea exactamente 0
      if (i === loanData.term) {
        principalPayment = remainingBalance;
        totalPayment = principalPayment + interestPayment;
      }
      
      remainingBalance -= principalPayment;
    }

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
      totalPayment,
      remainingBalance: Math.max(0, remainingBalance),
    });
  }

  return payments;
}
