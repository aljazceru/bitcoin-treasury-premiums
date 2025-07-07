import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, TrendingUp, TrendingDown, Download, AlertCircle, HelpCircle } from 'lucide-react';
import { apiService, Company, BitcoinPrice } from '../services/api';
import CalculationExplanation from './CalculationExplanation';

const BitcoinTreasuryTracker: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Company; direction: 'asc' | 'desc' }>({ 
    key: 'btc_holdings', 
    direction: 'desc' 
  });
  const [showExplanation, setShowExplanation] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch companies data
  const { 
    data: companies = [], 
    isLoading: companiesLoading, 
    error: companiesError,
    isError: companiesIsError
  } = useQuery({
    queryKey: ['companies'],
    queryFn: apiService.getCompanies,
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Fetch Bitcoin price
  const { 
    data: bitcoinPriceData, 
    isLoading: bitcoinLoading, 
    error: bitcoinError 
  } = useQuery({
    queryKey: ['bitcoin-price'],
    queryFn: apiService.getBitcoinPrice,
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Fetch market status
  const { data: marketStatus } = useQuery({
    queryKey: ['market-status'],
    queryFn: apiService.getMarketStatus,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Sort companies
  const sortedCompanies = React.useMemo(() => {
    if (!companies.length) return [];
    
    return [...companies].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  }, [companies, sortConfig]);

  const handleSort = (key: keyof Company) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ['companies'] });
    await queryClient.refetchQueries({ queryKey: ['bitcoin-price'] });
    await queryClient.refetchQueries({ queryKey: ['market-status'] });
  };

  const handleUpdatePrices = async () => {
    try {
      await apiService.updatePrices();
      // Refetch data after manual update
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['companies'] });
        queryClient.refetchQueries({ queryKey: ['bitcoin-price'] });
      }, 2000);
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Company', 'Ticker', 'BTC Holdings', 'Stock Price', 'Premium/Discount', 'NAV/Share', 'BTC Value', 'Market Cap'];
    const csvData = sortedCompanies.map(company => [
      company.name,
      company.ticker,
      company.btc_holdings,
      company.stock_price || 'N/A',
      company.premium || 'N/A',
      company.nav_per_share || 'N/A',
      company.btc_value || 'N/A',
      company.market_cap || 'N/A'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bitcoin-treasury-premiums.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatNumber = (num: number | null | undefined, decimals = 2): string => {
    if (num == null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const formatCurrency = (num: number | null | undefined, currency = 'USD'): string => {
    if (num == null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatPercent = (num: number | null | undefined): JSX.Element => {
    if (num == null) return <span>N/A</span>;
    
    const color = num >= 0 ? 'text-green-600' : 'text-red-600';
    const icon = num >= 0 ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />;
    
    return (
      <span className={`font-semibold ${color} flex items-center gap-1`}>
        {icon}
        {formatNumber(num, 1)}%
      </span>
    );
  };

  const getCountryFlag = (countryCode: string | undefined): string => {
    const flags: Record<string, string> = {
      'US': '🇺🇸',
      'CA': '🇨🇦',
      'JP': '🇯🇵',
      'KR': '🇰🇷',
      'DE': '🇩🇪',
      'GB': '🇬🇧',
      'CN': '🇨🇳',
      'AU': '🇦🇺',
      'HK': '🇭🇰',
      'SG': '🇸🇬'
    };
    return flags[countryCode || 'US'] || '🌐';
  };

  if (companiesLoading || bitcoinLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading Bitcoin treasury data...</span>
        </div>
      </div>
    );
  }

  if (companiesIsError) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <div className="ml-2">
            <div className="text-lg font-semibold text-red-600">Error loading data</div>
            <div className="text-sm text-gray-600">
              {companiesError?.message || 'Failed to load companies data'}
            </div>
            <button 
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showExplanation) {
    return <CalculationExplanation onBack={() => setShowExplanation(false)} />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bitcoin Treasury Premium Tracker</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-blue-600">
              ₿ Bitcoin: {bitcoinPriceData ? formatCurrency(bitcoinPriceData.price) : 'Loading...'}
              {bitcoinError && (
                <span className="text-sm text-red-500 ml-2">
                  (Error: {bitcoinError.message})
                </span>
              )}
            </div>
            {marketStatus && (
              <div className={`text-sm px-2 py-1 rounded ${
                marketStatus.marketOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {marketStatus.message}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleUpdatePrices}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <RefreshCw className="w-4 h-4" />
              Update Prices
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowExplanation(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <HelpCircle className="w-4 h-4" />
              How it's calculated
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Companies</div>
          <div className="text-2xl font-bold">{sortedCompanies.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total BTC Holdings</div>
          <div className="text-2xl font-bold">
            ₿{formatNumber(sortedCompanies.reduce((sum, c) => sum + c.btc_holdings, 0), 0)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total BTC Value</div>
          <div className="text-2xl font-bold">
            {formatCurrency(sortedCompanies.reduce((sum, c) => sum + (c.btc_value || 0), 0))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Avg Premium</div>
          <div className="text-2xl font-bold">
            {sortedCompanies.length > 0 ? 
              formatNumber(sortedCompanies.reduce((sum, c) => sum + (c.premium || 0), 0) / sortedCompanies.length, 1) + '%' 
              : 'N/A'
            }
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                {[
                  { key: 'name' as keyof Company, label: 'Company' },
                  { key: 'ticker' as keyof Company, label: 'Ticker' },
                  { key: 'btc_holdings' as keyof Company, label: 'BTC Holdings' },
                  { key: 'stock_price' as keyof Company, label: 'Stock Price' },
                  { key: 'premium' as keyof Company, label: 'Premium/Discount' },
                  { key: 'nav_per_share' as keyof Company, label: 'NAV/Share' },
                  { key: 'btc_value' as keyof Company, label: 'BTC Value' },
                  { key: 'market_cap' as keyof Company, label: 'Market Cap' }
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort(key)}
                  >
                    {label}
                    {sortConfig.key === key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCompanies.map((company) => (
                <tr key={company.ticker} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{getCountryFlag(company.country_code)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.exchange}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-semibold">{company.ticker}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold">₿{formatNumber(company.btc_holdings, 0)}</div>
                    <div className="text-xs text-gray-500">
                      Updated: {company.last_holdings_update ? 
                        new Date(company.last_holdings_update).toLocaleDateString() : 
                        'N/A'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold">${formatNumber(company.stock_price)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatPercent(company.premium)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold">${formatNumber(company.nav_per_share)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold">{formatCurrency(company.btc_value)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm">{formatCurrency(company.market_cap)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Data sources: BitcoinTreasuries.net, CoinGecko API, Yahoo Finance API</p>
        <p>Premium/Discount = (Stock Price - NAV per Share) / NAV per Share × 100</p>
        <p>⚠️ This is for educational purposes. Always verify data independently before making investment decisions.</p>
        <p className="mt-2">
          Updates every 30 minutes • 
          Last refresh: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default BitcoinTreasuryTracker;