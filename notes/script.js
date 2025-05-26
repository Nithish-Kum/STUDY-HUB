const cloudName = "dt0vvpwfb"; // Replace with your Cloudinary cloud name
const uploadPreset = "unsigned_pdfs"; // Replace with your unsigned preset
function uploadToCloudinary(event) {
  const file = event.target.files[0];
  if (!file || file.type !== "application/pdf") {
    alert("Please upload a valid PDF file.");
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  fetch(`https://api.cloudinary.com/v1_1/dt0vvpwfb/upload`, {
  method: "POST",
  body: formData
})
  .then(res => {
    if (!res.ok) {
      return res.json().then(errData => {
        throw new Error(`HTTP error! Status: ${res.status}, Message: ${errData.error ? errData.error.message : "Unknown error"}`);
      });
    }
    return res.json();
  })
  .then(data => {
    if (!data.secure_url) {
      alert(`Upload failed: ${data.error ? data.error.message : "No secure URL returned."}`);
      return;
    }
    const name = file.name;
    const url = data.secure_url;
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    savedNotes.push({ name, url });
    localStorage.setItem("notes", JSON.stringify(savedNotes));
    addNoteToList(name, url);
  })
  .catch(err => {
    console.error("Upload failed:", err);
    // Ensure the error message clearly indicates an authentication issue
    alert(`Upload failed: Check your Cloudinary API key and secret. ${err.message}`);
  });
}
function addNoteToList(name, url) {
  const listItem = document.createElement("li");
  listItem.innerHTML = `
    ${name}
    <div>
      <button class="download-btn" onclick="downloadFile('${url}', '${name}')">Download</button>
      <button class="delete-btn" onclick="deleteNote(this, '${name}')">Delete</button>
    </div>
  `;
  document.getElementById("cseNotes").appendChild(listItem);
}


function downloadFile(url, name) {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name.endsWith('.pdf') ? name : name + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    })
    .catch(err => {
      console.error("Download failed:", err);
      alert("Failed to download PDF.");
    });
}
function deleteNote(button, name) {
  let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
  savedNotes = savedNotes.filter(note => note.name !== name);
  localStorage.setItem("notes", JSON.stringify(savedNotes));

  const listItem = button.closest("li");
  if (listItem) listItem.remove();
}

window.onload = function () {
  document.getElementById("fileUpload").addEventListener("change", uploadToCloudinary);
  const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
  savedNotes.forEach(note => addNoteToList(note.name, note.url));
};
