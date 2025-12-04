import LoanForm from "@/components/LoanForm";
import SpiralFooter from "@/components/ui/spiral-footer";

export default function Home() {
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

      {/* Contenido principal */}
      <div className="pt-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simulador Financiero
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Calcula y visualiza tu préstamo bancario con nuestro simulador avanzado. 
              Obtén el detalle completo de pagos y una proyección clara de tu inversión.
            </p>
          </div>
          
          <div className="flex justify-center">
            <LoanForm />
          </div>
        </div>
      </div>
      <SpiralFooter />
    </div>
  );
}
