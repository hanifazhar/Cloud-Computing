// src/controllers/authController.js
import admin from 'firebase-admin';
import axios from 'axios';

// Signup function
export const signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: "Email and password are required"
            });
        }

        // Create user in Firebase Auth
        const userResponse = await admin.auth().createUser({
            email,
            password,
            emailVerified: false,
            disabled: false,
        });

        // Create a custom token for the user
        // const customToken = await admin.auth().createCustomToken(userResponse.uid);

        // Respond with success
        res.status(201).json({
            status: 'success',
            message: "User created successfully",
            data: {
                // token: customToken,
                uid: userResponse.uid,
                email: userResponse.email,
                emailVerified: userResponse.emailVerified
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Signin function
// Signin function
export const signin = async (req, res) => {
  try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
          return res.status(400).json({
              status: 'error',
              message: "Email and password are required"
          });
      }

      // Log the email and password for debugging (remove in production)
      console.log(`Attempting to sign in user: ${email}`);

      // Verify password using Firebase Auth REST API
      const response = await axios.post(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCJe1CtPxeTjuQ1M5g9Pua0IAX513HZHkI`, // Replace with your actual API key
          {
              email,
              password,
              returnSecureToken: true
          }
      );

      // If we get here, the password was correct
      const firebaseUser = response.data;

      // Get additional user info from Admin SDK
      const user = await admin.auth().getUserByEmail(email);

      // Create a custom token
      // const customToken = await admin.auth().createCustomToken(user.uid);

      // Respond with success
      res.status(200).json({
          status: 'success',
          message: "Successfully signed in",
          data: {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              idToken: firebaseUser.idToken // This is the Firebase ID token
          }
      });
  } catch (error) {
      console.error('Error signing in:', error);

      let errorMessage = "Authentication failed";
      let statusCode = 401;

      // Handle Firebase Auth REST API errors
      if (error.response) {
          const errorCode = error.response.data.error.message;
          console.error('Firebase error response:', error.response.data); // Log the full error response
          switch (errorCode) {
              case 'EMAIL_NOT_FOUND':
                  errorMessage = "No user found with this email";
                  break;
              case 'INVALID_PASSWORD':
                  errorMessage = "Invalid password";
                  break;
              case 'USER_DISABLED':
                  errorMessage = "This account has been disabled";
                  break;
              default:
                  statusCode = 500;
                  errorMessage = "Internal server error";
          }
      }

      res.status(statusCode).json({
          status: 'error',
          message: errorMessage,
          error: error.response?.data?.error?.message || error.message
      });
  }


};
