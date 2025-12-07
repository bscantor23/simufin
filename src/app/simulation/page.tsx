"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoanData, LoanSimulation } from "@/types/loan";
import BalanceChart from "@/components/BalanceChart";
import CompoundInterestChart from "@/components/CompoundInterestChart";
import PaymentDetailView from "@/components/PaymentDetailView";
import CalculationDetailsPanel from "@/components/CalculationDetailsPanel";
import InfoTooltip from "@/components/ui/info-tooltip";
import SpiralFooter from "@/components/ui/spiral-footer";
import { Button } from "@/components/ui/button";
import {
  generateAmortizationSchedule,
  calculatePeriodicPayment,
  calculateCompoundInterest,
  getPeriodsPerYear,
  getEffectiveRate,
  getAllRatesInPaymentFrequency,
  formatPercentage,
} from "@/lib/financial-utils";
import { CurrencyFormatter } from "@/lib/currency-formatter";

// Componente interno para tabla resumen de pagos
interface PaymentSummaryTableInternalProps {
  readonly payments: any[];
  readonly currency: CurrencyFormatter;
  readonly annuityType: "amortización" | "capitalización";
  readonly initialAmount: number;
  readonly annuityTiming: "vencida" | "anticipada";
}

function PaymentSummaryTableInternal({
  payments,
  currency,
  annuityType,
  initialAmount,
  annuityTiming,
}: PaymentSummaryTableInternalProps) {

  // Crear array con período 0 + todos los pagos (solo período 0 para amortización)
  const allRows = [
    ...(annuityType === "amortización"
      ? [
          {
            paymentNumber: 0,
            remainingBalance: initialAmount,
            interestPayment: 0,
            totalPayment: 0,
            principalPayment: 0,
            isInitial: true,
          },
        ]
      : []),
    ...payments.map((payment) => ({ ...payment, isInitial: false })),
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      {/* Header fijo */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Tabla Resumen de Pagos
        </h3>
      </div>

      {/* Contenido de la tabla */}
      <div className="mt-4">
          <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periodo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {annuityType === "amortización"
                      ? "Amortización"
                      : "Incremento"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allRows.map((row, index) => {
                  if (row.isInitial) {
                    // Período 0 - solo mostrar saldo inicial
                    return (
                      <tr key={0} className="bg-blue-50 hover:bg-blue-100">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                          0
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                          {currency.format(row.remainingBalance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          -
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          -
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          -
                        </td>
                      </tr>
                    );
                  }

                  // Períodos normales
                  const payment = row;
                  // Para capitalización, mostrar el incremento (cuota + interés)
                  // Para amortización, mostrar amortización de capital
                  const valorMostrar =
                    annuityType === "capitalización"
                      ? payment.principalPayment + payment.interestPayment // En capitalización, incremento = cuota + interés
                      : payment.principalPayment; // En amortización, es el capital que se paga

                  return (
                    <tr
                      key={payment.paymentNumber}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.paymentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {currency.format(payment.remainingBalance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {currency.format(payment.interestPayment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {currency.format(payment.totalPayment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {currency.format(valorMostrar)}
                      </td>
                    </tr>
                  );
                })}

                {/* Fila de totales */}
                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    TOTAL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {currency.format(
                      annuityType === "capitalización"
                        ? payments[payments.length - 1]?.remainingBalance || 0 // Saldo final acumulado
                        : initialAmount // Monto inicial del préstamo
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {currency.format(
                      payments.reduce(
                        (sum, payment) => sum + payment.interestPayment,
                        0
                      )
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {currency.format(
                      payments.reduce(
                        (sum, payment) => sum + payment.totalPayment,
                        0
                      )
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {currency.format(
                      annuityType === "capitalización"
                        ? payments.reduce(
                            (sum, payment) =>
                              sum +
                              payment.principalPayment +
                              payment.interestPayment,
                            0
                          ) // Total incrementos
                        : payments.reduce(
                            (sum, payment) => sum + payment.principalPayment,
                            0
                          ) // Total amortización
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Información adicional */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Total de períodos:</strong> {payments.length} |
              <strong className="ml-2">Modalidad:</strong>{" "}
              {annuityType === "capitalización"
                ? "Capitalización"
                : "Amortización"} |
              <strong className="ml-2">Anualidad:</strong>{" "}
              {annuityTiming === "vencida" ? "Vencida" : "Anticipada"}
            </p>
          </div>
      </div>
    </div>
  );
}

export default function SimulationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [simulation, setSimulation] = useState<LoanSimulation | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [currency, setCurrency] = useState<CurrencyFormatter | null>(null);

  useEffect(() => {
    const loanDataString = localStorage.getItem("loanData");

    if (!loanDataString) {
      router.push("/");
      return;
    }

    try {
      const loanData: LoanData = JSON.parse(loanDataString);
      const completeLoanData: LoanData = {
        ...loanData,
        rateType: loanData.rateType || "efectiva",
        rateFrequency:
          loanData.rateFrequency || loanData.paymentFrequency || "mensual",
        paymentFrequency: loanData.paymentFrequency || "mensual",
        isAnticipated: loanData.isAnticipated ?? false,
        annuityType: loanData.annuityType || "amortización",
      };

      const calculatedSimulation = calculateLoanSimulation(completeLoanData);

      console.log(calculatedSimulation);
      setSimulation(calculatedSimulation);
      setCurrency(new CurrencyFormatter(loanData.currency));
    } catch (error) {
      console.error("Error parsing loan data:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const calculateLoanSimulation = (
    loanData: LoanData
  ): LoanSimulation | null => {
    try {
      const periods = getPeriodsPerYear(loanData.paymentFrequency);

      const effectiveRate = getEffectiveRate(loanData);
      const allRates = getAllRatesInPaymentFrequency(loanData);

      const payments = generateAmortizationSchedule(effectiveRate, loanData);

      const periodicPayment = calculatePeriodicPayment(
        loanData.amount,
        effectiveRate,
        loanData.term,
        loanData.annuityType,
        loanData.annuityTiming
      );

      // Calcular totales
      const totalInterest = payments.reduce(
        (sum, payment) => sum + payment.interestPayment,
        0
      );
      const totalAmount = loanData.amount + totalInterest;
      const presentValue = loanData.amount;
      const futureValue = calculateCompoundInterest(effectiveRate, loanData);

      return {
        loanData,
        periodicPayment,
        totalInterest,
        totalAmount,
        payments,
        effectiveRate: allRates.effectiveRate,
        anticipatedEffectiveRate: allRates.anticipatedEffectiveRate,
        nominalRate: allRates.nominalRate,
        anticipatedNominalRate: allRates.anticipatedNominalRate,
        paymentFrequency: allRates.frequency,
        presentValue: presentValue || loanData.amount,
        futureValue: futureValue || totalAmount,
      };
    } catch (error) {
      console.error("Error in calculateLoanSimulation:", error);
      return {
        loanData,
        periodicPayment: 0,
        totalInterest: 0,
        totalAmount: loanData.amount,
        payments: [],
        effectiveRate: loanData.interestRate || 0,
        anticipatedEffectiveRate: loanData.interestRate || 0,
        nominalRate: loanData.interestRate || 0,
        anticipatedNominalRate: loanData.interestRate || 0,
        paymentFrequency: loanData.paymentFrequency,
        presentValue: loanData.amount,
        futureValue: loanData.amount,
      };
    }
  };

  const getFrequencyAbbreviation = (frequency: string): string => {
    const abbreviations: Record<string, string> = {
      anual: "A",
      mensual: "M",
      bimestral: "B",
      trimestral: "T",
      cuatrimestral: "C",
      semestral: "S",
    };
    return abbreviations[frequency] || "A";
  };

  const getFrequencyFullName = (frequency: string): string => {
    const fullNames: Record<string, string> = {
      anual: "Anual",
      mensual: "Mensual",
      bimestral: "Bimestral",
      trimestral: "Trimestral",
      cuatrimestral: "Cuatrimestral",
      semestral: "Semestral",
    };
    return fullNames[frequency] || "Anual";
  };

  const generateRateConversionText = (simulation: LoanSimulation): string => {
    const inputRate = formatPercentage(simulation.loanData.interestRate);

    const inputRateTypeFullName =
      simulation.loanData.rateType === "nominal" ? "Nominal" : "Efectiva";
    const inputFreqFullName = getFrequencyFullName(
      simulation.loanData.rateFrequency || "anual"
    );
    const anticipatedText = simulation.loanData.isAnticipated
      ? " Anticipada"
      : "";

    const outputRate = formatPercentage(simulation.effectiveRate);
    const outputFreqFullName = getFrequencyFullName(
      simulation.loanData.paymentFrequency || "mensual"
    );

    return `${inputRate} ${inputRateTypeFullName} ${inputFreqFullName} ${anticipatedText},  ${outputRate} Efectiva ${outputFreqFullName}`;
  };

  const handleBackToForm = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen font-roboto flex items-center justify-center"
        style={{ backgroundColor: "#f5f5f5" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Calculando simulación...</p>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div
        className="min-h-screen font-roboto flex items-center justify-center"
        style={{ backgroundColor: "#f5f5f5" }}
      >
        <div className="text-center">
          <p className="text-gray-700 mb-4">
            No se encontraron datos de préstamo.
          </p>
          <Button onClick={handleBackToForm}>Volver al formulario</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-roboto relatives"
      style={{ backgroundColor: "#f5f5f5" }}
    >
      {/* Panel Lateral de Información de Entrada */}
      {showInputModal && (
        <div className="fixed left-4 top-24 bg-white rounded-lg shadow-lg border border-gray-200 mt-2 p-4 z-30 w-72 max-h-screen overflow-y-auto">
          {/* Header con botón cerrar */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Información de Entrada
            </h3>
            <button
              onClick={() => setShowInputModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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

          {/* Contenido - Cada dato en una fila */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Moneda</p>
              <p className="text-base font-bold text-yellow-600 capitalize">
                {simulation.loanData.currency || "peso"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Valor del Préstamo</p>
              <p className="text-base font-bold text-yellow-600">
                {currency?.format(simulation.loanData.amount)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Número de Cuotas</p>
              <p className="text-base font-bold text-yellow-600">
                {simulation.loanData.term}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Frecuencia de Pago</p>
              <p className="text-base font-bold text-yellow-600 capitalize">
                {simulation.loanData.paymentFrequency || "mensual"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Tipo de Tasa</p>
              <p className="text-base font-bold text-yellow-600 capitalize">
                {simulation.loanData.rateType || "efectiva"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">
                Frecuencia de la Tasa
              </p>
              <p className="text-base font-bold text-yellow-600 capitalize">
                {simulation.loanData.rateFrequency || "anual"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Tasa Ingresada</p>
              <p className="text-base font-bold text-yellow-600">
                {formatPercentage(simulation.loanData.interestRate)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">¿Tasa Anticipada?</p>
              <p className="text-base font-bold text-yellow-600">
                {simulation.loanData.isAnticipated ? "Sí" : "No"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Modalidad</p>
              <p className="text-base font-bold text-yellow-600 capitalize">
                {simulation.loanData.annuityType || "amortización"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">
                ¿Vencida o Anticipada?
              </p>
              <p className="text-base font-bold text-yellow-600 capitalize">
                {simulation.loanData.annuityTiming || "vencida"}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Navbar */}
      <nav
        className="bg-white shadow-lg relative z-10"
        style={{ height: "80px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Botón Atrás */}
            <button
              onClick={handleBackToForm}
              className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Atrás
            </button>

            {/* Logo/Título */}
            <h1 className="text-3xl font-bold text-gray-900">SimuFin</h1>

            {/* Espacio vacío para balancear */}
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Resultado de la Simulación
            </h2>
          </div>

          {/* Botón para mostrar información de entrada y conversión de tasas */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setShowInputModal(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Ver Información de Entrada
            </button>

            {/* Conversión de tasas - Al final de la fila */}
            <div className="text-sm text-gray-700 font-medium flex items-center gap-1">
              {formatPercentage(simulation.loanData.interestRate)}
              {simulation.loanData.rateType === "nominal" ? "N" : "E"}
              {getFrequencyAbbreviation(simulation.loanData.rateFrequency)}
              {simulation.loanData.isAnticipated ? " (Anticipada)" : ""}
              {" => "}
              {formatPercentage(simulation.effectiveRate)}E
              {getFrequencyAbbreviation(simulation.loanData.paymentFrequency)}
              <InfoTooltip content={generateRateConversionText(simulation)}>
                <span></span>
              </InfoTooltip>
            </div>
          </div>

          {/* Resumen del préstamo */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {/* Primera fila: Información básica */}
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              <div className="text-center">
                <p className="text-sm text-gray-600">Monto del Préstamo (P)</p>
                <p className="text-lg font-bold text-blue-600">
                  {currency?.format(simulation.presentValue)}
                </p>
                <InfoTooltip content="Cantidad de préstamo inicial">
                  <div className="flex justify-center mt-1">
                    <span></span>
                  </div>
                </InfoTooltip>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Cuota por Periodo (C)</p>
                <p className="text-lg font-bold text-green-600">
                  {currency?.format(simulation.periodicPayment)}
                </p>
                <InfoTooltip content="Valor fijo por pagar en cada periodo">
                  <div className="flex justify-center mt-1">
                    <span></span>
                  </div>
                </InfoTooltip>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Intereses</p>
                <p className="text-lg font-bold text-red-600">
                  {currency?.format(simulation.totalInterest)}
                </p>
                <InfoTooltip content="Dinero adicional por pagar por el costo de usar el dinero prestado durante todo el plazo">
                  <div className="flex justify-center mt-1">
                    <span></span>
                  </div>
                </InfoTooltip>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Pagado</p>
                <p className="text-lg font-bold text-orange-600">
                  {currency?.format(simulation.totalAmount)}
                </p>
                <InfoTooltip content="Suma total de dinero por pagar al finalizar el préstamo">
                  <div className="flex justify-center mt-1">
                    <span></span>
                  </div>
                </InfoTooltip>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Valor Futuro sin Abonos</p>
                <p className="text-lg font-bold text-purple-600">
                  {currency?.format(simulation.futureValue)}
                </p>
                <InfoTooltip content="Cuánto se pagaría si no se hicieran abonos durante el plazo">
                  <div className="flex justify-center mt-1">
                    <span></span>
                  </div>
                </InfoTooltip>
              </div>
            </div>

            {/* Segunda fila: Información de tasas */}
            <div className="border-t pt-6">
              <div
                className={`grid gap-6 ${
                  simulation.loanData.isAnticipated
                    ? "md:grid-cols-5"
                    : "md:grid-cols-4"
                }`}
              >
                {/* Si NO es anticipado: mostrar tasa efectiva, frecuencia de pago, tasa nominal y tipo de tasa */}
                {!simulation.loanData.isAnticipated && (
                  <>
                    {/* Campo 1: Tasa Efectiva */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Tasa Efectiva {simulation.loanData.paymentFrequency}
                      </p>
                      <p className="text-lg font-bold text-yellow-600">
                        {formatPercentage(simulation.effectiveRate)}
                      </p>
                      <InfoTooltip content="Tasa efectiva en la frecuencia de pago">
                        <div className="flex justify-center">
                          <span></span>
                        </div>
                      </InfoTooltip>
                    </div>

                    {/* Campo 2: Frecuencia de Pago */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Frecuencia de Pago
                      </p>
                      <p className="text-lg font-bold text-indigo-600 capitalize">
                        {simulation.loanData.paymentFrequency || "mensual"}
                      </p>
                      <InfoTooltip content="Periodicidad de pagos del préstamo">
                        <div className="flex justify-center mt-1">
                          <span></span>
                        </div>
                      </InfoTooltip>
                    </div>

                    {/* Campo 3: Tasa Nominal */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Tasa Nominal {simulation.loanData.paymentFrequency}
                      </p>
                      <p className="text-lg font-bold text-teal-600">
                        {formatPercentage(simulation.nominalRate)}
                      </p>
                      <InfoTooltip content="Tasa nominal en la frecuencia de pago">
                        <div className="flex justify-center mt-1">
                          <span></span>
                        </div>
                      </InfoTooltip>
                    </div>

                    {/* Campo 4: Tipo de Tasa */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Tipo de Tasa</p>
                      <p className="text-lg font-bold text-purple-600 capitalize">
                        {simulation.loanData.isAnticipated
                          ? "Anticipada"
                          : "Vencida"}
                      </p>
                      <InfoTooltip
                        content={
                          simulation.loanData.isAnticipated
                            ? "Los intereses se calculan y pagan al inicio del período"
                            : "Los intereses se calculan y pagan al final del período"
                        }
                      >
                        <div className="flex justify-center mt-1">
                          <span></span>
                        </div>
                      </InfoTooltip>
                    </div>
                  </>
                )}

                {/* Si ES anticipado: mostrar tasa efectiva anticipada, tasa efectiva, frecuencia de pago, tasa nominal, tasa nominal anticipada, tipo de tasa */}
                {simulation.loanData.isAnticipated && (
                  <>
                    {/* Campo 1: Tasa Efectiva Anticipada */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Tasa Efectiva Anticipada{" "}
                        {simulation.loanData.paymentFrequency}
                      </p>
                      <p className="text-lg font-bold text-red-600">
                        {formatPercentage(simulation.anticipatedEffectiveRate)}
                      </p>
                      <InfoTooltip content="Tasa efectiva anticipada en la frecuencia de pago">
                        <div className="flex justify-center mt-1">
                          <span></span>
                        </div>
                      </InfoTooltip>
                    </div>

                    {/* Campo 2: Tasa Efectiva Regular */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Tasa Efectiva {simulation.loanData.paymentFrequency}
                      </p>
                      <p className="text-lg font-bold text-yellow-600">
                        {formatPercentage(simulation.effectiveRate)}
                      </p>
                      <InfoTooltip content="Tasa efectiva regular en la frecuencia de pago">
                        <div className="flex justify-center">
                          <span></span>
                        </div>
                      </InfoTooltip>
                    </div>

                    {/* Campo 3: Frecuencia de Pago */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Frecuencia de Pago
                      </p>
                      <p className="text-lg font-bold text-indigo-600 capitalize">
                        {simulation.loanData.paymentFrequency || "mensual"}
                      </p>
                      <InfoTooltip content="Periodicidad de pagos del préstamo">
                        <div className="flex justify-center mt-1">
                          <span></span>
                        </div>
                      </InfoTooltip>
                    </div>

                    {/* Campo 4: Tasa Nominal Regular */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Tasa Nominal {simulation.loanData.paymentFrequency}
                      </p>
                      <p className="text-lg font-bold text-teal-600">
                        {formatPercentage(simulation.nominalRate)}
                      </p>
                      <InfoTooltip content="Tasa nominal regular en la frecuencia de pago">
                        <div className="flex justify-center mt-1">
                          <span></span>
                        </div>
                      </InfoTooltip>
                    </div>

                    {/* Campo 5: Tasa Nominal Anticipada */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Tasa Nominal Anticipada{" "}
                        {simulation.loanData.paymentFrequency}
                      </p>
                      <p className="text-lg font-bold text-cyan-600">
                        {formatPercentage(simulation.anticipatedNominalRate)}
                      </p>
                      <InfoTooltip content="Tasa nominal anticipada en la frecuencia de pago">
                        <div className="flex justify-center mt-1">
                          <span></span>
                        </div>
                      </InfoTooltip>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contenido principal: Gráficos en una fila, detalle en otra */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <CompoundInterestChart
                  loanData={simulation.loanData}
                  currency={simulation.loanData.currency}
                />
              </div>

              {/* Gráfica de escalera descendente */}
              <div>
                <BalanceChart
                  payments={simulation.payments}
                  currency={simulation.loanData.currency}
                  paymentFrequency={simulation.loanData.paymentFrequency}
                  annuityType={
                    simulation.loanData.annuityType as
                      | "amortización"
                      | "capitalización"
                  }
                />
              </div>
            </div>

            {/* Segunda fila: Detalle de pagos */}
            <div className="space-y-8">
              {/* Tabla resumen de pagos */}
              <PaymentSummaryTableInternal
                payments={simulation.payments}
                currency={currency as CurrencyFormatter}
                annuityType={
                  simulation.loanData.annuityType as
                    | "amortización"
                    | "capitalización"
                }
                initialAmount={simulation.loanData.amount}
                annuityTiming={simulation.loanData.annuityTiming || "vencida"}
              />

              {/* Vista detallada por años */}
              <PaymentDetailView
                payments={simulation.payments}
                currency={currency as CurrencyFormatter}
                paymentFrequency={simulation.loanData.paymentFrequency}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Details Panel */}
      <CalculationDetailsPanel
        simulation={simulation}
        currency={currency as CurrencyFormatter}
      />
      <SpiralFooter />
    </div>
  );
}
