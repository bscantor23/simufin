export interface LoanData {
  currency: string;
  amount: number;
  term: number; // número de cuotas
  interestRate: number; // tasa de interés
  rateType: "efectiva" | "nominal"; // tipo de tasa
  paymentFrequency:
    | "mensual"
    | "bimestral"
    | "trimestral"
    | "cuatrimestral"
    | "semestral"
    | "anual"; // frecuencia de pago
  isAnticipated: boolean; // si la tasa es anticipada
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
  presentValue: number; // Valor presente (P)
  futureValue: number; // Valor futuro (S)
}
