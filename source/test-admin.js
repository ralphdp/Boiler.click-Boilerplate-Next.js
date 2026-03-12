require("dotenv").config({path: ".env.local"});
const admin = require('firebase-admin');

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

console.log("ProjectId:", projectId);
console.log("ClientEmail:", clientEmail);
console.log("Has Newlines:", privateKey.includes('\n'));
console.log("Has Escaped Newlines:", privateKey.includes('\\n'));

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n').replace(/"/g, ''),
    }),
  });
  console.log("Init successful");
} catch (e) {
  console.error("Init failed:", e);
}
