'use client';

import { useEffect, useState } from 'react';
import LoanForm from "@/components/LoanForm";
import SpiralFooter from "@/components/ui/spiral-footer";

export default function Home() {
  const [hasEnoughHeight, setHasEnoughHeight] = useState(false);

  useEffect(() => {
    const checkHeight = () => {
      // Aproximamos la altura mínima necesaria (navbar + header + formulario + márgenes)
      const minRequiredHeight = 900; // Ajusta este valor según la altura real del contenido
      const availableHeight = window.innerHeight;
      
      setHasEnoughHeight(availableHeight >= minRequiredHeight);
    };

    checkHeight();
    window.addEventListener('resize', checkHeight);
    
    return () => window.removeEventListener('resize', checkHeight);
  }, []);

  return (
    <div className="min-h-screen font-roboto relative" style={{ backgroundColor: "#f5f5f5" }}>
      {/* Navbar */}
      <nav className="bg-white shadow-lg relative z-10" style={{ height: '80px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-center items-center h-full">
            {/* Logo/Título centrado */}
            <h1 className="text-3xl font-bold text-gray-900">SimuFin</h1>
          </div>
        </div>
      </nav>

      {/* Banner de Integrantes */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-500 text-white py-4">
        <div className="max-w-8xl mx-auto px-4">
          <div className="text-center">
            <p className="text-sm font-medium mb-2">Desarrollado por:</p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-sm">
              <span className="font-semibold">[Brayan Steban Cantor Munevar 20252678006]</span>
              <span className="hidden sm:inline text-blue-200">•</span>
              <span className="font-semibold">[Jonathan Steven Malambo Trujillo 20252678010]</span>
              <span className="hidden sm:inline text-blue-200">•</span>
              <span className="font-semibold">[Javier Dario Florez Diaz 20242678006]</span>
              <span className="hidden sm:inline text-blue-200">•</span>
              <span className="font-semibold">[Daniel Andrés Ravelo Rivera 20252678003]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={hasEnoughHeight ? "pt-12 pb-24" : "pt-12"}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simulador Financiero
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Calcula y visualiza tu préstamo banciero con nuestro simulador avanzado. 
              Obtén el detalle completo de pagos y una proyección clara de tu inversión.
            </p>
          </div>
          
          <div className="flex justify-center">
            <LoanForm />
          </div>
        </div>
      </div>
      
      {/* SpiralFooter condicional */}
      {hasEnoughHeight ? (
        // Fijo al fondo cuando hay suficiente altura
        <div className="fixed bottom-0 left-0 right-0 w-full z-0">
          <SpiralFooter />
        </div>
      ) : (
        // Después del formulario cuando no hay suficiente altura
        <SpiralFooter />
      )}
    </div>
  );
}
