"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { PaymentDetail } from "@/types/loan";

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface PaymentChartProps {
  readonly payments: PaymentDetail[];
  readonly currency: string;
}

export default function PaymentChart({
  payments,
  currency,
}: PaymentChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  const formatPercentage = (value: number, maxDecimals: number = 3) => {
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals,
    }).format(value);
  };

  // Preparar datos para la gráfica de barras (Capital vs Interés)
  const barChartData = {
    labels: payments.slice(0, 12).map((p) => p.paymentNumber),
    datasets: [
      {
        label: "Capital",
        data: payments.slice(0, 12).map((p) => p.principalPayment),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "Interés",
        data: payments.slice(0, 12).map((p) => p.interestPayment),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Preparar datos para la gráfica de línea (Saldo restante)
  const lineChartData = {
    labels: payments.map((p) => `${p.paymentNumber}`),
    datasets: [
      {
        label: "Saldo Restante",
        data: payments.map((p) => p.remainingBalance),
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Preparar datos para la gráfica de dona (Total Capital vs Interés)
  const totalPrincipal = payments.reduce(
    (sum, p) => sum + p.principalPayment,
    0
  );
  const totalInterest = payments.reduce((sum, p) => sum + p.interestPayment, 0);

  const doughnutData = {
    labels: ["Capital", "Interés Total"],
    datasets: [
      {
        data: [totalPrincipal, totalInterest],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(239, 68, 68, 0.8)"],
        borderColor: ["rgba(59, 130, 246, 1)", "rgba(239, 68, 68, 1)"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${formatCurrency(
              context.parsed.y || context.parsed
            )}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${formatCurrency(
              context.parsed.y
            )}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const percentage =
              (context.parsed / (totalPrincipal + totalInterest)) * 100;
            return `${context.label}: ${formatCurrency(
              context.parsed
            )} (${formatPercentage(percentage, 1)}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Gráfica de Capital vs Interés por Cuota */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Capital vs Interés por Cuota
        </h3>
        <div className="h-80">
          <Bar data={barChartData} options={chartOptions} />
        </div>
        {payments.length > 12 && (
          <p className="center text-sm text-gray-500 mt-2">
            Mostrando las primeras 12 cuotas de {payments.length} total
          </p>
        )}
      </div>

      {/* Gráfica de Saldo Restante */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Evolución del Saldo Restante
        </h3>
        <div className="h-80">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      {/* Gráfica de Distribución Total */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Distribución Total del Préstamo
        </h3>
        <div className="h-80">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="center p-4 bg-blue-50 rounded-lg">
            <span className="text-blue-600 font-semibold">Capital Total</span>
            <div className="text-lg font-bold text-blue-800">
              {formatCurrency(totalPrincipal)}
            </div>
          </div>
          <div className="center p-4 bg-red-50 rounded-lg">
            <span className="text-red-600 font-semibold">Interés Total</span>
            <div className="text-lg font-bold text-red-800">
              {formatCurrency(totalInterest)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
