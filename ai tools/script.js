// Firebase Compat SDK
const firebaseConfig = {
    apiKey: "AIzaSyDR7wdfgAlh8R5ybRxaAcPSAvtaXKWe-0g",
    authDomain: "ai-tools-581a1.firebaseapp.com",
    projectId: "ai-tools-581a1",
    storageBucket: "ai-tools-581a1.appspot.com",
    messagingSenderId: "64417230062",
    appId: "1:64417230062:web:1b700c5d31ea12d98397ff",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

firebase.auth().signInAnonymously()
    .then(() => {
        console.log("Signed in anonymously");
        loadTools(); // Load tools once signed in
    })
    .catch((error) => console.error("Auth error:", error));

// Load and render tools from Firestore
async function loadTools() {
    const toolsContainer = document.getElementById("toolsContainer");
    toolsContainer.innerHTML = "";

    try {
        const snapshot = await db.collection("tools").get();
        const toolsByCategory = {};

        snapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id; // Attach Firestore doc ID
            if (!toolsByCategory[data.category]) {
                toolsByCategory[data.category] = [];
            }
            toolsByCategory[data.category].push(data);
        });

        Object.keys(toolsByCategory).forEach((category) => {
            const div = document.createElement("div");
            div.className = "category bg-white rounded-lg shadow-md p-6";
            div.innerHTML = `<h3 class="text-xl font-semibold mb-4">${category}</h3>`;

            toolsByCategory[category].forEach((tool) => {
                const card = document.createElement("div");
                card.className = "tool-card bg-gray-100 p-4 rounded mb-4";

                card.innerHTML = `
                    <h4 class="text-lg font-bold mb-2">${tool.name}</h4>
                    <p class="text-sm text-gray-600 mb-2">${tool.description}</p>
                    <a href="${tool.url}" class="text-blue-500 hover:underline mr-4" target="_blank">Visit Site</a>
                    <button data-id="${tool.id}" class="delete-btn text-red-500 hover:underline">Delete</button>
                `;
                div.appendChild(card);
            });

            toolsContainer.appendChild(div);
        });

        // 🔥 Attach event listeners to delete buttons AFTER DOM is updated
        document.querySelectorAll('.delete-btn').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm("Are you sure you want to delete this tool?")) {
                    try {
                        await db.collection("tools").doc(id).delete();
                        alert("Tool deleted.");
                        loadTools(); // Refresh list
                    } catch (err) {
                        console.error("Error deleting tool:", err);
                        alert("Failed to delete tool.");
                    }
                }
            });
        });

    } catch (err) {
        console.error("Failed to load tools:", err);
    }
}

// Handle tool form submission
document.addEventListener("DOMContentLoaded", () => {
    const toolForm = document.getElementById("toolForm");
    if (toolForm) {
        toolForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const tool = {
                name: document.getElementById("toolName").value,
                category: document.getElementById("toolCategory").value,
                url: document.getElementById("toolUrl").value,
                description: document.getElementById("toolDescription").value,
                email: document.getElementById("toolEmail").value,
                dateSubmitted: new Date().toISOString(),
            };

            if (Object.values(tool).some(val => !val)) {
                alert("Please fill in all fields.");
                return;
            }

            try {
                await db.collection("tools").add(tool);
                alert("Tool submitted successfully!");
                toolForm.reset();
                loadTools(); // Reload tools
            } catch (error) {
                console.error("Error submitting tool:", error);
                alert("Failed to submit tool.");
            }
        });
    }
});
