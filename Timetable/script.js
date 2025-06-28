const firebaseConfig = {
  apiKey: "AIzaSyD8QJpHQ-DFq0Jp0Z1XGmtYpGY70PsdA0k",
  authDomain: "timetable-3bf8f.firebaseapp.com",
  projectId: "timetable-3bf8f",
  storageBucket: "timetable-3bf8f.firebasestorage.app",
  messagingSenderId: "1009639887962",
  appId: "1:1009639887962:web:03417dcac2399c40623463"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let currentUser = null;

// 🔔 Sound for reminders
const beep = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    document.querySelector('.add-btn').disabled = false;
    loadTasks();
  } else {
    await firebase.auth().signInAnonymously();
  }
});

function createTaskElement(task, docId) {
  const container = document.createElement('div');
  container.className = 'task-card';
  container.innerHTML = `
    <h3>${task.title}</h3>
    <p><strong>When:</strong> ${new Date(task.datetime).toLocaleString()}</p>
    <p><strong>Type:</strong> ${task.type} | <strong>Priority:</strong> ${task.priority}</p>
    <div class="task-actions">
      <button onclick="markStatus('${docId}', 'done', this)">✅ Done</button>
      <button onclick="markStatus('${docId}', 'failed', this)">❌ Failed</button>
      <button onclick="deleteTask('${docId}', this)">🗑️ Remove</button>
    </div>
  `;
  document.getElementById('taskList').appendChild(container);
  scheduleReminder(task);
}

async function loadTasks() {
  const snapshot = await db.collection("users").doc(currentUser.uid).collection("tasks").get();
  document.getElementById('taskList').innerHTML = "";

  let total = 0, done = 0, failed = 0, pending = 0;

  snapshot.forEach(doc => {
    const task = doc.data();
    total++;
    if (task.status === "done") done++;
    else if (task.status === "failed") failed++;
    else {
      pending++;
      createTaskElement(task, doc.id); // only show pending tasks
    }
  });

  // ✅ Update stats
  document.getElementById("total-count").textContent = total;
  document.getElementById("done-count").textContent = done;
  document.getElementById("failed-count").textContent = failed;
  document.getElementById("pending-count").textContent = pending;
}


async function addTask() {
  const title = document.getElementById('title').value.trim();
  const datetime = document.getElementById('datetime').value;
  const type = document.getElementById('type').value;
  const priority = document.getElementById('priority').value;

  if (!title || !datetime) {
    alert("Please fill all fields.");
    return;
  }

  const task = { title, datetime, type, priority, status: "pending" };
  const docRef = await db.collection("users").doc(currentUser.uid).collection("tasks").add(task);
  createTaskElement(task, docRef.id);

  document.getElementById('title').value = '';
  document.getElementById('datetime').value = '';
}

function scheduleReminder(task) {
  const timeUntil = new Date(task.datetime).getTime() - Date.now();
  if (timeUntil > 0) {
    setTimeout(() => {
      // 🔔 Send notification
      if (Notification.permission === "granted") {
        new Notification(`⏰ Reminder: ${task.title}`, {
          body: `Scheduled at ${new Date(task.datetime).toLocaleTimeString()}`,
        });
        beep.play();
      } else {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification(`⏰ Reminder: ${task.title}`, {
              body: `Scheduled at ${new Date(task.datetime).toLocaleTimeString()}`,
            });
            beep.play();
          }
        });
      }
    }, timeUntil);
  }
}

// 🎯 Motivation quotes
const motivationalQuotes = [
  "Great job! Keep the momentum going!",
  "You're doing amazing work!",
  "Progress, not perfection!",
  "Every step counts toward success!"
];

function showMotivation() {
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  alert("🎯 " + quote);
}

async function markStatus(docId, status, btn) {
  const card = btn.closest('.task-card');
  await db.collection("users").doc(currentUser.uid).collection("tasks").doc(docId).update({ status });
  if (card) card.remove();
  if (status === 'done') showMotivation();
}

async function deleteTask(docId, btn) {
  const card = btn.closest('.task-card');
  await db.collection("users").doc(currentUser.uid).collection("tasks").doc(docId).delete();
  if (card) card.remove();
}
