// import admin from "./serviceFirebase";
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert("./src/middleware/service.json")
});
export const verifyToken = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        message: 'No token provided or invalid token format' 
      });
    }

    const token = authorizationHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    console.log(req.user.uid); // Log user ID for debugging
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      status: "error",
      message: 'Invalid token',
      error: error.message
    });
  }
};
