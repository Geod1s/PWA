export interface OfflineTransaction {
  id: string
  storeId: string
  cashierId: string
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
  }>
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  notes?: string
  timestamp: number
  synced: boolean
}

export interface OfflineProduct {
  id: string
  storeId: string
  name: string
  price: number
  quantity_in_stock: number
  category: string
}

const DB_NAME = "CloudPOS"
const DB_VERSION = 1

let db: IDBDatabase | null = null

export async function initializeDB(): Promise<IDBDatabase> {
  if (db) return db

  if (typeof indexedDB === "undefined") {
    throw new Error("indexedDB is not available in this environment")
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Transactions store
      if (!database.objectStoreNames.contains("transactions")) {
        const txStore = database.createObjectStore("transactions", {
          keyPath: "id",
        })
        txStore.createIndex("synced", "synced", { unique: false })
        txStore.createIndex("timestamp", "timestamp", { unique: false })
      }

      // Products store
      if (!database.objectStoreNames.contains("products")) {
        database.createObjectStore("products", { keyPath: "id" })
      }

      // Pending syncs store (reserved for future use)
      if (!database.objectStoreNames.contains("pendingSyncs")) {
        const syncStore = database.createObjectStore("pendingSyncs", {
          keyPath: "id",
          autoIncrement: true,
        })
        syncStore.createIndex("type", "type", { unique: false })
      }
    }
  })
}

// ---------- Transactions ----------

export async function saveTransaction(
  transaction: OfflineTransaction,
): Promise<string> {
  const database = await initializeDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction("transactions", "readwrite")
    const store = tx.objectStore("transactions")

    const request = store.add(transaction)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      resolve(request.result as string)
    }

    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function getUnsyncedTransactions(): Promise<OfflineTransaction[]> {
  const database = await initializeDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction("transactions", "readonly")
    const store = tx.objectStore("transactions")

    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const all = (request.result || []) as OfflineTransaction[]
      const unsynced = all.filter((t) => !t.synced)
      resolve(unsynced)
    }

    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function markTransactionSynced(id: string): Promise<void> {
  const database = await initializeDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction("transactions", "readwrite")
    const store = tx.objectStore("transactions")

    const getRequest = store.get(id)

    getRequest.onerror = () => reject(getRequest.error)

    getRequest.onsuccess = () => {
      const transaction = getRequest.result as OfflineTransaction | undefined

      if (!transaction) {
        resolve()
        return
      }

      transaction.synced = true

      const updateRequest = store.put(transaction)

      updateRequest.onerror = () => reject(updateRequest.error)
      updateRequest.onsuccess = () => resolve()
    }

    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

// ---------- Products ----------

export async function saveProducts(products: OfflineProduct[]): Promise<void> {
  const database = await initializeDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction("products", "readwrite")
    const store = tx.objectStore("products")

    const clearRequest = store.clear()

    clearRequest.onerror = () => reject(clearRequest.error)

    clearRequest.onsuccess = () => {
      products.forEach((product) => {
        store.add(product)
      })

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    }
  })
}

export async function getOfflineProducts(
  storeId: string,
): Promise<OfflineProduct[]> {
  const database = await initializeDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction("products", "readonly")
    const store = tx.objectStore("products")

    const request = store.getAll()

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const allProducts = (request.result || []) as OfflineProduct[]
      const filtered = allProducts.filter((p) => p.storeId === storeId)
      resolve(filtered)
    }

    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function deleteOfflineProduct(productId: string): Promise<void> {
  const database = await initializeDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction("products", "readwrite")
    const store = tx.objectStore("products")

    const request = store.delete(productId)

    request.onerror = () => reject(request.error)

    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error)
  })
}
