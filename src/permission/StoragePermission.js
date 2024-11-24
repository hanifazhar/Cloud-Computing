import { Storage } from '@google-cloud/storage';

// https://github.com/Bangkit-Capstone-Project/Cloud_computing/blob/master/Backend/src/services/storage/StorageService.js
// Create a new storage instance
const storage = new Storage({
  keyFilename: './src/serviceAccount.json', // Replace with your service account key file path
  projectId: 'chili-monitoring-2024' // Replace with your Google Cloud project ID
});