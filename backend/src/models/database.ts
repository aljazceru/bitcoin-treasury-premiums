import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

export class Database {
  private db!: sqlite3.Database;
  private dbPath: string;
  private isInitialized = false;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || process.env.DATABASE_PATH || './data/treasury.db';
    this.ensureDataDirectory();
  }

  private ensureDataDirectory(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          logger.error('Database connection failed:', err);
          reject(err);
        } else {
          logger.info('Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    await this.connect();
    await this.createTables();
    this.isInitialized = true;
  }

  private async createTables(): Promise<void> {
    const queries = [
      `CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ticker TEXT UNIQUE NOT NULL,
        exchange TEXT,
        country_code TEXT,
        btc_holdings REAL DEFAULT 0,
        shares_outstanding REAL,
        last_holdings_update TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS stock_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticker TEXT NOT NULL,
        price REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticker) REFERENCES companies (ticker)
      )`,
      
      `CREATE TABLE IF NOT EXISTS bitcoin_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        price REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Schema version tracking
      `CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE INDEX IF NOT EXISTS idx_stock_prices_ticker ON stock_prices(ticker)`,
      `CREATE INDEX IF NOT EXISTS idx_stock_prices_timestamp ON stock_prices(timestamp)`,
      `CREATE INDEX IF NOT EXISTS idx_bitcoin_prices_timestamp ON bitcoin_prices(timestamp)`,
      `CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker)`,
      `CREATE INDEX IF NOT EXISTS idx_companies_btc_holdings ON companies(btc_holdings)`
    ];

    for (const query of queries) {
      await this.run(query);
    }
    
    // Set initial schema version if not exists
    const currentVersion = await this.get<{ version: number }>('SELECT MAX(version) as version FROM schema_version');
    if (!currentVersion || currentVersion.version === null) {
      await this.run('INSERT INTO schema_version (version) VALUES (1)');
      logger.info('Database schema version 1 initialized');
    }
    
    logger.info('Database tables created successfully');
  }

  async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) {
          logger.error('Database run error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Database get error:', err);
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Database all error:', err);
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  async transaction<T>(operations: (db: sqlite3.Database) => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        operations(this.db)
          .then(result => {
            this.db.run('COMMIT', (err) => {
              if (err) {
                logger.error('Transaction commit error:', err);
                reject(err);
              } else {
                resolve(result);
              }
            });
          })
          .catch(error => {
            this.db.run('ROLLBACK', (rollbackErr) => {
              if (rollbackErr) {
                logger.error('Transaction rollback error:', rollbackErr);
              }
              reject(error);
            });
          });
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          logger.error('Database close error:', err);
          reject(err);
        } else {
          logger.info('Database connection closed');
          this.isInitialized = false;
          resolve();
        }
      });
    });
  }
}

export const db = new Database();