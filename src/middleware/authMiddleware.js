import admin from "firebase-admin";

// const credentialsPath = path.resolve('./service.json');
// const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert("./src/middleware/service.json"),
  storageBucket: "fir-firebase-78efd.firebasestorage.app"
});

export const verifyToken = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        message: 'No token provided or invalid token format' });
    }

    const token = authorizationHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({
      status: "error",
      message: 'Invalid token' });
  }
};