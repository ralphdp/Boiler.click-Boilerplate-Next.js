const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./service-account-key.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const snapshot = await db.collection("omni_audit_traces").orderBy("timestamp", "desc").limit(20).get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`${new Date(data.timestamp).toLocaleString()} ${data.action} ${data.severity} ${data.message}`);
  });
}
run();
