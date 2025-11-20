/**
 * Firebase Realtime Database Helper Utilities
 * Provides a Firestore-like interface for Realtime Database operations
 */

import { Database, Reference } from "firebase-admin/database";
import { getAdminDatabase } from "./admin";

// Generate a unique push ID (similar to Firestore auto-generated IDs)
export function generatePushId(): string {
  const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  let now = Date.now();
  const timeStampChars = new Array(8);
  for (let i = 7; i >= 0; i--) {
    timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
    now = Math.floor(now / 64);
  }
  let id = timeStampChars.join('');
  for (let i = 0; i < 12; i++) {
    id += PUSH_CHARS.charAt(Math.floor(Math.random() * 64));
  }
  return id;
}

/**
 * Collection-like interface for Realtime Database
 */
export class DatabaseCollection {
  private db: Database;
  private path: string;

  constructor(path: string, db?: Database) {
    this.path = path;
    this.db = db || getAdminDatabase();
  }

  /**
   * Get a document reference by ID
   */
  doc(id: string): DatabaseDocument {
    return new DatabaseDocument(`${this.path}/${id}`, this.db);
  }

  /**
   * Add a new document with auto-generated ID
   */
  async add(data: any): Promise<DatabaseDocument> {
    const id = generatePushId();
    const docRef = this.doc(id);
    await docRef.set({
      ...data,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return docRef;
  }

  /**
   * Get all documents in the collection
   */
  async get(): Promise<QuerySnapshot> {
    const ref = this.db.ref(this.path);
    const snapshot = await ref.once('value');
    const data = snapshot.val() || {};
    
    const docs = Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      data: () => value,
      exists: true,
      ref: this.doc(id),
    }));

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
      forEach: (callback: (doc: any) => void) => docs.forEach(callback),
    };
  }

  /**
   * Create a query with filters
   */
  where(field: string, operator: string, value: any): DatabaseQuery {
    return new DatabaseQuery(this.path, this.db).where(field, operator, value);
  }

  /**
   * Order results by a field
   */
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): DatabaseQuery {
    return new DatabaseQuery(this.path, this.db).orderBy(field, direction);
  }

  /**
   * Limit the number of results
   */
  limit(count: number): DatabaseQuery {
    return new DatabaseQuery(this.path, this.db).limit(count);
  }
}

/**
 * Document-like interface for Realtime Database
 */
export class DatabaseDocument {
  private db: Database;
  public path: string;

  constructor(path: string, db?: Database) {
    this.path = path;
    this.db = db || getAdminDatabase();
  }

  /**
   * Get document data
   */
  async get(): Promise<DocumentSnapshot> {
    const ref = this.db.ref(this.path);
    const snapshot = await ref.once('value');
    const data = snapshot.val();

    return {
      id: this.path.split('/').pop() || '',
      exists: data !== null,
      data: () => data,
      ref: this,
    };
  }

  /**
   * Set document data (overwrites)
   */
  async set(data: any, options?: { merge?: boolean }): Promise<void> {
    const ref = this.db.ref(this.path);
    
    if (options?.merge) {
      const existing = (await ref.once('value')).val() || {};
      await ref.set({
        ...existing,
        ...data,
        updatedAt: Date.now(),
      });
    } else {
      await ref.set({
        ...data,
        updatedAt: Date.now(),
      });
    }
  }

  /**
   * Update document data (merges)
   */
  async update(data: any): Promise<void> {
    const ref = this.db.ref(this.path);
    await ref.update({
      ...data,
      updatedAt: Date.now(),
    });
  }

  /**
   * Delete document
   */
  async delete(): Promise<void> {
    const ref = this.db.ref(this.path);
    await ref.remove();
  }

  /**
   * Get a subcollection
   */
  collection(name: string): DatabaseCollection {
    return new DatabaseCollection(`${this.path}/${name}`, this.db);
  }
}

/**
 * Query interface for filtered reads
 */
export class DatabaseQuery {
  private db: Database;
  private path: string;
  private filters: Array<{ field: string; operator: string; value: any }> = [];
  private orderByField?: string;
  private orderByDirection: 'asc' | 'desc' = 'asc';
  private limitCount?: number;

  constructor(path: string, db?: Database) {
    this.path = path;
    this.db = db || getAdminDatabase();
  }

  where(field: string, operator: string, value: any): DatabaseQuery {
    this.filters.push({ field, operator, value });
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): DatabaseQuery {
    this.orderByField = field;
    this.orderByDirection = direction;
    return this;
  }

  limit(count: number): DatabaseQuery {
    this.limitCount = count;
    return this;
  }

  async get(): Promise<QuerySnapshot> {
    const ref = this.db.ref(this.path);
    const snapshot = await ref.once('value');
    const data = snapshot.val() || {};

    // Convert to array and apply filters
    let results = Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value,
    }));

    // Apply where filters
    for (const filter of this.filters) {
      results = results.filter((item: any) => {
        const fieldValue = item[filter.field];
        switch (filter.operator) {
          case '==':
            return fieldValue === filter.value;
          case '!=':
            return fieldValue !== filter.value;
          case '>':
            return fieldValue > filter.value;
          case '>=':
            return fieldValue >= filter.value;
          case '<':
            return fieldValue < filter.value;
          case '<=':
            return fieldValue <= filter.value;
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(fieldValue);
          case 'array-contains':
            return Array.isArray(fieldValue) && fieldValue.includes(filter.value);
          default:
            return true;
        }
      });
    }

    // Apply orderBy
    if (this.orderByField) {
      results.sort((a: any, b: any) => {
        const aVal = a[this.orderByField!];
        const bVal = b[this.orderByField!];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return this.orderByDirection === 'asc' ? comparison : -comparison;
      });
    }

    // Apply limit
    if (this.limitCount) {
      results = results.slice(0, this.limitCount);
    }

    const docs = results.map((item: any) => ({
      id: item.id,
      data: () => item,
      exists: true,
      ref: new DatabaseDocument(`${this.path}/${item.id}`, this.db),
    }));

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
      forEach: (callback: (doc: any) => void) => docs.forEach(callback),
    };
  }
}

// Type definitions
interface DocumentSnapshot {
  id: string;
  exists: boolean;
  data: () => any;
  ref: DatabaseDocument;
}

interface QuerySnapshot {
  docs: Array<{
    id: string;
    data: () => any;
    exists: boolean;
    ref: DatabaseDocument;
  }>;
  empty: boolean;
  size: number;
  forEach: (callback: (doc: any) => void) => void;
}

/**
 * Main database helper - provides collection() method like Firestore
 */
export class DatabaseHelper {
  private db: Database;

  constructor(db?: Database) {
    this.db = db || getAdminDatabase();
  }

  collection(path: string): DatabaseCollection {
    return new DatabaseCollection(path, this.db);
  }

  doc(path: string): DatabaseDocument {
    return new DatabaseDocument(path, this.db);
  }
}

// Export a singleton instance
export const dbHelper = new DatabaseHelper();

// Convenience function to get a collection
export function collection(path: string): DatabaseCollection {
  return dbHelper.collection(path);
}
