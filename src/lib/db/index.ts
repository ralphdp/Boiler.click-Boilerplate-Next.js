/**
 * Sovereign Database Strategy Interface
 * Defines the contract for database interactions, isolating the underlying ORM or driver.
 */
export interface DatabaseStrategy<T> {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;

    // Generic CRUD operations
    findOne: (query: Record<string, any>) => Promise<T | null>;
    findMany: (query: Record<string, any>) => Promise<T[]>;
    create: (data: Partial<T>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<boolean>;
}

// Example Implementations will map to:
// 1. Prisma (PostgreSQL / Neon)
// 2. Mongoose (MongoDB)
// 3. Supabase Client
