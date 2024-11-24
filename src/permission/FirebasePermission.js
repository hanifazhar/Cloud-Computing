import admin from "firebase-admin";


admin.initializeApp({
  credential: admin.credential.cert("./src/middleware/service.json"),
  storageBucket: "fir-firebase-78efd.firebasestorage.app"
});