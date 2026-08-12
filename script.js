/* script.js */
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const darkModeToggle = document.getElementById('dark-mode-toggle');
darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? "☀️ Light Mode" : "🌙 Dark Mode";
});

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

let userStreak = parseInt(localStorage.getItem('mind_growth_streak')) || 0;
const streakDisplay = document.getElementById('streak-counter');
const plantEmoji = document.getElementById('plant-emoji');
streakDisplay.textContent = `Growth Streak: ${userStreak} Days`;

if (userStreak >= 3) plantEmoji.textContent = "🌿";
if (userStreak >= 7) plantEmoji.textContent = "🌳";

document.getElementById('water-plant-btn').addEventListener('click', function() {
    userStreak++;
    localStorage.setItem('mind_growth_streak', userStreak);
    streakDisplay.textContent = `Growth Streak: ${userStreak} Days`;
    
    if (userStreak >= 3 && userStreak < 7) {
        plantEmoji.textContent = "🌿";
    } else if (userStreak >= 7) {
        plantEmoji.textContent = "🌳";
    } else {
        plantEmoji.textContent = "🌱";
    }
    alert("💧 Plant watered successfully! Your growth streak is growing.");
});

const breathingCircle = document.getElementById('breathing-circle');
const startBreathingBtn = document.getElementById('start-breathing-btn');
let breathingInterval = null;

startBreathingBtn.addEventListener('click', function() {
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
        startBreathingBtn.textContent = "Start 4-4-4-4 Pacer";
        breathingCircle.style.transform = "scale(1)";
        breathingCircle.textContent = "Breathe";
        return;
    }

    startBreathingBtn.textContent = "Stop Breathing Pacer";
    let phase = 0;
    const phasesText = ["Inhale (4s)", "Hold (4s)", "Exhale (4s)", "Hold (4s)"];
    
    function runBreathingCycle() {
        breathingCircle.textContent = phasesText[phase];
        if (phase === 0) {
            breathingCircle.style.transform = "scale(1.4)";
            breathingCircle.style.background = "#059669";
        } else if (phase === 2) {
            breathingCircle.style.transform = "scale(1)";
            breathingCircle.style.background = "#34d399";
        }
        phase = (phase + 1) % 4;
    }

    runBreathingCycle();
    breathingInterval = setInterval(runBreathingCycle, 4000);
});

const groundingSteps = [
    "Look around you and name 3 things you can see right now.",
    "Notice 2 things you can physically feel (like your feet on the floor).",
    "Listen closely and name 1 thing you can hear in your room.",
    "Take one slow, deep breath in... and release it completely. You are safe."
];
let currentGroundingIndex = 0;
const groundingText = document.getElementById('grounding-step-text');

document.getElementById('next-grounding-btn').addEventListener('click', function() {
    currentGroundingIndex = (currentGroundingIndex + 1) % groundingSteps.length;
    groundingText.textContent = groundingSteps[currentGroundingIndex];
});

const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answerDiv = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    questionBtn.addEventListener('click', () => {
        const isOpen = answerDiv.style.maxHeight && answerDiv.style.maxHeight !== '0px';
        
        faqItems.forEach(otherItem => {
            otherItem.querySelector('.faq-answer').style.maxHeight = '0px';
            otherItem.querySelector('.faq-icon').textContent = '+';
        });

        if (!isOpen) {
            answerDiv.style.maxHeight = answerDiv.scrollHeight + 'px';
            icon.textContent = '−';
        } else {
            answerDiv.style.maxHeight = '0px';
            icon.textContent = '+';
        }
    });
});

document.getElementById('problem-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const category = document.getElementById('category-select').value;
    const problemText = document.getElementById('problem-input').value.trim();
    if(!problemText) return;

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
        console.error("Error saving post: ", error);
    }
});

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
                responsesHtml += `<div style="font-size:0.85rem; margin-top:5px; color:#4a5568;">💡 ${escapeHtml(res)}</div>`;
            });
        } else {
            responsesHtml = `<div style="font-size:0.85rem; margin-top:5px; color:#a0aec0;"><em>No ideas shared yet. Be the first!</em></div>`;
        }

        postDiv.innerHTML = `
            <span class="badge">${escapeHtml(postData.category)}</span>
            <p style="font-weight: 500; margin: 8px 0;">"${escapeHtml(postData.problem)}"</p>
            <div style="margin: 10px 0;">
                <button onclick="sendHug('${postId}', ${postData.hugs || 0})" style="background:none; border:1px solid #cbd5e0; border-radius:4px; padding:4px 8px; cursor:pointer; font-size:0.8rem;">❤️ Virtual Hug (${postData.hugs || 0})</button>
            </div>
            <div style="border-top:1px solid #edf2f7; padding-top:8px; margin-top:8px;">${responsesHtml}</div>
            <div style="display:flex; gap:5px; margin-top:8px;">
                <input type="text" placeholder="Share an idea..." id="input-${postId}" style="flex:1; padding:5px; font-size:0.8rem; border:1px solid #cbd5e0; border-radius:4px;">
                <button onclick="sendReply('${postId}')" style="background:#34d399; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">Send</button>
            </div>
        `;
        container.appendChild(postDiv);
    });
});

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
    } catch (error) { console.error("Error saving reply: ", error); }
};

window.sendHug = async function(postId, currentHugs) {
    try {
        await db.collection('community_posts').doc(postId).update({ hugs: currentHugs + 1 });
    } catch (error) { console.error("Error updating hugs: ", error); }
};

function escapeHtml(text) {
    if (!text) return '';
    return text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}