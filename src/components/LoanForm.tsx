"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Select } from "./ui/select";
import { NumericInput } from "./ui/numeric-input";
import InfoTooltip from "./ui/info-tooltip";
import { LoanData } from "@/types/loan";

const currencies = [
  { value: "COP", label: "COP" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

const rateTypes = [
  { value: "efectiva", label: "Tasa Efectiva" },
  { value: "nominal", label: "Tasa Nominal" },
];

const frequencies = [
  { value: "mensual", label: "Mensual" },
  { value: "bimestral", label: "Bimestral" },
  { value: "trimestral", label: "Trimestral" },
  { value: "cuatrimestral", label: "Cuatrimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

const anticipatedOptions = [
  { value: "no", label: "No" },
  { value: "si", label: "Sí" },
];

const annuityOptions = [
  { value: "amortización", label: "Amortización" },
  { value: "capitalización", label: "Capitalización" },
];

const annuityTimingOptions = [
  { value: "vencida", label: "Vencida" },
  { value: "anticipada", label: "Anticipada" },
];

export default function LoanForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoanData>({
    currency: "COP",
    amount: 0,
    term: 0,
    interestRate: 0,
    rateType: "efectiva",
    rateFrequency: "mensual",
    paymentFrequency: "mensual",
    isAnticipated: false,
    annuityType: "amortización",
    annuityTiming: "vencida",
  });

  // Cargar datos del localStorage al montar el componente
  useEffect(() => {
    const savedLoanData = localStorage.getItem("loanData");
    if (savedLoanData) {
      try {
        const parsedData: LoanData = JSON.parse(savedLoanData);
        // Agregar valores por defecto si no existen (compatibilidad hacia atrás)
        const completeLoanData: LoanData = {
          ...parsedData,
          amount: Number(parsedData.amount),
          term: Number(parsedData.term),
          interestRate: Number(parsedData.interestRate) * 100, // Convert back to percentage
          rateType: parsedData.rateType || "efectiva",
          rateFrequency:
            parsedData.rateFrequency ||
            parsedData.paymentFrequency ||
            "mensual",
          paymentFrequency: parsedData.paymentFrequency || "mensual",
          isAnticipated: parsedData.isAnticipated ?? false,
          annuityType: parsedData.annuityType || "amortización",
          annuityTiming: parsedData.annuityTiming || "vencida",
        };
        setFormData(completeLoanData);
      } catch (error) {
        console.error("Error parsing saved loan data:", error);
      }
    }
  }, []);

  // Validar si el formulario está completo
  const isFormValid =
    formData.currency !== "" &&
    Number(formData.amount) > 0 &&
    Number(formData.term) > 0 &&
    Number(formData.interestRate) > 0 &&
    Number(formData.interestRate) <= 100;

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      currency: e.target.value,
    }));
  };

  const handleRateTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      rateType: e.target.value as "efectiva" | "nominal",
    }));
  };

  const handleRateFrequencyChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      rateFrequency: e.target.value as LoanData["rateFrequency"],
    }));
  };

  const handlePaymentFrequencyChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      paymentFrequency: e.target.value as LoanData["paymentFrequency"],
    }));
  };

  const handleIsAnticipatedChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      isAnticipated: e.target.value === "si",
    }));
  };

  const handleAnnuityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      annuityType: e.target.value as LoanData["annuityType"],
    }));
  };

  const handleAnnuityTimingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      annuityTiming: e.target.value as LoanData["annuityTiming"],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure all numeric values are properly converted for validation
    const amount = Number(formData.amount);
    const term = Number(formData.term);
    const interestRate = Number(formData.interestRate);
    const tranformedRate = Number((interestRate / 100).toFixed(3));

    // Validación más específica
    const errors: string[] = [];

    if (amount <= 0) {
      errors.push("El valor del préstamo debe ser mayor a 0");
    }
    if (term <= 0) {
      errors.push("El número de cuotas debe ser mayor a 0");
    }
    if (interestRate <= 0) {
      errors.push("La tasa de interés debe ser mayor a 0");
    }
    if (interestRate > 100) {
      errors.push("La tasa de interés no puede ser mayor al 100%");
    }

    if (errors.length > 0) {
      alert("Errores encontrados:\n" + errors.join("\n"));
      return;
    }

    // Ensure all numeric values are properly converted to numbers
    const loanDataToStore = {
      ...formData,
      amount,
      term,
      interestRate: tranformedRate,
    };

    // Guardar datos en localStorage y navegar a la página de simulación
    localStorage.setItem("loanData", JSON.stringify(loanDataToStore));
    router.push("/simulation");
  };

  return (
    <div className="max-w-lg mx-auto pt-8">
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Primera fila: Tipo de cambio y Valor del préstamo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 mb-6">
          <div className="relative md:col-span-1">
            <Select
              id="currency"
              options={currencies}
              value={formData.currency}
              onChange={handleCurrencyChange}
              required
            />
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500">Tipo de cambio</p>
              <InfoTooltip content="Moneda en la que se realizará el préstamo">
                <span></span>
              </InfoTooltip>
            </div>
          </div>

          <div className="relative md:col-span-2">
            <div className="flex items-baseline space-x-3">
              <span className="text-lg font-bold text-gray-600">$</span>
              <NumericInput
                id="amount"
                placeholder="200000,50"
                value={formData.amount}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, amount: value }))
                }
                allowDecimals={true}
              />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500">Valor del préstamo</p>
              <InfoTooltip content="Monto total del préstamo que se solicita">
                <span></span>
              </InfoTooltip>
            </div>
          </div>
        </div>

        {/* Segunda fila: Número de cuotas y Frecuencia de pago final */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 mb-6">
          <div className="relative md:col-span-1">
            <NumericInput
              id="term"
              placeholder="12"
              value={formData.term}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, term: value }))
              }
              allowDecimals={false}
            />
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500">Número de cuotas</p>
              <InfoTooltip content="Número total de pagos que se realizarán durante la vida del préstamo">
                <span></span>
              </InfoTooltip>
            </div>
          </div>

          <div className="relative md:col-span-2">
            <Select
              id="paymentFrequency"
              options={frequencies}
              value={formData.paymentFrequency}
              onChange={handlePaymentFrequencyChange}
              required
            />
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500">Frecuencia de pago</p>
              <InfoTooltip content="Periodicidad con la que se realizarán los pagos del préstamo">
                <span></span>
              </InfoTooltip>
            </div>
          </div>
        </div>

        {/* Tercera fila: Tipo de tasa, Frecuencia inicial y Tasa */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-x-8 mb-6">
          <div className="relative md:col-span-3">
            <Select
              id="rateType"
              options={rateTypes}
              value={formData.rateType}
              onChange={handleRateTypeChange}
              required
            />
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500">Tipo de tasa de interés</p>
              <InfoTooltip content="Efectiva: tasa real de interés. Nominal: tasa que se anuncia antes de considerar capitalización">
                <span></span>
              </InfoTooltip>
            </div>
          </div>

          <div className="relative md:col-span-2">
            <Select
              id="rateFrequency"
              options={frequencies}
              value={formData.rateFrequency}
              onChange={handleRateFrequencyChange}
              required
            />
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500">Frecuencia tasa</p>
              <InfoTooltip content="Periodicidad original de la tasa de interés que posteriormente se transforma a la frecuencia de pago final">
                <span></span>
              </InfoTooltip>
            </div>
          </div>

          <div className="relative md:col-span-2">
            <div className="flex items-baseline space-x-3">
              <div className="flex-1">
                <NumericInput
                  id="interestRate"
                  placeholder="10"
                  value={formData.interestRate}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, interestRate: value }))
                  }
                  allowDecimals={true}
                  maxValue={100}
                  showValidationError={true}
                  validationErrorMessage="La tasa de interés no puede ser mayor al 100%"
                />
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">Tasa</p>
                  <InfoTooltip content="Porcentaje de interés que se aplicará según el tipo y frecuencia seleccionada">
                    <span></span>
                  </InfoTooltip>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-600">%</span>
            </div>
          </div>
        </div>

        {/* Cuarta fila: Tasa anticipada y Tipo de anualidad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 mb-6">
          <div className="relative">
            <Select
              id="isAnticipated"
              options={anticipatedOptions}
              value={formData.isAnticipated ? "si" : "no"}
              onChange={handleIsAnticipatedChange}
              required
            />
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500">¿Tasa anticipada?</p>
              <InfoTooltip content="Tasa anticipada: el interés se cobra por adelantado. Tasa regular: el interés se cobra al final del período">
                <span></span>
              </InfoTooltip>
            </div>
          </div>

          <div className="relative">
            <Select
              id="annuityType"
              options={annuityOptions}
              value={formData.annuityType}
              onChange={handleAnnuityTypeChange}
              required
            />
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500">
                Modalidad
              </p>
              <InfoTooltip content="Amortización: se pagan intereses y capital gradualmente reduciendo la deuda. Capitalización: solo se pagan intereses, el capital se mantiene">
                <span></span>
              </InfoTooltip>
            </div>
          </div>

          <div className="relative">
            <Select
              id="annuityTiming"
              options={annuityTimingOptions}
              value={formData.annuityTiming}
              onChange={handleAnnuityTimingChange}
              required
            />
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500">
                Momento de pago
              </p>
              <InfoTooltip content="Vencida: pagos al final del período. Anticipada: pagos al inicio del período">
                <span></span>
              </InfoTooltip>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-center">
          <Button
            type="submit"
            disabled={!isFormValid}
            className="px-16 py-6 text-xl font-black wei uppercase rounded-3xl transition-all duration-200 hover:shadow-xl"
          >
            SIMULAR
          </Button>
        </div>
      </form>
    </div>
  );
}
