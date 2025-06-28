// Cloudinary Configuration
const cloudName = "dt0vvpwfb"; // Replace with your Cloudinary cloud name
const uploadPreset = "unsigned_pdfs"; // Replace with your unsigned preset

// DOM Elements
const fileUpload = document.getElementById('fileUpload');
const notesGrid = document.getElementById('notesGrid');
const emptyState = document.getElementById('emptyState');
const searchBar = document.getElementById('searchBar');
const suggestions = document.getElementById('suggestions');
const menuToggle = document.getElementById('menuToggle');

// Initialize Application
window.onload = function() {
    fileUpload.addEventListener('change', uploadToCloudinary);
    searchBar.addEventListener('input', handleSearch);
    
    loadSavedNotes();
    loadTheme();
    updateEmptyState();
};

// Cloudinary Upload Function
function uploadToCloudinary(event) {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
        showNotification("Please upload a valid PDF file.", "error");
        return;
    }

    // Show upload progress
    showNotification("Uploading PDF...", "info");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
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
            showNotification(`Upload failed: ${data.error ? data.error.message : "No secure URL returned."}`, "error");
            return;
        }
        
        const noteData = {
            name: file.name,
            url: data.secure_url,
            uploadDate: new Date().toISOString(),
            size: formatFileSize(file.size)
        };
        
        saveNote(noteData);
        addNoteCard(noteData);
        updateEmptyState();
        showNotification("PDF uploaded successfully!", "success");
        
        // Reset file input
        fileUpload.value = '';
    })
    .catch(err => {
        console.error("Upload failed:", err);
        showNotification(`Upload failed: ${err.message}`, "error");
    });
}

// Save note to localStorage
function saveNote(noteData) {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    savedNotes.push(noteData);
    localStorage.setItem("notes", JSON.stringify(savedNotes));
}

// Load saved notes
function loadSavedNotes() {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    savedNotes.forEach(note => addNoteCard(note));
}

// Add note card to grid
function addNoteCard(noteData) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-header">
            <div class="card-icon">📄</div>
            <h3>${truncateFileName(noteData.name)}</h3>
        </div>
        <p>Size: ${noteData.size}</p>
        <p>Uploaded: ${formatDate(noteData.uploadDate)}</p>
        <div class="card-actions">
            <button class="btn btn-primary" onclick="downloadFile('${noteData.url}', '${noteData.name}')">
                ⬇️ Download
            </button>
            <button class="btn btn-danger" onclick="deleteNote('${noteData.name}', this)">
                🗑️ Delete
            </button>
        </div>
    `;
    
    notesGrid.appendChild(card);
}

// Download file function
function downloadFile(url, name) {
    showNotification("Downloading file...", "info");
    
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
            showNotification("Download completed!", "success");
        })
        .catch(err => {
            console.error("Download failed:", err);
            showNotification("Failed to download PDF.", "error");
        });
}

// Delete note function
function deleteNote(name, button) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }
    
    let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    savedNotes = savedNotes.filter(note => note.name !== name);
    localStorage.setItem("notes", JSON.stringify(savedNotes));

    const card = button.closest('.card');
    if (card) {
        card.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            card.remove();
            updateEmptyState();
        }, 300);
    }
    
    showNotification("Note deleted successfully!", "success");
}

// Search functionality
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    const cards = notesGrid.querySelectorAll('.card');
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        if (title.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update suggestions (simplified)
    if (query.length > 0) {
        showSuggestions(query);
    } else {
        hideSuggestions();
    }
}

// Show search suggestions
function showSuggestions(query) {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    const filteredNotes = savedNotes.filter(note => 
        note.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    if (filteredNotes.length > 0) {
        suggestions.innerHTML = filteredNotes.map(note => 
            `<li onclick="selectSuggestion('${note.name}')">${note.name}</li>`
        ).join('');
        suggestions.classList.remove('hidden');
    } else {
        hideSuggestions();
    }
}

// Hide suggestions
function hideSuggestions() {
    suggestions.classList.add('hidden');
}

// Select suggestion
function selectSuggestion(fileName) {
    searchBar.value = fileName;
    hideSuggestions();
    handleSearch({ target: { value: fileName } });
}




// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
}

// Load theme
function loadTheme() {
    document.body.classList.add('light');
}


// Update empty state visibility
function updateEmptyState() {
    const hasNotes = notesGrid.children.length > 0;
    if (hasNotes) {
        emptyState.classList.remove('show');
    } else {
        emptyState.classList.add('show');
    }
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 300);
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function truncateFileName(fileName, maxLength = 25) {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4);
    return `${truncatedName}...${extension}`;
}

// Section navigation (for future enhancements)
function showSection(sectionName) {
    console.log(`Switching to section: ${sectionName}`);
    // Add section switching logic here if needed
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchBar.focus();
    }
    
    // Escape to close sidebar
    if (e.key === 'Escape') {
        closeSidebar();
        hideSuggestions();
    }
    
    // Ctrl/Cmd + U for upload focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        fileUpload.click();
    }
});

// Click outside to close suggestions
document.addEventListener('click', (e) => {
    if (!searchBar.contains(e.target) && !suggestions.contains(e.target)) {
        hideSuggestions();
    }
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
`;
document.head.appendChild(style);