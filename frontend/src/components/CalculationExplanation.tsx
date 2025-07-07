import React from 'react';
import { ArrowLeft, Calculator, TrendingUp, TrendingDown } from 'lucide-react';

interface CalculationExplanationProps {
  onBack: () => void;
}

const CalculationExplanation: React.FC<CalculationExplanationProps> = ({ onBack }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Treasury Tracker
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculation Methodology</h1>
        <p className="text-gray-600">Understanding how NAV per Share and Premium/Discount are calculated</p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* NAV per Share Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Net Asset Value (NAV) per Share</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              NAV per Share represents the underlying Bitcoin value that each share of the company represents.
              It's calculated by dividing the total value of Bitcoin holdings by the number of shares outstanding.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Formula:</h3>
              <div className="font-mono text-lg bg-white p-3 rounded border">
                NAV per Share = (BTC Holdings × Bitcoin Price) ÷ Shares Outstanding
              </div>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">Example:</h3>
              <p className="text-gray-700">
                If MicroStrategy holds 444,262 BTC, Bitcoin is trading at $109,000, and there are 19.5 million shares outstanding:
              </p>
              <div className="font-mono text-sm bg-gray-100 p-3 rounded mt-2">
                NAV per Share = (444,262 × $109,000) ÷ 19,500,000<br />
                NAV per Share = $48,424,558,000 ÷ 19,500,000<br />
                NAV per Share = $2,483.31
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">
                <strong>Note:</strong> This calculation assumes the company's only asset is Bitcoin. 
                In reality, companies may have other assets, cash, debt, and operational value that aren't captured in this metric.
              </p>
            </div>
          </div>
        </div>

        {/* Premium/Discount Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Premium/Discount</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              The Premium/Discount shows how much the stock price differs from the NAV per Share.
              A positive percentage indicates the stock trades at a premium (above NAV), 
              while a negative percentage indicates a discount (below NAV).
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Formula:</h3>
              <div className="font-mono text-lg bg-white p-3 rounded border">
                Premium/Discount = ((Stock Price - NAV per Share) ÷ NAV per Share) × 100%
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-green-700">Premium Example:</h3>
                <p className="text-gray-700 text-sm">
                  Stock Price: $100<br />
                  NAV per Share: $80
                </p>
                <div className="font-mono text-sm bg-gray-100 p-3 rounded mt-2">
                  Premium = (($100 - $80) ÷ $80) × 100%<br />
                  Premium = ($20 ÷ $80) × 100%<br />
                  Premium = +25.0%
                </div>
                <p className="text-green-700 text-sm mt-2">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Stock trades at a 25% premium to NAV
                </p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-red-700">Discount Example:</h3>
                <p className="text-gray-700 text-sm">
                  Stock Price: $60<br />
                  NAV per Share: $80
                </p>
                <div className="font-mono text-sm bg-gray-100 p-3 rounded mt-2">
                  Discount = (($60 - $80) ÷ $80) × 100%<br />
                  Discount = (-$20 ÷ $80) × 100%<br />
                  Discount = -25.0%
                </div>
                <p className="text-red-700 text-sm mt-2">
                  <TrendingDown className="w-4 h-4 inline mr-1" />
                  Stock trades at a 25% discount to NAV
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interpretation Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interpreting the Results</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg text-green-700 mb-2">
                  <TrendingUp className="w-5 h-5 inline mr-2" />
                  Trading at Premium (Positive %)
                </h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• Stock price is higher than underlying Bitcoin value</li>
                  <li>• Market values additional company factors:</li>
                  <li className="ml-4">- Management expertise</li>
                  <li className="ml-4">- Growth potential</li>
                  <li className="ml-4">- Operational business value</li>
                  <li className="ml-4">- Leverage/debt effects</li>
                  <li>• May indicate overvaluation relative to Bitcoin holdings</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg text-red-700 mb-2">
                  <TrendingDown className="w-5 h-5 inline mr-2" />
                  Trading at Discount (Negative %)
                </h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• Stock price is lower than underlying Bitcoin value</li>
                  <li>• May be due to:</li>
                  <li className="ml-4">- Market inefficiencies</li>
                  <li className="ml-4">- Company-specific risks</li>
                  <li className="ml-4">- Debt/liabilities concerns</li>
                  <li className="ml-4">- Liquidity constraints</li>
                  <li>• Could represent potential value opportunity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes Section */}
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <h2 className="text-xl font-bold text-yellow-800 mb-4">Important Considerations</h2>
          <ul className="text-yellow-800 space-y-2 text-sm">
            <li>• <strong>Simplified Model:</strong> These calculations focus only on Bitcoin holdings and don't account for other assets, liabilities, or operational value</li>
            <li>• <strong>Market Dynamics:</strong> Premiums and discounts can change rapidly based on market sentiment, Bitcoin price movements, and company news</li>
            <li>• <strong>ETFs vs. Operating Companies:</strong> Bitcoin ETFs typically trade closer to NAV, while operating companies may have larger premiums/discounts</li>
            <li>• <strong>Investment Decisions:</strong> This data is for educational purposes only. Always conduct thorough research and consider multiple factors before making investment decisions</li>
            <li>• <strong>Data Currency:</strong> Stock prices update every 30 minutes. Bitcoin holdings are updated as companies report them</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalculationExplanation;