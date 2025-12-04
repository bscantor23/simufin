"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Select } from "./ui/select";
import { NumericInput } from "./ui/numeric-input";
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

const paymentFrequencies = [
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

export default function LoanForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoanData>({
    currency: "COP",
    amount: 0,
    term: 0,
    interestRate: 0,
    rateType: "efectiva",
    paymentFrequency: "mensual",
    isAnticipated: false,
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
          paymentFrequency: parsedData.paymentFrequency || "mensual",
          isAnticipated: parsedData.isAnticipated ?? false,
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
    <div className="max-w-lg mx-auto p-8">
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Primera fila: Moneda y Valor del Préstamo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="relative">
            <Select
              id="currency"
              options={currencies}
              value={formData.currency}
              onChange={handleCurrencyChange}
              required
            />
          </div>

          <div className="relative md:col-span-3">
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
          </div>
        </div>

        {/* Segunda fila: Número de Cuotas y Frecuencia de Pago */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative md:col-span-2">
            <NumericInput
              id="term"
              placeholder="¿A cuántas cuotas lo simulamos?"
              value={formData.term}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, term: value }))
              }
              allowDecimals={false}
            />
          </div>

          <div className="relative">
            <Select
              id="paymentFrequency"
              options={paymentFrequencies}
              value={formData.paymentFrequency}
              onChange={handlePaymentFrequencyChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Frecuencia de pago</p>
          </div>
        </div>

        {/* Tercera fila: Tipo de Tasa y Tasa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative md:col-span-2">
            <Select
              id="rateType"
              options={rateTypes}
              value={formData.rateType}
              onChange={handleRateTypeChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Tipo de tasa de interés
            </p>
          </div>

          <div className="relative">
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
                <p className="text-xs text-gray-500 mt-1">Tasa</p>
              </div>
              <span className="text-lg font-bold text-gray-600">%</span>
            </div>
          </div>
        </div>

        {/* Cuarta fila: Tasa Anticipada */}
        <div className="grid grid-cols-1 gap-8">
          <div className="relative">
            <Select
              id="isAnticipated"
              options={anticipatedOptions}
              value={formData.isAnticipated ? "si" : "no"}
              onChange={handleIsAnticipatedChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              ¿La tasa es anticipada?
            </p>
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
