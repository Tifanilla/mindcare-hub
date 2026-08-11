// Your Firebase Backend Configuration 
// (Replace these details with your real credentials from your Firebase Console)
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
};

// Initialize Firebase Backend
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Dark Mode Toggle Logic
const darkModeToggle = document.getElementById('dark-mode-toggle');
darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        darkModeToggle.textContent = "☀️ Light Mode";
    } else {
        darkModeToggle.textContent = "🌙 Dark Mode";
    }
});

// Mood Tracker & Journal Log Feature
document.getElementById('log-mood-btn').addEventListener('click', function() {
    const moods = [
        "😊 Feeling optimistic and balanced today!", 
        "🌿 Feeling calm and grounded.", 
        "🌧️ Feeling a bit overwhelmed today, remember to take it slow.", 
        "⚡ Energetic and ready to tackle your goals!"
    ];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    document.getElementById('mood-output').textContent = randomMood;

    const journalText = document.getElementById('journal-input').value.trim();
    const historyList = document.getElementById('mood-history-list');
    
    const listItem = document.createElement('li');
    listItem.textContent = journalText ? `${randomMood} - "${journalText}"` : `${randomMood}`;
    
    historyList.appendChild(listItem);
    document.getElementById('journal-input').value = '';
});

// Mini Self-Check Feature
document.getElementById('quiz-btn').addEventListener('click', function() {
    const tips = [
        "💡 Tip: Take 3 slow, deep breaths. Inhale for 4 seconds, hold for 4, exhale for 4.",
        "💡 Tip: Step away from screens for 10 minutes and stretch your body.",
        "💡 Tip: Drink a glass of water and write down one thing you're grateful for right now.",
        "💡 Tip: Remember that it's okay to ask for help when things feel heavy."
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('quiz-output').textContent = randomTip;
});

// Handle Submitting Problems to Backend Database
document.getElementById('problem-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const category = document.getElementById('category-select').value;
    const problemText = document.getElementById('problem-input').value;
    
    if(!problemText.trim()) return;

    try {
        await db.collection('community_posts').add({
            category: category,
            problem: problemText,
            hugs: 0,
            responses: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById('problem-input').value = '';
    } catch (error) {
        console.error("Error saving post to backend: ", error);
        alert("Error posting. Please check your Firebase settings in script.js.");
    }
});

// Real-time backend listener to sync and display posts dynamically from database
db.collection('community_posts').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    if (snapshot.empty) {
        container.innerHTML = `<p class="post-text">No posts yet. Be the first to share an anonymous thought!</p>`;
        return;
    }

    snapshot.forEach((doc) => {
        const postData = doc.data();
        const postId = doc.id;

        const postDiv = document.createElement('div');
        postDiv.className = 'community-post';
        
        let responsesHtml = '';
        if (postData.responses && postData.responses.length > 0) {
            postData.responses.forEach(res => {
                responsesHtml += `<div class="response-item">💡 <strong>Idea:</strong> ${escapeHtml(res)}</div>`;
            });
        } else {
            responsesHtml = `<div class="response-item">🌱 <em>Be the first to share an idea or words of encouragement!</em></div>`;
        }

        postDiv.innerHTML = `
            <span class="badge">${escapeHtml(postData.category)}</span>
            <p class="post-text">"${escapeHtml(postData.problem)}"</p>
            <div class="post-actions" style="margin-bottom: 10px;">
                <button class="btn-hug" onclick="sendHug('${postId}', ${postData.hugs || 0})">❤️ Send Virtual Hug (<span class="hug-count">${postData.hugs || 0}</span>)</button>
            </div>
            <div class="responses-section">${responsesHtml}</div>
            <div class="reply-box">
                <input type="text" placeholder="Share your idea..." class="reply-input" id="input-${postId}">
                <button class="btn-secondary reply-btn" onclick="sendReply('${postId}')">Send Idea</button>
            </div>
        `;
        container.appendChild(postDiv);
    });
}, (error) => {
    console.error("Error listening to database changes: ", error);
});

// Function to handle saving suggestions/ideas into the backend database
window.sendReply = async function(postId) {
    const inputField = document.getElementById(`input-${postId}`);
    const replyText = inputField.value.trim();
    if (!replyText) return;

    try {
        const postRef = db.collection('community_posts').doc(postId);
        const doc = await postRef.get();
        if (doc.exists) {
            const currentResponses = doc.data().responses || [];
            currentResponses.push(replyText);
            await postRef.update({ responses: currentResponses });
            inputField.value = '';
        }
    } catch (error) {
        console.error("Error saving reply to backend: ", error);
    }
};

// Function to handle updating virtual hugs in the backend database
window.sendHug = async function(postId, currentHugs) {
    try {
        const postRef = db.collection('community_posts').doc(postId);
        await postRef.update({ hugs: currentHugs + 1 });
    } catch (error) {
        console.error("Error updating hugs in backend: ", error);
    }
};

// Security helper to prevent HTML injection
function escapeHtml(text) {
    if (!text) return '';
    return text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}