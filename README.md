# SimuFin - Financial Simulator

![SimuFin Logo](https://img.shields.io/badge/SimuFin-Financial%20Simulator-blue?style=for-the-badge)

An advanced financial simulator for loan and amortization calculations, built with Next.js 16 and TypeScript. It allows precise loan simulations with different interest rate types, payment modalities, and interactive visualizations.

## 🚀 Key Features

### 📊 Advanced Financial Calculations
- **Amortization and Capitalization**: Full support for both calculation types
- **Multiple Interest Rates**: Handling of nominal and effective rates with different frequencies
- **Payment Modalities**: Ordinary (arrears) and annuity-due (advance) payments
- **Rate Conversion**: Automatic conversion between different rate types and frequencies

### 📈 Interactive Visualizations
- **Balance Chart**: Loan balance evolution over time
- **Compound Interest Chart**: Visualization of interest growth
- **Payment Chart**: Distribution between principal and interest per period
- **Informative Tooltips**: Detailed explanations with custom SVG icons

### 📋 Detailed Tables and Reports
- **Complete Payment Table**: Includes period 0 with full payment details
- **Collapsible Summary**: Condensed view with totals and statistics
- **Detail Panel**: Step-by-step explanations of performed calculations
- **Contextual Information**: Dynamic display of rate type and payment modality

### 🎨 Modern User Interface
- **Responsive Design**: Automatic adaptation to different screen sizes
- **Reusable Components**: Consistent UI built with Tailwind CSS
- **SVG Animations**: Interactive footer with visual effects
- **Smart Positioning**: Automatic adjustment based on available space

## 🛠️ Technologies Used

- **Frontend**: Next.js 16 with Turbopack
- **Language**: TypeScript with strict typing
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with React-Chartjs-2
- **Icons**: Lucide React
- **Linting**: ESLint with modern configuration

## 🔧 Installation and Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional)

### Local Installation

```bash
# Clone the repository
git clone https://github.com/bscantor23/simufin.git
cd simufin

# Install dependencies
npm install

# Run in development mode
npm run dev

# Open in browser
# http://localhost:3000
