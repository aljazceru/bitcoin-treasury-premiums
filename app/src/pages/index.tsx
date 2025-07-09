import BitcoinTreasuryTracker from '../components/BitcoinTreasuryTracker';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Bitcoin Treasury Tracker</title>
        <meta name="description" content="Track publicly traded companies holding Bitcoin and their NAV premiums/discounts" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <BitcoinTreasuryTracker />
      </main>
    </>
  );
}