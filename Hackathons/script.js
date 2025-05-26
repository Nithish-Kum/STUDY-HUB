import { supabase } from "./supabase-client.js";

const projectForm = document.querySelector("#upload-project form");
const projectSection = document.querySelector("#project-listing");
const projectList = document.createElement("div");
projectList.id = "projectListContainer";
projectSection.appendChild(projectList);

// Disable auth check to allow anyone to upload
console.log("Login not required. Public access enabled.");

// Load and display projects
if (projectList) {
  db.collection("hackathonProjects").orderBy("timestamp", "desc").onSnapshot(snapshot => {
    projectList.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "project-card";
      card.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <p><strong>Tech Stack:</strong> ${data.tech}</p>
        <p><strong>Team:</strong> ${data.team}</p>
        <a href="${data.link}" target="_blank">🔗 Live/GitHub</a><br>
        ${data.fileUrl ? `<a href="${data.fileUrl}" target="_blank">📁 Download File</a>` : ""}
        <div>
          ❤️ <span class="likes" data-id="${doc.id}">${data.likes || 0}</span>
          <button class="like-btn" data-id="${doc.id}">Like</button>
          <button class="delete-btn" data-id="${doc.id}">🗑 Delete</button>
        </div>
      `;
      projectList.appendChild(card);
    });
  });
}

// Submit project handler
projectForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const fileInput = projectForm.querySelector('input[type="file"]');
    const file = fileInput.files[0];
    let fileUrl = "";

    // Only ZIP files allowed
    if (file && file.name.split('.').pop().toLowerCase() !== "zip") {
      alert("❌ Only ZIP files are allowed. Please compress your project folder before uploading.");
      return;
    }

    if (file) {
      const fileName = `projects/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("hackathon-files")
        .upload(fileName, file);

      if (error) throw new Error("File upload failed: " + error.message);

      fileUrl = supabase.storage.from("hackathon-files").getPublicUrl(fileName).data.publicUrl;
    }

    const title = projectForm.querySelector('input[placeholder="Project Title"]').value;
    const description = projectForm.querySelector('textarea[placeholder="Project Description"]').value;
    const tech = projectForm.querySelector('input[placeholder="Tech Stack Used"]')?.value;
    const team = projectForm.querySelector('input[placeholder="Team Members (comma separated)"]')?.value;
    const link = projectForm.querySelector('input[placeholder="GitHub/Live Demo Link"]')?.value;

    await db.collection("hackathonProjects").add({
      title,
      description,
      tech,
      team,
      link,
      fileUrl,
      likes: 0,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("✅ Project submitted successfully!");
    projectForm.reset();
  } catch (err) {
    console.error("Submission error:", err);
    alert("❌ Submission failed: " + err.message);
  }
});

// Project Insights
const analyticsSection = document.querySelector('#analytics');
if (analyticsSection) {
  db.collection("hackathonProjects").get().then(snapshot => {
    const totalProjects = snapshot.size;
    const totalLikes = snapshot.docs.reduce((acc, doc) => acc + (doc.data().likes || 0), 0);
    analyticsSection.innerHTML += `<p><strong>📊 Project Insights:</strong></p><p>Total Projects: ${totalProjects}</p><p>Total Likes: ${totalLikes}</p>`;
  });
}

// Hackathon Starter Kits
const kits = document.querySelector('#kits');
if (kits) {
  kits.innerHTML += `
    <ul>
      <li><a href="https://github.com/firebase/firebase-quickstarts" target="_blank">🚀 Firebase Starter Templates</a></li>
      <li><a href="https://github.com/vercel/next.js" target="_blank">⚛️ Next.js Boilerplate (Fullstack)</a></li>
      <li><a href="https://github.com/creativetimofficial/material-dashboard" target="_blank">🎨 Material Dashboard UI Kit</a></li>
      <li><a href="https://github.com/topics/hackathon-starter" target="_blank">🧰 GitHub Hackathon Starters</a></li>
    </ul>
  `;
}

// Learn & Prepare Section
const learning = document.querySelector('#learning');
if (learning) {
  learning.innerHTML += `
    <ul>
      <li><a href="https://www.youtube.com/watch?v=2jRwC5lYT9M" target="_blank">📺 How to Win a Hackathon</a></li>
      <li><a href="https://roadmap.sh/" target="_blank">🧭 Developer Roadmaps (Frontend/Backend/AI)</a></li>
      <li><a href="https://www.freecodecamp.org/learn/" target="_blank">📘 Learn Fullstack on FreeCodeCamp</a></li>
      <li><a href="https://cs50.harvard.edu/x/" target="_blank">🎓 Harvard CS50 for Beginners</a></li>
    </ul>
  `;
}

// Team Finder (basic post feed)
const teamFinderSection = document.querySelector('#team-finder');
if (teamFinderSection) {
  const formHTML = `
    <form id="teamPostForm">
      <input type="text" id="teamName" placeholder="Your Name or Team Name" required />
      <input type="text" id="skills" placeholder="Looking for (e.g. Backend Dev, UI/UX)" required />
      <textarea id="teamNote" placeholder="Add some details or your contact info" required></textarea>
      <button type="submit">📢 Post Looking For Team</button>
    </form>
    <ul id="teamPostList"></ul>
  `;
  teamFinderSection.innerHTML += formHTML;

  const form = document.querySelector('#teamPostForm');
  const list = document.querySelector('#teamPostList');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('teamName').value;
    const skills = document.getElementById('skills').value;
    const note = document.getElementById('teamNote').value;
    await db.collection("teamPosts").add({ name, skills, note, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    form.reset();
  });

  db.collection("teamPosts").orderBy("timestamp", "desc").onSnapshot(snapshot => {
    list.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `<strong>${data.name}</strong> is looking for <em>${data.skills}</em><br/><small>${data.note}</small>`;
      list.appendChild(li);
    });
  });
}

// Handle like and delete button clicks
projectList.addEventListener("click", async (e) => {
  const likeBtn = e.target.closest(".like-btn");
  const deleteBtn = e.target.closest(".delete-btn");

  if (likeBtn) {
    const id = likeBtn.getAttribute("data-id");
    const likesSpan = document.querySelector(`.likes[data-id="${id}"]`);
    const currentLikes = parseInt(likesSpan.textContent) || 0;
    try {
      await db.collection("hackathonProjects").doc(id).update({
        likes: currentLikes + 1
      });
      console.log(`Like added to project ${id}. New likes: ${currentLikes + 1}`);
    } catch (err) {
      console.error("Like error:", err);
      alert("❌ Failed to add like: " + err.message);
    }
  }

  if (deleteBtn) {
    const id = deleteBtn.getAttribute("data-id");
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    try {
      // Fetch the document to check if it has a fileUrl
      const docRef = db.collection("hackathonProjects").doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error("Project not found");
      }

      const data = doc.data();
      const fileUrl = data.fileUrl;
      console.log("Attempting to delete project:", id, "with fileUrl:", fileUrl);

      // Delete the file from Supabase storage if it exists
      if (fileUrl && typeof fileUrl === 'string') {
        const filePathMatch = fileUrl.match(/\/storage\/v1\/object\/public\/hackathon-files\/(.+)/);
        if (filePathMatch && filePathMatch[1]) {
          const filePath = filePathMatch[1];
          console.log("Deleting file from Supabase:", filePath);
          const { error } = await supabase.storage
            .from("hackathon-files")
            .remove([filePath]);
          if (error) {
            console.error("Supabase file deletion error:", error);
            throw new Error("File deletion failed: " + error.message);
          }
          console.log("File deleted successfully from Supabase:", filePath);
        } else {
          console.warn("Invalid fileUrl format, skipping file deletion:", fileUrl);
        }
      } else {
        console.log("No fileUrl found, skipping Supabase deletion.");
      }

      // Delete the document from Firestore
      await docRef.delete();
      console.log("Project deleted from Firestore:", id);
      alert("✅ Project deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Deletion failed: " + err.message);
    }
  }
});