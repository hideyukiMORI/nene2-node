import { describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Module mocks — use class syntax for constructors so `new Foo()` works.
// vi.mock is hoisted; all factories must be self-contained.
// ---------------------------------------------------------------------------

vi.mock('../../src/database/mysql-query-executor.js', () => {
  class MysqlQueryExecutorMock {
    close = vi.fn(() => Promise.resolve());
    insert = vi.fn();
    fetchOne = vi.fn();
    fetchAll = vi.fn();
    execute = vi.fn();
    static fromPool = vi.fn(() => new MysqlQueryExecutorMock());
  }
  return {
    createMysqlPool: vi.fn(() => ({ query: vi.fn(), end: vi.fn(() => Promise.resolve()) })),
    MysqlQueryExecutor: MysqlQueryExecutorMock,
  };
});

vi.mock('../../src/database/mysql-transaction-manager.js', () => {
  class MysqlTransactionManager {
    begin = vi.fn(() => Promise.resolve());
  }
  return { MysqlTransactionManager };
});

vi.mock('pg', () => {
  class Pool {
    query = vi.fn();
    end = vi.fn(() => Promise.resolve());
  }
  return { Pool };
});

vi.mock('../../src/database/postgres-query-executor.js', () => {
  class PostgresQueryExecutorMock {
    close = vi.fn(() => Promise.resolve());
    insert = vi.fn();
    fetchOne = vi.fn();
    fetchAll = vi.fn();
    execute = vi.fn();
    static fromPool = vi.fn(() => new PostgresQueryExecutorMock());
  }
  return { PostgresQueryExecutor: PostgresQueryExecutorMock };
});

vi.mock('../../src/database/postgres-transaction-manager.js', () => {
  class PostgresTransactionManager {
    begin = vi.fn(() => Promise.resolve());
  }
  return { PostgresTransactionManager };
});

vi.mock('../../src/example/example-sql-schema.js', () => ({
  ensureExamplesSchema: vi.fn(),
  ensureExamplesSchemaAsync: vi.fn(() => Promise.resolve()),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

import { createDatabaseRuntime } from '../../src/database/create-database-runtime.js';

describe('createDatabaseRuntime — MySQL branch', () => {
  it('returns mysql backend with executor and transactionManager', async () => {
    const runtime = await createDatabaseRuntime('mysql://user:pass@localhost:3306/db');
    expect(runtime.backend).toBe('mysql');
    expect(runtime.executor).toBeDefined();
    expect(runtime.transactionManager).toBeDefined();
    expect(runtime.readExecutor).toBeUndefined();
  });

  it('includes readExecutor when readDatabaseUrl is mysql', async () => {
    const runtime = await createDatabaseRuntime(
      'mysql://user:pass@localhost:3306/db',
      'mysql://user:pass@replica:3306/db',
    );
    expect(runtime.readExecutor).toBeDefined();
  });

  it('throws when readDatabaseUrl backend differs from primary', async () => {
    await expect(
      createDatabaseRuntime(
        'mysql://user:pass@localhost:3306/db',
        'postgresql://user:pass@localhost:5432/db',
      ),
    ).rejects.toThrow('same backend');
  });

  it('shutdown() resolves without error (single pool)', async () => {
    const runtime = await createDatabaseRuntime('mysql://user:pass@localhost:3306/db');
    await expect(runtime.shutdown()).resolves.toBeUndefined();
  });

  it('shutdown() resolves without error (with read replica)', async () => {
    const runtime = await createDatabaseRuntime(
      'mysql://user:pass@localhost:3306/db',
      'mysql://user:pass@replica:3306/db',
    );
    await expect(runtime.shutdown()).resolves.toBeUndefined();
  });
});

describe('createDatabaseRuntime — PostgreSQL branch', () => {
  it('returns postgresql backend with executor and transactionManager', async () => {
    const runtime = await createDatabaseRuntime('postgresql://user:pass@localhost:5432/db');
    expect(runtime.backend).toBe('postgresql');
    expect(runtime.executor).toBeDefined();
    expect(runtime.transactionManager).toBeDefined();
    expect(runtime.readExecutor).toBeUndefined();
  });

  it('includes readExecutor when readDatabaseUrl is postgresql', async () => {
    const runtime = await createDatabaseRuntime(
      'postgresql://user:pass@localhost:5432/db',
      'postgresql://user:pass@replica:5432/db',
    );
    expect(runtime.readExecutor).toBeDefined();
  });

  it('throws when readDatabaseUrl backend differs from primary', async () => {
    await expect(
      createDatabaseRuntime(
        'postgresql://user:pass@localhost:5432/db',
        'mysql://user:pass@localhost:3306/db',
      ),
    ).rejects.toThrow('same backend');
  });

  it('shutdown() resolves without error (single pool)', async () => {
    const runtime = await createDatabaseRuntime('postgresql://user:pass@localhost:5432/db');
    await expect(runtime.shutdown()).resolves.toBeUndefined();
  });

  it('shutdown() resolves without error (with read replica)', async () => {
    const runtime = await createDatabaseRuntime(
      'postgresql://user:pass@localhost:5432/db',
      'postgresql://user:pass@replica:5432/db',
    );
    await expect(runtime.shutdown()).resolves.toBeUndefined();
  });
});
