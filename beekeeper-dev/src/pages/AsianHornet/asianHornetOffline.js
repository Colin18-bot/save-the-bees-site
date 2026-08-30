const DB_NAME = "hivetag-asian-hornet";
const DB_VERSION = 1;
const STORE_NAME = "photo-drafts";

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (
      typeof window === "undefined" ||
      !window.indexedDB
    ) {
      reject(
        new Error(
          "Offline photo storage is not supported by this browser."
        )
      );
      return;
    }

    const request = window.indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (
        !db.objectStoreNames.contains(
          STORE_NAME
        )
      ) {
        db.createObjectStore(
          STORE_NAME,
          {
            keyPath: "user_id",
          }
        );
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(
        request.error ||
          new Error(
            "Offline storage could not be opened."
          )
      );
    };
  });
}

export function supportsAsianHornetOfflineDrafts() {
  return (
    typeof window !== "undefined" &&
    Boolean(window.indexedDB)
  );
}

export async function saveAsianHornetOfflineDraft({
  userId,
  photos,
  location,
  observedAt,
}) {
  if (!userId) {
    throw new Error(
      "A user is required to save an offline draft."
    );
  }

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store =
      transaction.objectStore(
        STORE_NAME
      );

    const storedPhotos = (
      photos || []
    ).map((photo) => ({
      id: photo.id,
      file: photo.file,
    }));

    store.put({
      user_id: userId,
      observed_at:
        observedAt ||
        new Date().toISOString(),
      location: location || null,
      photos: storedPhotos,
      updated_at:
        new Date().toISOString(),
    });

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      const error =
        transaction.error ||
        new Error(
          "The offline observation could not be saved."
        );

      db.close();
      reject(error);
    };

    transaction.onabort = () => {
      const error =
        transaction.error ||
        new Error(
          "The offline observation could not be saved."
        );

      db.close();
      reject(error);
    };
  });
}

export async function getAsianHornetOfflineDraft(
  userId
) {
  if (!userId) return null;

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store =
      transaction.objectStore(
        STORE_NAME
      );

    const request = store.get(userId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(
        request.error ||
          new Error(
            "The offline observation could not be loaded."
          )
      );
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

export async function deleteAsianHornetOfflineDraft(
  userId
) {
  if (!userId) return;

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaction
      .objectStore(STORE_NAME)
      .delete(userId);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      const error =
        transaction.error ||
        new Error(
          "The offline observation could not be removed."
        );

      db.close();
      reject(error);
    };

    transaction.onabort = () => {
      const error =
        transaction.error ||
        new Error(
          "The offline observation could not be removed."
        );

      db.close();
      reject(error);
    };
  });
}