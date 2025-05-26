const firebaseConfig = {
  apiKey: "AIzaSyBonENFTlDmNVe_CzPJUIjCBZrrcT2ZRSA",
  authDomain: "hackhathons.firebaseapp.com",
  projectId: "hackhathons",
  storageBucket: "hackhathons.firebasestorage.app",
  messagingSenderId: "700146489769",
  appId: "1:700146489769:web:51e809ad14014d20a5ccb8",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
