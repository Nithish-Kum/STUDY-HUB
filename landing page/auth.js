const firebaseConfig = {
  apiKey: "AIzaSyAQ6RXb3hzOj8TlB9eXUFbZXgSDh6KQwO4",
  authDomain: "login-ae957.firebaseapp.com",
  projectId: "login-ae957",
  storageBucket: "login-ae957.appspot.com",
  messagingSenderId: "440004884852",
  appId: "1:440004884852:web:a1fe692168226270589421"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
firebase.auth().signOut().then(() => {
  console.log("User signed out for testing.");
});

firebase.auth().onAuthStateChanged(user => {
  if (user) window.location.href = "index.html";
});

const loginContainer = document.getElementById('loginContainer');
const loginButton = document.getElementById('login');
const signupButton = document.getElementById('signup');
const backButton = document.getElementById('backButton');
const signupFields = document.getElementById('signupFields');
const logoText = document.getElementById('logoText');

let isSignupMode = false;

function toggleSignupMode() {
  isSignupMode = !isSignupMode;
  loginContainer.classList.toggle('signup-mode');
  signupFields.classList.toggle('show');
  backButton.style.display = isSignupMode ? 'block' : 'none';
  logoText.textContent = isSignupMode
    ? 'Create your account to get started!'
    : 'Welcome back! Please sign in to continue.';
  if (!isSignupMode) {
    document.getElementById('studentName').value = '';
    document.getElementById('collegeName').value = '';
  }
}

signupButton.addEventListener('click', function () {
  if (!isSignupMode) {
    toggleSignupMode();
    return;
  }
  this.classList.add('loading');
  handleSignup();
});

backButton.addEventListener('click', toggleSignupMode);

loginButton.addEventListener('click', function () {
  this.classList.add('loading');
  handleLogin();
});

async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || !password) {
    alert("Please fill in both email and password.");
    loginButton.classList.remove('loading');
    return;
  }
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    alert("Login successful!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Login failed: " + error.message);
    console.error("Login Error:", error);
  } finally {
    loginButton.classList.remove('loading');
  }
}

async function handleSignup() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const studentName = document.getElementById('studentName').value.trim();
  const collegeName = document.getElementById('collegeName').value.trim();
  if (!email || !password || !studentName || !collegeName) {
    alert("Please fill in all fields including name and college.");
    signupButton.classList.remove('loading');
    return;
  }

  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    await db.collection('users').doc(user.uid).set({
      email,
      studentName,
      collegeName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Signup successful!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Signup failed: " + error.message);
    console.error("Signup Error:", error);
  } finally {
    signupButton.classList.remove('loading');
  }
}

document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', () => {
    loginButton.classList.remove('loading');
    signupButton.classList.remove('loading');
  });
});
document.getElementById('forgotPasswordLink').addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  if (!email) {
    alert("Please enter your email address to reset password.");
    return;
  }

  try {
    await firebase.auth().sendPasswordResetEmail(email);
    alert("Password reset email sent. Please check your inbox.");
  } catch (error) {
    console.error("Password Reset Error:", error);
    alert("Failed to send reset email: " + error.message);
  }
});
document.getElementById('togglePassword').addEventListener('click', function () {
  const passwordInput = document.getElementById('password');
  const isPassword = passwordInput.getAttribute('type') === 'password';
  passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
  this.textContent = isPassword ? '👁️‍🗨️' : '👁️'; // Toggle between open and slashed eye
});
