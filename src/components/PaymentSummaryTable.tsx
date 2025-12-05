'use client';

import { useState } from 'react';
import { PaymentDetail } from '@/types/loan';
import { CurrencyFormatter } from '@/lib/currency-formatter';

interface PaymentSummaryTableProps {
  readonly payments: PaymentDetail[];
  readonly currency: CurrencyFormatter;
  readonly annuityType: 'amortización' | 'capitalización';
}

export default function PaymentSummaryTable({ 
  payments, 
  currency, 
  annuityType 
}: PaymentSummaryTableProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      {/* Header colapsable */}
      <button
        onClick={toggleCollapse}
        className="w-full flex justify-between items-center text-left focus:outline-none hover:bg-gray-50 p-2 rounded"
      >
        <h3 className="text-xl font-semibold text-gray-800">
          Tabla Resumen de Pagos
        </h3>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            isCollapsed ? '' : 'rotate-180'
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

      {/* Contenido de la tabla */}
      {!isCollapsed && (
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
                    {annuityType === 'amortización' ? 'Amortización' : 'Incremento'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment, index) => {
                  // Calcular saldo inicial del período
                  const saldoInicial = payment.remainingBalance + (annuityType === 'amortización' ? payment.principalPayment : 0);
                  
                  // Para capitalización, mostrar incremento de intereses excepto en último pago
                  const incremento = annuityType === 'capitalización' 
                    ? (index === payments.length - 1 ? payment.principalPayment : 0)
                    : payment.principalPayment;

                  return (
                    <tr key={payment.paymentNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.paymentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {currency.format(saldoInicial)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {currency.format(payment.interestPayment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {currency.format(payment.totalPayment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {currency.format(incremento)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Información adicional */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Total de períodos:</strong> {payments.length} | 
              <strong className="ml-2">Tipo de anualidad:</strong> {annuityType}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}