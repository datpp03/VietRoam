import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey:"AIzaSyAm4IvnvqEWFThGxeIRzPZ813AIfHHDft0",
  authDomain: "travelblog-e4f43.firebaseapp.com",
  projectId: "travelblog-e4f43",
  storageBucket: "travelblog-e4f43.firebasestorage.app",
  messagingSenderId: "393164935087",
  appId: "1:393164935087:web:bbcf576c7746856a54695a",
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
