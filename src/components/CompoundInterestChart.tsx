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

  const options: any = {
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
        display: false,
        padding: {
          top: 10,
          bottom: window.innerWidth < 640 ? 20 : 30,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const format = (amount: number) => new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 3,
            }).format(amount);
            
            const datasetLabel = context.dataset.label;
            const value = format(context.parsed.y);
            const period = context.dataIndex;

            if (datasetLabel === "Valor acumulado") {
              const periodData = compoundData[period];
              return [
                `${datasetLabel}: ${value}`,
                `Interés del periodo: ${format(periodData.interest)}`,
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
            weight: "bold",
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
            weight: "bold",
          },
        },
        ticks: {
          callback: (value: any) => new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
          }).format(value),
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
      {/* Título personalizado con tooltip */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-700">
          Evolución Interés Compuesto - Valor Futuro
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
            Cálculo de intereses y valor final sin abonos durante el plazo
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>
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
