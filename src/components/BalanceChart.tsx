"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { PaymentDetail } from "@/types/loan";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BalanceChartProps {
  readonly payments: PaymentDetail[];
  readonly currency: string;
  readonly paymentFrequency?:
    | "mensual"
    | "bimestral"
    | "trimestral"
    | "cuatrimestral"
    | "semestral"
    | "anual";
  readonly annuityType?: "amortización" | "capitalización";
}

export default function BalanceChart({
  payments,
  currency,
  paymentFrequency = "mensual",
  annuityType = "amortización",
}: BalanceChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  const chartData = {
    labels: payments.map((p) => p.paymentNumber),
    datasets: [
      {
        label: annuityType === "capitalización" ? "Saldo Actual" : "Saldo Pendiente",
        data: payments.map((p) => p.remainingBalance),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.1,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: "Cuota",
        data: payments.map((p) => p.totalPayment),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 3,
      },
      {
        label: "Total Pagado",
        data: payments.map((p, index) => {
          return payments
            .slice(0, index + 1)
            .reduce((sum, payment) => sum + payment.totalPayment, 0);
        }),
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        borderWidth: 3,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: "rgb(249, 115, 22)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: "Intereses Acumulados",
        data: payments.map((p, index) => {
          return payments
            .slice(0, index + 1)
            .reduce((sum, payment) => sum + payment.interestPayment, 0);
        }),
        borderColor: "rgb(220, 38, 127)",
        backgroundColor: "rgba(220, 38, 127, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: "rgb(220, 38, 127)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: false,
        padding: {
          top: 10,
          bottom: window.innerWidth < 640 ? 20 : 30,
        },
      },
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: window.innerWidth < 640 ? 10 : 20,
          fontSize: window.innerWidth < 640 ? 10 : 12,
          color: "#374151",
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = formatCurrency(context.parsed.y);
            return `${label}: ${value}`;
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
      },
    },
    scales: {
        x: {
        display: true,
        title: {
          display: true,
          text: "Cuotas",
          color: "#6B7280",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        ticks: {
          color: "#6B7280",
          maxTicksLimit: 12,
        },
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          color: "#6B7280",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        ticks: {
          color: "#6B7280",
          callback: (value: any) => new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
          }).format(value),
        },
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
      },
    },
  };

  const cuotaValue = payments.length > 0 ? payments[0].totalPayment : 0;
  const totalPagado = payments.reduce(
    (sum, payment) => sum + payment.totalPayment,
    0
  );
  const totalIntereses = payments.reduce(
    (sum, payment) => sum + payment.interestPayment,
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      {/* Título personalizado con tooltip */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-700">
          Evolución del Préstamo - Saldo y Pagos
        </h3>
        <div className="relative group">
          <svg
            className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Evolución con pagos periódicos según plan de amortización/capitalización
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>
      <div className="h-64 sm:h-80 md:h-96 mb-6">
        <Line data={chartData} options={options} />
      </div>

      {/* Resumen con el mismo formato que compound interest */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">Valor Cuota</p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(cuotaValue)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Pagado</p>
          <p className="text-lg font-bold text-orange-600">
            {formatCurrency(totalPagado)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Intereses</p>
          <p className="text-lg font-bold text-pink-600">
            {formatCurrency(totalIntereses)}
          </p>
        </div>
      </div>
    </div>
  );
}
