import type { IStorage } from '@/application/ports';

export class FakeStorage implements IStorage {
  private store: Map<string, string> = new Map();

  get(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }

  // ── Test helpers ────────────────────────────────────────────

  clear(): void {
    this.store.clear();
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  getAll(): Record<string, string> {
    return Object.fromEntries(this.store);
  }
}
