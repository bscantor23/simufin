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
  convertEffectiveToNominal,
  convertRegularToAnticipatedRate,
  formatPercentage,
} from "@/lib/financial-utils";
import { CurrencyFormatter } from "@/lib/currency-formatter";

export default function SimulationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [simulation, setSimulation] = useState<LoanSimulation | null>(null);
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
        paymentFrequency: loanData.paymentFrequency || "mensual",
        isAnticipated: loanData.isAnticipated ?? false,
      };

      const calculatedSimulation = calculateLoanSimulation(completeLoanData);
      
      console.log(calculatedSimulation)
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
      const anticipatedEffectiveRate =
        convertRegularToAnticipatedRate(effectiveRate);

      const nominalRate = convertEffectiveToNominal(effectiveRate, periods);
      const anticipatedNominalRate =
        convertRegularToAnticipatedRate(nominalRate);

      const payments = generateAmortizationSchedule(effectiveRate, loanData);

      const periodicPayment = calculatePeriodicPayment(
        loanData.amount,
        effectiveRate,
        loanData.term
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
        effectiveRate,
        anticipatedEffectiveRate,
        nominalRate,
        anticipatedNominalRate,
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
        presentValue: loanData.amount,
        futureValue: loanData.amount,
      };
    }
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
      className="min-h-screen font-roboto relative"
      style={{ backgroundColor: "#f5f5f5" }}
    >
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
                <p className="text-sm text-gray-600">Valor Futuro (S)</p>
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
                    : "md:grid-cols-3"
                }`}
              >
                {/* Si NO es anticipado: mostrar solo tasa efectiva, frecuencia de pago y tasa nominal */}
                {!simulation.loanData.isAnticipated && (
                  <>
                    {/* Campo 1: Tasa Efectiva */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Tasa Efectiva</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {formatPercentage(simulation.effectiveRate)}
                      </p>
                      <InfoTooltip content="Tasa efectiva">
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
                      <p className="text-sm text-gray-600">Tasa Nominal</p>
                      <p className="text-lg font-bold text-teal-600">
                        {formatPercentage(simulation.nominalRate)}
                      </p>
                      <InfoTooltip content="Tasa nominal">
                        <div className="flex justify-center mt-1">
                          <span></span>
                        </div>
                      </InfoTooltip>
                    </div>
                  </>
                )}

                {/* Si ES anticipado: mostrar tasa efectiva anticipada, tasa efectiva, frecuencia de pago, tasa nominal, tasa nominal anticipada */}
                {simulation.loanData.isAnticipated && (
                  <>
                    {/* Campo 1: Tasa Efectiva Anticipada */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Tasa Efectiva Anticipada
                      </p>
                      <p className="text-lg font-bold text-red-600">
                        {formatPercentage(simulation.anticipatedEffectiveRate)}
                      </p>
                      <InfoTooltip content="Tasa efectiva anticipada">
                        <div className="flex justify-center mt-1">
                          <span></span>
                        </div>
                      </InfoTooltip>
                    </div>

                    {/* Campo 2: Tasa Efectiva Regular */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Tasa Efectiva</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {formatPercentage(simulation.effectiveRate)}
                      </p>
                      <InfoTooltip content="Tasa efectiva regular">
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
                      <p className="text-sm text-gray-600">Tasa Nominal</p>
                      <p className="text-lg font-bold text-teal-600">
                        {formatPercentage(simulation.nominalRate)}
                      </p>
                      <InfoTooltip content="Tasa nominal regular">
                        <div className="flex justify-center mt-1">
                          <span></span>
                        </div>
                      </InfoTooltip>
                    </div>

                    {/* Campo 5: Tasa Nominal Anticipada */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Tasa Nominal Anticipada
                      </p>
                      <p className="text-lg font-bold text-cyan-600">
                        {formatPercentage(simulation.anticipatedNominalRate)}
                      </p>
                      <InfoTooltip content="Tasa nominal anticipada">
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
                />
              </div>
            </div>

            {/* Segunda fila: Detalle de pagos */}
            <div>
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
