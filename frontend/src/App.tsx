import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BitcoinTreasuryTracker from './components/BitcoinTreasuryTracker';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <BitcoinTreasuryTracker />
      </div>
    </QueryClientProvider>
  );
}

export default App;