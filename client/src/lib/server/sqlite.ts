/**
 * A tiny portability layer over Node's built-in SQLite.
 *
 * The project used to depend on `better-sqlite3`, a native addon. That needs
 * Python and the Visual Studio "Desktop development with C++" workload on
 * Windows, and it has no prebuilt binary for the newest Node releases — so
 * `npm install` failed on a stock Windows machine.
 *
 * `node:sqlite` ships with Node itself (22.5+, stable in 24), so there is
 * nothing to compile. This file keeps the familiar better-sqlite3 API
 * (`prepare().all/get/run`, `exec`, `pragma`, `transaction`, `close`) so the
 * rest of the codebase is unchanged.
 */

import { DatabaseSync } from 'node:sqlite';

export type Row = Record<string, unknown>;

class SqliteStatement {
  // `node:sqlite` statement: all/get/run
  private readonly statement: any;

  constructor(statement: any) {
    this.statement = statement;
  }

  all(...params: unknown[]): Row[] {
    const rows = this.statement.all(...params) as Row[];
    // node:sqlite returns null-prototype objects; give them a normal one.
    return rows.map((row) => ({ ...row }));
  }

  get(...params: unknown[]): Row | undefined {
    const row = this.statement.get(...params) as Row | undefined;
    return row ? { ...row } : undefined;
  }

  run(...params: unknown[]): { changes: number; lastInsertRowid: number } {
    const result = this.statement.run(...params);
    return {
      changes: Number(result?.changes ?? 0),
      lastInsertRowid: Number(result?.lastInsertRowid ?? 0),
    };
  }
}

export class SqliteDatabase {
  private readonly db: DatabaseSync;

  constructor(filename: string) {
    this.db = new DatabaseSync(filename);
  }

  prepare(sql: string): SqliteStatement {
    return new SqliteStatement(this.db.prepare(sql));
  }

  exec(sql: string): this {
    this.db.exec(sql);
    return this;
  }

  /** `db.pragma('journal_mode = WAL')` */
  pragma(statement: string): this {
    this.db.exec(`PRAGMA ${statement}`);
    return this;
  }

  /** Wraps a function in BEGIN/COMMIT, rolling back if it throws. */
  transaction<T extends (...args: any[]) => any>(fn: T) {
    return (...args: Parameters<T>): ReturnType<T> => {
      this.db.exec('BEGIN');
      try {
        const result = fn(...args);
        this.db.exec('COMMIT');
        return result;
      } catch (error) {
        try {
          this.db.exec('ROLLBACK');
        } catch {
          /* the transaction was already rolled back */
        }
        throw error;
      }
    };
  }

  close(): void {
    this.db.close();
  }
}
