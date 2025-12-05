# SimuFin - Simulador Financiero

![SimuFin Logo](https://img.shields.io/badge/SimuFin-Financial%20Simulator-blue?style=for-the-badge)

Un simulador financiero avanzado para cálculos de préstamos y amortizaciones, desarrollado con Next.js 16 y TypeScript. Permite realizar simulaciones precisas de préstamos con diferentes tipos de tasas, modalidades de pago y visualizaciones interactivas.

## 🚀 Características Principales

### 📊 Cálculos Financieros Avanzados
- **Amortización y Capitalización**: Soporte completo para ambos tipos de cálculo
- **Tasas Múltiples**: Manejo de tasas nominales y efectivas con diferentes frecuencias
- **Modalidades de Pago**: Anualidades vencidas y anticipadas
- **Conversión de Tasas**: Conversión automática entre diferentes tipos y frecuencias de tasas

### 📈 Visualizaciones Interactivas
- **Gráfico de Balance**: Evolución del saldo del préstamo a lo largo del tiempo
- **Gráfico de Interés Compuesto**: Visualización del crecimiento de intereses
- **Gráfico de Pagos**: Distribución entre capital e intereses por período
- **Tooltips Informativos**: Explicaciones detalladas con iconos SVG personalizados

### 📋 Tablas y Reportes Detallados
- **Tabla de Pagos Completa**: Período 0 incluido con detalles de cada pago
- **Resumen Colapsible**: Vista condensada con totales y estadísticas
- **Panel de Detalles**: Explicaciones paso a paso de los cálculos realizados
- **Información Contextual**: Display dinámico del tipo de tasa y modalidad

### 🎨 Interfaz de Usuario Moderna
- **Diseño Responsivo**: Adaptación automática a diferentes tamaños de pantalla
- **Componentes Reutilizables**: UI consistente con Tailwind CSS
- **Animaciones SVG**: Footer interactivo con efectos visuales
- **Posicionamiento Inteligente**: Adaptación automática según el espacio disponible

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 16 con Turbopack
- **Lenguaje**: TypeScript con tipado estricto
- **Estilos**: Tailwind CSS
- **Gráficos**: Chart.js con React-Chartjs-2
- **Íconos**: Lucide React
- **Linting**: ESLint con configuración moderna

## 📂 Estructura del Proyecto

```
simufin/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── page.tsx           # Página principal
│   │   ├── layout.tsx         # Layout global
│   │   ├── globals.css        # Estilos globales
│   │   └── simulation/
│   │       └── page.tsx       # Página de resultados
│   ├── components/            # Componentes React
│   │   ├── BalanceChart.tsx          # Gráfico de balance
│   │   ├── CompoundInterestChart.tsx # Gráfico de interés compuesto
│   │   ├── PaymentChart.tsx          # Gráfico de pagos
│   │   ├── PaymentTable.tsx          # Tabla de pagos detallada
│   │   ├── PaymentDetailView.tsx     # Vista de detalles de pago
│   │   ├── LoanForm.tsx              # Formulario principal
│   │   ├── CalculationDetailsPanel.tsx # Panel de explicaciones
│   │   └── ui/                       # Componentes UI base
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── numeric-input.tsx
│   │       ├── info-tooltip.tsx
│   │       └── spiral-footer.tsx
│   ├── lib/                   # Utilidades y helpers
│   │   ├── financial-utils.ts # Funciones financieras core
│   │   └── currency-formatter.ts # Formateo de moneda
│   └── types/                 # Definiciones de tipos
│       └── loan.ts           # Interfaces del préstamo
├── public/                    # Archivos estáticos
├── docker-compose.yml         # Configuración Docker
├── Dockerfile                 # Imagen Docker
└── package.json              # Dependencias del proyecto
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Docker (opcional)

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/bscantor23/simufin.git
cd simufin

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

### Docker

```bash
# Construir y ejecutar con Docker Compose
docker-compose up --build

# Acceder en http://localhost:3000
```

## 📖 Guía de Uso

### 1. Configuración del Préstamo
- **Monto**: Capital inicial del préstamo
- **Tasa de Interés**: Valor numérico de la tasa
- **Tipo de Tasa**: Nominal o Efectiva
- **Frecuencia de la Tasa**: Anual, Semestral, Bimestral, Mensual
- **Modalidad**: Vencida o Anticipada
- **Número de Períodos**: Duración del préstamo
- **Tipo de Cálculo**: Amortización o Capitalización

### 2. Visualización de Resultados
- **Gráficos Interactivos**: Hover para ver detalles específicos
- **Tabla Detallada**: Expandir para ver todos los períodos
- **Panel de Cálculos**: Explicaciones matemáticas paso a paso

### 3. Interpretación de Datos
- **Amortización**: Pago gradual del capital prestado
- **Capitalización**: Acumulación de intereses sobre el capital
- **Período 0**: Estado inicial antes del primer pago
- **Totales**: Suma de todos los pagos realizados

## 🧮 Fórmulas Implementadas

### Pago Periódico
- **Amortización Vencida**: `C = [S × i × (1 + i)^n] / [(1 + i)^n - 1]`
- **Amortización Anticipada**: `C = [S × i × (1 + i)^n] / [(1 + i)^n - 1] / (1 + i)`
- **Capitalización Vencida**: `C = [S × i] / [(1 + i)^n - 1]`
- **Capitalización Anticipada**: `C = [S × i] / [(1 + i)^n - 1] / (1 + i)`

### Conversión de Tasas
- **Nominal a Efectiva**: `i_efectiva = (1 + i_nominal/m)^m - 1`
- **Efectiva a Nominal**: `i_nominal = m × [(1 + i_efectiva)^(1/m) - 1]`
- **Cambio de Frecuencia**: `i_nueva = (1 + i_actual)^(f_nueva/f_actual) - 1`

## 🎨 Características Técnicas

### Responsividad Inteligente
- **Desktop**: Footer fijo al fondo de la pantalla
- **Mobile/Tablet**: Footer después del contenido para evitar superposición
- **Detección Automática**: Cálculo dinámico del espacio disponible

### Optimización de Rendimiento
- **Next.js 16**: Última versión con Turbopack para builds rápidos
- **Componentes Memoizados**: Evitar re-renderizados innecesarios
- **Carga Lazy**: Componentes cargados según demanda

### Accesibilidad
- **Tooltips Informativos**: Explicaciones contextuales
- **Contraste Adecuado**: Colores que cumplen estándares WCAG
- **Navegación por Teclado**: Soporte completo para accesibilidad

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Producción
npm run build        # Build para producción
npm run start        # Servidor de producción

# Calidad de código
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores de linting automáticamente

# Docker
docker-compose up    # Ejecutar con Docker
```

## 🐛 Problemas Conocidos

- **Next.js 16 + Turbopack**: Requiere sintaxis estricta en callbacks
- **Chart.js**: Algunos tipos requieren conversión explícita
- **Responsive Design**: Algunas pantallas muy pequeñas pueden requerir scroll horizontal

## 🚀 Roadmap

- [ ] Exportación a PDF/Excel
- [ ] Múltiples monedas
- [ ] Comparación de escenarios
- [ ] Calendario de pagos
- [ ] Integración con APIs bancarias
- [ ] Modo offline/PWA

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👤 Autor

**Steban** - [bscantor23](https://github.com/bscantor23)

---

⭐ **¡No olvides dar una estrella al proyecto si te resultó útil!**
