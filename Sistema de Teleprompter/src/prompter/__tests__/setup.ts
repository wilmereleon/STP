// localStorage en memoria para probar el store (persistencia de zustand) en Node
const data = new Map<string, string>();

globalThis.localStorage = {
  get length() {
    return data.size;
  },
  clear: () => data.clear(),
  getItem: (key: string) => data.get(key) ?? null,
  key: (index: number) => Array.from(data.keys())[index] ?? null,
  removeItem: (key: string) => void data.delete(key),
  setItem: (key: string, value: string) => void data.set(key, String(value)),
} as Storage;
