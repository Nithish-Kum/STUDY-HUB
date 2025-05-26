// Firebase config
const firebaseConfig = {
      apiKey: "AIzaSyAJIYJYc42ZVQiuDq8ILg4m6zwH6iq3saw",
      authDomain: "doubt-discussion-4b7ef.firebaseapp.com",
      projectId: "doubt-discussion-4b7ef",
      storageBucket: "doubt-discussion-4b7ef.firebasestorage.app",
      messagingSenderId: "655905908870",
      appId: "1:655905908870:web:49f090195caedc4b864907",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const form = document.getElementById("doubtForm");
const display = document.getElementById("doubtDisplay");

form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const newDoubt = {
            department: form.department.value,
            subject: form.subject.value,
            semester: form.semester.value,
            topic: form.topic.value,
            title: form.title.value,
            description: form.description.value,
            tags: form.tags.value,
            anonymous: form.anonymous.checked,
            priority: form.priority.value,
            format: form.format.value,
            language: form.language.value,
            createdAt: new Date(),
      };

      try {
            await db.collection("doubts").add(newDoubt);
            form.reset();
            renderDoubts();
      } catch (error) {
            console.error("Error submitting doubt:", error);
      }
});

async function renderDoubts() {
      display.innerHTML = "";

      const sortBy = document.getElementById("sortSelect")?.value || "recent";
      let snapshot;

      if (sortBy === "recent") {
            snapshot = await db.collection("doubts").orderBy("createdAt", "desc").get();
      } else {
            // Get all doubts, process manually
            snapshot = await db.collection("doubts").get();
      }

      const doubtsWithMeta = [];

      for (const doc of snapshot.docs) {
            const d = doc.data();
            const answersSnap = await db.collection("doubts").doc(doc.id).collection("answers").get();

            const totalUpvotes = answersSnap.docs.reduce((sum, a) => sum + (a.data().votes || 0), 0);
            const totalAnswers = answersSnap.size;

            doubtsWithMeta.push({
                  id: doc.id,
                  data: d,
                  upvotes: totalUpvotes,
                  answers: totalAnswers
            });
      }

      // Sort as per selected method
      if (sortBy === "upvotes") {
            doubtsWithMeta.sort((a, b) => b.upvotes - a.upvotes);
      } else if (sortBy === "answers") {
            doubtsWithMeta.sort((a, b) => b.answers - a.answers);
      }

      for (const item of doubtsWithMeta) {
            const { id, data: d } = item;
            const div = document.createElement("div");
            div.className = "doubt-card";

            div.innerHTML = `
      <input type="checkbox" class="select-doubt" data-id="${id}" style="transform: scale(1.3); margin-bottom: 10px;" />
      <h3>${d.title}</h3>
      <p><span class="highlight">Department:</span> ${d.department} | Semester: ${d.semester}</p>
      <p><span class="highlight">Subject:</span> ${d.subject} | Topic: ${d.topic}</p>
      <p><span class="highlight">Description:</span> ${d.description}</p>
      <p><strong>Priority:</strong> ${d.priority}, <strong>Language:</strong> ${d.language}, <strong>Format:</strong> ${d.format}</p>
      <p class="tags">Tags: ${d.tags || 'None'}${d.anonymous ? ' | Posted Anonymously' : ''}</p>
      <div id="answers-${id}" class="answer-list"></div>
      <form class="answer-form" data-id="${id}">
        <textarea name="answerText" placeholder="Write your answer..." required></textarea>
        <input type="text" name="answeredBy" placeholder="Your name (or Anonymous)" />
        <button type="submit">Post Answer</button>
      </form>
    `;

            display.appendChild(div);
            loadAnswers(id);
      }

      document.querySelectorAll(".answer-form").forEach(form => {
            form.addEventListener("submit", async function (e) {
                  e.preventDefault();
                  const id = form.getAttribute("data-id");
                  const answerText = form.answerText.value;
                  const answeredBy = form.answeredBy.value || "Anonymous";
                  await db.collection("doubts").doc(id).collection("answers").add({
                        answerText,
                        answeredBy,
                        votes: 0,
                        createdAt: new Date()
                  });
                  form.reset();
                  loadAnswers(id);
            });
      });

      createBulkDeleteButton();
}


async function loadAnswers(doubtId) {
      const answerDisplay = document.getElementById(`answers-${doubtId}`);
      answerDisplay.innerHTML = "";
      const answers = await db.collection("doubts").doc(doubtId).collection("answers").orderBy("createdAt").get();

      answers.forEach(ansDoc => {
            const data = ansDoc.data();
            const div = document.createElement("div");
            div.className = "answer-item";
            div.innerHTML = `
      <p><strong>${data.answeredBy}:</strong> ${data.answerText}</p>
      <button onclick="editAnswer('${doubtId}', '${ansDoc.id}', '${data.answerText.replace(/'/g, "\\'")}')">Edit</button>
      <button onclick="deleteAnswer('${doubtId}', '${ansDoc.id}')">Delete</button>
      <button onclick="voteAnswer('${doubtId}', '${ansDoc.id}', 1)">⬆️ ${data.votes || 0}</button>
    `;
            answerDisplay.appendChild(div);
      });
}

async function editAnswer(doubtId, answerId, oldText) {
      const newText = prompt("Edit your answer:", oldText);
      if (newText && newText !== oldText) {
            await db.collection("doubts").doc(doubtId).collection("answers").doc(answerId).update({
                  answerText: newText
            });
            loadAnswers(doubtId);
      }
}

async function deleteAnswer(doubtId, answerId) {
      if (confirm("Are you sure you want to delete this answer?")) {
            await db.collection("doubts").doc(doubtId).collection("answers").doc(answerId).delete();
            loadAnswers(doubtId);
      }
}

async function voteAnswer(doubtId, answerId, change) {
      const ref = db.collection("doubts").doc(doubtId).collection("answers").doc(answerId);
      const doc = await ref.get();
      if (doc.exists) {
            const data = doc.data();
            await ref.update({
                  votes: (data.votes || 0) + change
            });
            loadAnswers(doubtId);
      }
}

// Bulk delete function
function createBulkDeleteButton() {
      let existing = document.getElementById("bulkDeleteBtn");
      if (existing) existing.remove();

      const btn = document.createElement("button");
      btn.id = "bulkDeleteBtn";
      btn.textContent = "🗑️ Delete Selected Doubts";
      btn.style = "margin: 20px auto; display: block; padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer;";
      btn.onclick = async () => {
            const selected = document.querySelectorAll(".select-doubt:checked");
            if (selected.length === 0) return alert("No doubts selected.");

            if (!confirm(`Are you sure you want to delete ${selected.length} doubt(s)?`)) return;

            for (const checkbox of selected) {
                  const doubtId = checkbox.getAttribute("data-id");
                  const answers = await db.collection("doubts").doc(doubtId).collection("answers").get();
                  const batch = db.batch();
                  answers.forEach(doc => batch.delete(doc.ref));
                  await batch.commit();
                  await db.collection("doubts").doc(doubtId).delete();
            }

            renderDoubts();
      };

      display.parentElement.insertBefore(btn, display);
}

renderDoubts();
