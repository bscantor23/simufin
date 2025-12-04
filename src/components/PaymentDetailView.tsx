"use client";

import { useState, useEffect } from "react";
import { PaymentDetail } from "@/types/loan";
import { getPeriodsPerYear } from "@/lib/financial-utils";
import { CurrencyFormatter } from "@/lib/currency-formatter";

interface PaymentDetailViewProps {
  readonly payments: PaymentDetail[];
  readonly currency: CurrencyFormatter;
  readonly paymentFrequency?:
    | "mensual"
    | "bimestral"
    | "trimestral"
    | "cuatrimestral"
    | "semestral"
    | "anual";
}

interface YearGroup {
  yearNumber: number;
  payments: PaymentDetail[];
}

export default function PaymentDetailView({
  payments,
  currency,
  paymentFrequency = "mensual",
}: PaymentDetailViewProps) {
  // Agrupar pagos por años según la frecuencia de pago
  const groupPaymentsByYear = (): YearGroup[] => {
    const yearGroups: YearGroup[] = [];
    const paymentsPerYear = getPeriodsPerYear(paymentFrequency);

    for (let i = 0; i < payments.length; i += paymentsPerYear) {
      const yearPayments = payments.slice(i, i + paymentsPerYear);
      const yearNumber = Math.floor(i / paymentsPerYear) + 1;

      // Solo agregar si hay pagos en ese año
      if (yearPayments.length > 0) {
        yearGroups.push({
          yearNumber,
          payments: yearPayments,
        });
      }
    }

    return yearGroups;
  };

  const yearGroups = groupPaymentsByYear();

  // Inicializar con todos los años colapsados excepto el primero
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(() => {
    const initialCollapsed = new Set<number>();
    yearGroups.forEach((group, index) => {
      if (index > 0) {
        // Todos excepto el primero (index 0)
        initialCollapsed.add(group.yearNumber);
      }
    });
    return initialCollapsed;
  });

  const [isDragging, setIsDragging] = useState<{ [year: number]: boolean }>({});
  const [dragStart, setDragStart] = useState<{ [year: number]: number }>({});
  const [dragOffset, setDragOffset] = useState<{ [year: number]: number }>({});
  const [carouselPosition, setCarouselPosition] = useState<{
    [year: number]: number;
  }>({});
  const [windowWidth, setWindowWidth] = useState<number>(0);

  // Efecto para track del tamaño de ventana
  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    updateWidth(); // Set initial width
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Función para determinar cuántas tarjetas caben en el espacio visible
  const getCardsToShow = () => {
    if (windowWidth === 0) return 1; // Valor por defecto mientras carga

    // Ancho de cada tarjeta (256px) + gap (8px) = 264px por tarjeta
    const cardWidth = 264;
    // Considerando padding del contenedor (aproximadamente 48px total)
    const availableWidth = windowWidth - 96; // Margen más conservador

    const fittingCards = Math.floor(availableWidth / cardWidth);
    return Math.max(1, Math.min(fittingCards, 4)); // Mínimo 1, máximo 4 tarjetas
  };

  const toggleYear = (yearNumber: number) => {
    const newCollapsed = new Set(collapsedYears);
    if (newCollapsed.has(yearNumber)) {
      newCollapsed.delete(yearNumber);
    } else {
      newCollapsed.add(yearNumber);
    }
    setCollapsedYears(newCollapsed);
  };

  // Navegación libre con desplazamiento suave
  const prevPage = (yearNumber: number) => {
    const currentPos = carouselPosition[yearNumber] || 0;
    const newPosition = Math.min(0, currentPos + 264); // Mover una tarjeta hacia la derecha
    setCarouselPosition((prev) => ({ ...prev, [yearNumber]: newPosition }));
  };

  const nextPage = (yearNumber: number) => {
    const currentPos = carouselPosition[yearNumber] || 0;
    const yearPayments =
      yearGroups.find((g) => g.yearNumber === yearNumber)?.payments || [];
    const cardsToShow = getCardsToShow();
    const maxScroll = Math.max(0, (yearPayments.length - cardsToShow) * 264);
    const newPosition = Math.max(-maxScroll, currentPos - 264); // Mover una tarjeta hacia la izquierda
    setCarouselPosition((prev) => ({ ...prev, [yearNumber]: newPosition }));
  };

  // Funciones de drag
  const handleMouseDown = (e: React.MouseEvent, yearNumber: number) => {
    setIsDragging((prev) => ({ ...prev, [yearNumber]: true }));
    setDragStart((prev) => ({ ...prev, [yearNumber]: e.clientX }));
    setDragOffset((prev) => ({ ...prev, [yearNumber]: 0 }));
  };

  const handleMouseMove = (e: React.MouseEvent, yearNumber: number) => {
    if (!isDragging[yearNumber]) return;

    const deltaX = e.clientX - (dragStart[yearNumber] || 0);
    setDragOffset((prev) => ({ ...prev, [yearNumber]: deltaX }));
  };

  const handleMouseUp = (yearNumber: number) => {
    if (!isDragging[yearNumber]) return;

    const currentPosition = carouselPosition[yearNumber] || 0;
    const offset = dragOffset[yearNumber] || 0;
    const newPosition = currentPosition + offset;

    const yearPayments =
      yearGroups.find((g) => g.yearNumber === yearNumber)?.payments || [];
    const cardsToShow = getCardsToShow();
    const maxScroll = Math.max(0, (yearPayments.length - cardsToShow) * 264);

    // Limitar la posición dentro de los límites válidos
    const constrainedPosition = Math.max(-maxScroll, Math.min(0, newPosition));

    // Guardar la nueva posición
    setCarouselPosition((prev) => ({
      ...prev,
      [yearNumber]: constrainedPosition,
    }));

    setIsDragging((prev) => ({ ...prev, [yearNumber]: false }));
    setDragOffset((prev) => ({ ...prev, [yearNumber]: 0 }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
        Detalle de Pagos
      </h3>

      <div className="space-y-6">
        {yearGroups.map((yearGroup) => {
          const isCollapsed = collapsedYears.has(yearGroup.yearNumber);
          const currentPosition = carouselPosition[yearGroup.yearNumber] || 0;
          const currentDragOffset = dragOffset[yearGroup.yearNumber] || 0;
          const cardsToShow = getCardsToShow();
          const maxScroll = Math.max(
            0,
            (yearGroup.payments.length - cardsToShow) * 264
          );
          const canGoNext = Math.abs(currentPosition) < maxScroll;
          const canGoPrev = currentPosition < 0;

          return (
            <div key={yearGroup.yearNumber} className="bg-white">
              {/* Header del año */}
              <button
                onClick={() => toggleYear(yearGroup.yearNumber)}
                className="w-full px-4 py-4 border-b border-gray-200 hover:border-b-2 hover:border-yellow-400 transition-all duration-200 flex justify-between items-center bg-white"
              >
                <span className="font-semibold text-gray-900">
                  Año {yearGroup.yearNumber} ({yearGroup.payments.length} pagos)
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    isCollapsed ? "" : "rotate-180"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Contenido del año */}
              {!isCollapsed && (
                <div className="p-4">
                  {/* Contenedor de carrusel fluido con 100% del ancho */}
                  <div className="relative h-48 mb-4 overflow-hidden w-full">
                    {/* Fila de tarjetas fluida */}
                    <div
                      className={`flex gap-2 cursor-grab active:cursor-grabbing select-none h-full ${
                        isDragging[yearGroup.yearNumber]
                          ? ""
                          : "transition-transform duration-300"
                      }`}
                      style={{
                        transform: `translateX(${
                          currentPosition + currentDragOffset
                        }px)`,
                        width: `${yearGroup.payments.length * 264}px`,
                      }}
                      onMouseDown={(e) =>
                        handleMouseDown(e, yearGroup.yearNumber)
                      }
                      onMouseMove={(e) =>
                        handleMouseMove(e, yearGroup.yearNumber)
                      }
                      onMouseUp={() => handleMouseUp(yearGroup.yearNumber)}
                      onMouseLeave={() => handleMouseUp(yearGroup.yearNumber)}
                    >
                      {yearGroup.payments.map((payment, index) => (
                        <div
                          key={payment.paymentNumber}
                          className="shrink-0 w-64 h-44 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow hover:border-yellow-300 flex flex-col justify-between"
                        >
                          {/* Header con número de cuota y valor total */}
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              Cuota {payment.paymentNumber}
                            </h4>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Total</p>
                              <p className="font-bold text-base text-gray-900">
                                {currency.format(payment.totalPayment)}
                              </p>
                            </div>
                          </div>

                          {/* Separador visual */}
                          <div className="border-t border-gray-100"></div>

                          {/* Abono a capital, intereses y saldo en filas separadas */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">
                                Abono Capital:
                              </p>
                              <p className="font-semibold text-sm text-green-600">
                                {currency.format(payment.principalPayment)}
                              </p>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">
                                Abono Intereses:
                              </p>
                              <p className="font-semibold text-sm text-red-600">
                                {currency.format(payment.interestPayment)}
                              </p>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">
                                Saldo Restante:
                              </p>
                              <p className="font-semibold text-sm text-blue-600">
                                {currency.format(payment.remainingBalance)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Controles de navegación */}
                  {yearGroup.payments.length > getCardsToShow() && (
                    <div className="flex justify-end items-center space-x-3">
                      <button
                        onClick={() => prevPage(yearGroup.yearNumber)}
                        disabled={!canGoPrev}
                        className="w-8 h-8 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <svg
                          className="w-4 h-4"
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
                      </button>

                      <button
                        onClick={() => nextPage(yearGroup.yearNumber)}
                        disabled={!canGoNext}
                        className="w-8 h-8 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
