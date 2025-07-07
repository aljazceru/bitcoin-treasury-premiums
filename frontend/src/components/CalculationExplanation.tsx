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
        <p className="text-gray-600">Understanding how BTC NAV Multiple, BTC per Share, and BTC Holdings Percentage are calculated</p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* BTC NAV Multiple Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">BTC NAV Multiple</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              BTC NAV Multiple shows how many times the company's market capitalization exceeds the value of its Bitcoin holdings.
              A multiple of 1.0x means the market cap equals the BTC value, while higher multiples indicate the market values the company above its BTC holdings.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Formula:</h3>
              <div className="font-mono text-lg bg-white p-3 rounded border">
                BTC NAV Multiple = Market Capitalization ÷ (BTC Holdings × Bitcoin Price)
              </div>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">Example:</h3>
              <p className="text-gray-700">
                If a company has a market cap of $10 billion and holds 10,000 BTC worth $1 billion:
              </p>
              <div className="font-mono text-sm bg-gray-100 p-3 rounded mt-2">
                BTC NAV Multiple = $10,000,000,000 ÷ $1,000,000,000<br />
                BTC NAV Multiple = 10.0x
              </div>
              <p className="text-blue-700 text-sm mt-2">
                The market values this company at 10 times its Bitcoin holdings value.
              </p>
            </div>
          </div>
        </div>

        {/* BTC per Share Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">BTC per Share</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              BTC per Share represents how much Bitcoin each share of the company represents.
              This metric helps investors understand their indirect Bitcoin exposure per share owned.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Formula:</h3>
              <div className="font-mono text-lg bg-white p-3 rounded border">
                BTC per Share = BTC Holdings ÷ Shares Outstanding
              </div>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">Example:</h3>
              <p className="text-gray-700">
                If MicroStrategy holds 444,262 BTC and has 19.5 million shares outstanding:
              </p>
              <div className="font-mono text-sm bg-gray-100 p-3 rounded mt-2">
                BTC per Share = 444,262 ÷ 19,500,000<br />
                BTC per Share = 0.022783 BTC per share
              </div>
              <p className="text-orange-700 text-sm mt-2">
                Each share represents approximately 0.0228 BTC of the company's holdings.
              </p>
            </div>
          </div>
        </div>

        {/* BTC Holdings Percentage Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">BTC Holdings Percentage</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              BTC Holdings Percentage shows what portion of the company's market capitalization is represented by its Bitcoin holdings.
              A higher percentage indicates the company's value is more tied to its Bitcoin holdings.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Formula:</h3>
              <div className="font-mono text-lg bg-white p-3 rounded border">
                BTC Holdings % = (BTC Holdings Value ÷ Market Capitalization) × 100%
              </div>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">Example:</h3>
              <p className="text-gray-700">
                If a company's Bitcoin holdings are worth $1 billion and its market cap is $5 billion:
              </p>
              <div className="font-mono text-sm bg-gray-100 p-3 rounded mt-2">
                BTC Holdings % = ($1,000,000,000 ÷ $5,000,000,000) × 100%<br />
                BTC Holdings % = 0.2 × 100%<br />
                BTC Holdings % = 20.0%
              </div>
              <p className="text-green-700 text-sm mt-2">
                20% of the company's market value is represented by its Bitcoin holdings.
              </p>
            </div>
          </div>
        </div>

        {/* Interpretation Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interpreting the Metrics</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-blue-700 mb-3">BTC NAV Multiple Interpretation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded">
                  <h4 className="font-semibold text-green-800">Low Multiple (1.0x - 2.0x)</h4>
                  <p className="text-green-700">Market cap close to BTC value. May indicate pure Bitcoin exposure or undervaluation.</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <h4 className="font-semibold text-yellow-800">Medium Multiple (2.0x - 5.0x)</h4>
                  <p className="text-yellow-700">Market values operational business and growth potential beyond BTC holdings.</p>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <h4 className="font-semibold text-red-800">High Multiple (&gt;5.0x)</h4>
                  <p className="text-red-700">Significant premium for operational value, growth, or potential overvaluation.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-orange-700 mb-3">BTC per Share Usage</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Compare Bitcoin exposure across different companies</li>
                <li>• Calculate your indirect Bitcoin holdings: Shares × BTC per Share</li>
                <li>• Understand concentration of Bitcoin holdings relative to share count</li>
                <li>• Useful for portfolio allocation and risk assessment</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-green-700 mb-3">BTC Holdings Percentage Insights</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• <strong>High % (&gt;50%):</strong> Company value heavily tied to Bitcoin price movements</li>
                <li>• <strong>Medium % (20-50%):</strong> Significant Bitcoin exposure with operational diversification</li>
                <li>• <strong>Low % (&lt;20%):</strong> Bitcoin is secondary to main business operations</li>
                <li>• Helps assess correlation with Bitcoin price and investment risk</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Important Notes Section */}
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <h2 className="text-xl font-bold text-yellow-800 mb-4">Important Considerations</h2>
          <ul className="text-yellow-800 space-y-2 text-sm">
            <li>• <strong>Market Cap Focus:</strong> These metrics analyze the relationship between market capitalization and Bitcoin holdings, not traditional valuation methods</li>
            <li>• <strong>Operational Value:</strong> High BTC NAV multiples may reflect operational business value, growth potential, management expertise, or market sentiment beyond just Bitcoin holdings</li>
            <li>• <strong>Volatility Impact:</strong> All metrics fluctuate with both Bitcoin price changes and stock price movements</li>
            <li>• <strong>Company Types:</strong> Pure Bitcoin holding companies will have different metric ranges compared to operational businesses with Bitcoin treasuries</li>
            <li>• <strong>Investment Decisions:</strong> These metrics are analytical tools only. Always conduct comprehensive research before making investment decisions</li>
            <li>• <strong>Data Timeliness:</strong> Stock prices update every 30 minutes during market hours. Bitcoin holdings update when companies report changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalculationExplanation;