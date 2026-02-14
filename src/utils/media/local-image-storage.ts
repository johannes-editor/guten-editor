const DATABASE_NAME = "guten-local-media";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "images";
const IMAGE_REFERENCE_PREFIX = "guten-image://";

const imageUrlByElement = new WeakMap<HTMLImageElement, string>();
const requestTokenByElement = new WeakMap<HTMLImageElement, number>();

interface LocalImageRecord {
    blob: Blob;
    createdAt: number;
}

function hasIndexedDbSupport(): boolean {
    return typeof indexedDB !== "undefined";
}

function generateImageId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function openDatabase(): Promise<IDBDatabase> {
    if (!hasIndexedDbSupport()) {
        return Promise.reject(new Error("IndexedDB is not available."));
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
                database.createObjectStore(OBJECT_STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Unable to open IndexedDB."));
    });
}

function runTransaction<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
    return openDatabase().then((database) => new Promise((resolve, reject) => {
        const transaction = database.transaction(OBJECT_STORE_NAME, mode);
        const store = transaction.objectStore(OBJECT_STORE_NAME);
        const request = operation(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IndexedDB operation failed."));

        transaction.oncomplete = () => database.close();
        transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
        transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
    }));
}

export function isLocalImageReference(value: string): boolean {
    return value.startsWith(IMAGE_REFERENCE_PREFIX);
}

function getReferenceId(reference: string): string | null {
    if (!isLocalImageReference(reference)) return null;
    const id = reference.slice(IMAGE_REFERENCE_PREFIX.length);
    return id.length ? id : null;
}

export async function saveLocalImage(file: Blob): Promise<string> {
    const id = generateImageId();
    const record: LocalImageRecord = {
        blob: file,
        createdAt: Date.now(),
    };

    await runTransaction("readwrite", (store) => store.put(record, id));
    return `${IMAGE_REFERENCE_PREFIX}${id}`;
}

export async function getLocalImageBlob(reference: string): Promise<Blob | null> {
    const id = getReferenceId(reference);
    if (!id) return null;

    const result = await runTransaction<LocalImageRecord | Blob | undefined>("readonly", (store) => store.get(id));
    if (!result) return null;

    if (result instanceof Blob) {
        return result;
    }

    if (typeof result === "object" && "blob" in result && result.blob instanceof Blob) {
        return result.blob;
    }

    return null;
}

export async function resolveImageSource(source: string): Promise<string> {
    if (!isLocalImageReference(source)) return source;

    const blob = await getLocalImageBlob(source);
    if (!blob) return "";

    return URL.createObjectURL(blob);
}

export async function applyImageSourceToElement(image: HTMLImageElement, source: string): Promise<void> {
    const nextToken = (requestTokenByElement.get(image) ?? 0) + 1;
    requestTokenByElement.set(image, nextToken);

    const previousUrl = imageUrlByElement.get(image);

    try {
        const resolvedSource = await resolveImageSource(source);
        if (requestTokenByElement.get(image) !== nextToken) return;

        image.src = resolvedSource || source;

        if (previousUrl && previousUrl !== resolvedSource) {
            URL.revokeObjectURL(previousUrl);
        }

        if (resolvedSource.startsWith("blob:")) {
            imageUrlByElement.set(image, resolvedSource);
        } else {
            imageUrlByElement.delete(image);
        }
    } catch {
        if (requestTokenByElement.get(image) !== nextToken) return;
        image.src = source;
    }
}