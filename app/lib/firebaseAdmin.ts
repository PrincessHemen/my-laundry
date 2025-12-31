// app/lib/firebaseAdmin.ts
import admin from 'firebase-admin';

const initAdmin = () => {
  if (admin.apps.length > 0) return admin;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing from environment variables.");
  }

  try {
    // Parse the JSON
    const serviceAccount = JSON.parse(serviceAccountKey);

    // Fix newlines in the private key
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
    // This will show up in Vercel logs with more detail
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format.");
  }
};

const app = initAdmin();

export const adminAuth = app.auth();
export const adminDb = app.firestore();