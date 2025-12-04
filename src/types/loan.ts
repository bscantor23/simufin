export interface LoanData {
  currency: string;
  amount: number;
  term: number; // número de cuotas
  interestRate: number; // tasa de interés
  rateType: "efectiva" | "nominal"; // tipo de tasa
  rateFrequency:
    | "mensual"
    | "bimestral"
    | "trimestral"
    | "cuatrimestral"
    | "semestral"
    | "anual"; // frecuencia de la tasa
  paymentFrequency:
    | "mensual"
    | "bimestral"
    | "trimestral"
    | "cuatrimestral"
    | "semestral"
    | "anual"; // frecuencia de pago final
  isAnticipated: boolean; // si la tasa es anticipada
  annuityType: "amortización" | "capitalización"; // tipo de anualidad
}

export interface PaymentDetail {
  paymentNumber: number;
  paymentDate: string;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface LoanSimulation {
  loanData: LoanData;
  periodicPayment: number;
  totalInterest: number;
  totalAmount: number;
  payments: PaymentDetail[];
  effectiveRate: number;
  anticipatedEffectiveRate: number;
  nominalRate: number;
  anticipatedNominalRate: number;
  paymentFrequency: string; // Frecuencia de las tasas calculadas
  presentValue: number; // Valor presente (P)
  futureValue: number; // Valor futuro (S)
}
