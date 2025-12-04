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
}

export default function BalanceChart({
  payments,
  currency,
  paymentFrequency = "mensual",
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
        label: "Saldo Pendiente",
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
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: "Evolución del Préstamo - Saldo y Pagos",
        font: {
          size: window.innerWidth < 640 ? 14 : 18,
          weight: "bold" as const,
        },
        color: "#374151",
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
            weight: "bold" as const,
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
            weight: "bold" as const,
          },
        },
        ticks: {
          color: "#6B7280",
          callback: function (value: any) {
            return formatCurrency(value);
          },
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="h-64 sm:h-80 md:h-96 mb-6">
        <Line data={chartData} options={options} />
      </div>

      {/* Resumen con el mismo formato que compound interest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
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
      </div>
    </div>
  );
}
