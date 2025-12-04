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
} from "chart.js";
import { Line } from "react-chartjs-2";
import { LoanData } from "@/types/loan";
import { getEffectiveRate } from "@/lib/financial-utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface CompoundInterestChartProps {
  readonly loanData: LoanData;
  readonly currency: string;
}

export default function CompoundInterestChart({
  loanData,
  currency,
}: CompoundInterestChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  // Generar datos del interés compuesto S = P(1+i)^n
  const generateCompoundInterestData = () => {
    const periodicRate = getEffectiveRate(loanData);
    const principal = loanData.amount;
    const periods = loanData.term;

    const data = [];

    // Periodo 0 (inicial)
    data.push({
      period: 0,
      amount: principal,
      interest: 0,
      totalInterest: 0,
    });

    // Calcular para cada periodo
    for (let n = 1; n <= periods; n++) {
      const compoundAmount = principal * Math.pow(1 + periodicRate, n);
      const periodInterest =
        compoundAmount - principal * Math.pow(1 + periodicRate, n - 1);
      const totalInterest = compoundAmount - principal;

      data.push({
        period: n,
        amount: compoundAmount,
        interest: periodInterest,
        totalInterest: totalInterest,
      });
    }

    return data;
  };

  const compoundData = generateCompoundInterestData();

  const chartData = {
    labels: compoundData.map((d) => d.period),
    datasets: [
      {
        label: "Valor acumulado",
        data: compoundData.map((d) => d.amount),
        borderColor: "rgb(147, 51, 234)",
        backgroundColor: "rgba(147, 51, 234, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.1,
        pointBackgroundColor: "rgb(147, 51, 234)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: "Capital Inicial",
        data: compoundData.map(() => loanData.amount),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        borderDash: [10, 5],
        tension: 0,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 3,
      },
      {
        label: "Intereses Acumulados",
        data: compoundData.map((d) => d.totalInterest),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.2,
        pointBackgroundColor: "rgb(239, 68, 68)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: window.innerWidth < 640 ? 10 : 20,
          fontSize: window.innerWidth < 640 ? 10 : 12,
        },
      },
      title: {
        display: true,
        text: "Evolución Interés Compuesto - Valor Futuro",
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
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const datasetLabel = context.dataset.label;
            const value = formatCurrency(context.parsed.y);
            const period = context.dataIndex;

            if (datasetLabel === "Valor con Interés Compuesto (S)") {
              const periodData = compoundData[period];
              return [
                `${datasetLabel}: ${value}`,
                `Interés del periodo: ${formatCurrency(periodData.interest)}`,
                `Fórmula: ${loanData.amount.toLocaleString("es-CO")} × (1 + ${(
                  getEffectiveRate(loanData) * 100
                ).toFixed(3)}%)^${period}`,
              ];
            }

            return `${datasetLabel}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Periodos",
          font: {
            weight: "bold" as const,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          font: {
            weight: "bold" as const,
          },
        },
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  const finalAmount = compoundData.at(-1)?.amount || 0;
  const totalInterestEarned = finalAmount - loanData.amount;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="h-64 sm:h-80 md:h-96 mb-6">
        <Line data={chartData} options={options} />
      </div>

      {/* Resumen del crecimiento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">Capital Inicial</p>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(loanData.amount)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Valor Final</p>
          <p className="text-lg font-bold text-purple-600">
            {formatCurrency(finalAmount)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Intereses Ganados</p>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(totalInterestEarned)}
          </p>
        </div>
      </div>
    </div>
  );
}
