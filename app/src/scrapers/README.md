# Bitcoin Treasuries Scraper

## Current Implementation (Temporary)

The scraper currently uses a CSV parser to load company data from `treasuries.csv`. This is a temporary solution to quickly get all 143 companies into the database.

## Future Real Scraping Implementation

To implement real web scraping of bitcointreasuries.net:

1. **Target URL**: https://bitcointreasuries.net/
2. **Data Structure**: The site uses a table structure with company data
3. **Required Libraries**: 
   - `puppeteer` or `playwright` for JavaScript-heavy sites
   - `cheerio` for HTML parsing
   - `axios` for HTTP requests

### Implementation Steps:

1. **Add scraping dependencies**:
   ```bash
   npm install puppeteer cheerio axios
   ```

2. **Create real scraper method**:
   - Launch headless browser
   - Navigate to bitcointreasuries.net
   - Wait for table to load
   - Extract data from table rows
   - Parse company names, tickers, holdings, etc.

3. **Handle dynamic content**:
   - Site may use JavaScript to load data
   - May need to wait for AJAX requests
   - Handle pagination if present

4. **Data extraction points**:
   - Company name and ticker
   - Bitcoin holdings (₿ amounts)
   - Market cap data
   - Country/exchange information
   - Shares outstanding (if available)

5. **Error handling**:
   - Retry mechanism for failed requests
   - Fallback to CSV if scraping fails
   - Rate limiting to avoid blocking

### Example scraping code structure:
```typescript
async realScrapeCompanies(): Promise<ScrapedCompany[]> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('https://bitcointreasuries.net/');
    await page.waitForSelector('.company-table');
    
    const companies = await page.evaluate(() => {
      // Extract data from DOM
    });
    
    return companies;
  } finally {
    await browser.close();
  }
}
```

### Switch back to real scraping:
1. Implement the real scraping method
2. Update the `scrapeCompanies()` method to use real scraping
3. Keep CSV as fallback for reliability