// --- FIREBASE CONFIGURATION (For Permanent Cloud Peer Q&A Database) ---
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- THEME STATE PERMANENCE ---
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (localStorage.getItem('mind_dark_mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = "☀️ Light Mode";
}

darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('mind_dark_mode', isDark ? 'enabled' : 'disabled');
    darkModeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// --- PERMANENT LOCALSTORAGE JOURNAL & MOOD HISTORY ---
const historyList = document.getElementById('mood-history-list');
let savedJournals = JSON.parse(localStorage.getItem('mind_journals')) || [];

function renderJournals() {
    historyList.innerHTML = '';
    savedJournals.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry;
        historyList.appendChild(li);
    });
}
renderJournals();

document.getElementById('log-mood-btn').addEventListener('click', function() {
    const moods = ["😊 Optimistic & balanced", "🌿 Calm & grounded", "🌧️ Reflective & slow-paced", "⚡ Energized"];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    const text = document.getElementById('journal-input').value.trim();
    
    const entryString = text ? `${randomMood} - "${text}"` : `${randomMood}`;
    document.getElementById('mood-output').textContent = randomMood;
    
    savedJournals.unshift(entryString);
    localStorage.setItem('mind_journals', JSON.stringify(savedJournals));
    
    renderJournals();
    document.getElementById('journal-input').value = '';
});

// --- PERMANENT GROWTH STREAK STORAGE ---
let userStreak = parseInt(localStorage.getItem('mind_growth_streak')) || 0;
const streakDisplay = document.getElementById('streak-counter');
const plantEmoji = document.getElementById('plant-emoji');
streakDisplay.textContent = `Growth Streak: ${userStreak} Days`;

if (userStreak >= 3 && userStreak < 7) plantEmoji.textContent = "🌿";
if (userStreak >= 7) plantEmoji.textContent = "🌳";

document.getElementById('water-plant-btn').addEventListener('click', function() {
    userStreak++;
    localStorage.setItem('mind_growth_streak', userStreak);
    streakDisplay.textContent = `Growth Streak: ${userStreak} Days`;
    
    if (userStreak >= 3 && userStreak < 7) plantEmoji.textContent = "🌿";
    else if (userStreak >= 7) plantEmoji.textContent = "🌳";
    else plantEmoji.textContent = "🌱";
    
    alert("💧 Plant watered! Your streak has been saved permanently.");
});

// --- BREATHING PACER ---
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
    const textList = ["Inhale (4s)", "Hold (4s)", "Exhale (4s)", "Hold (4s)"];
    
    function cycle() {
        breathingCircle.textContent = textList[phase];
        if (phase === 0) { breathingCircle.style.transform = "scale(1.3)"; breathingCircle.style.background = "#059669"; }
        else if (phase === 2) { breathingCircle.style.transform = "scale(1)"; breathingCircle.style.background = "#34d399"; }
        phase = (phase + 1) % 4;
    }
    cycle();
    breathingInterval = setInterval(cycle, 4000);
});

// --- SOS GROUNDING TOOL ---
const groundingSteps = [
    "Look around and name 3 things you can see right now.",
    "Notice 2 things you can physically touch or feel.",
    "Listen closely and name 1 thing you can hear in your space.",
    "Take one slow, deep breath in... and release it. You are safe."
];
let groundingIndex = 0;
const groundingText = document.getElementById('grounding-step-text');
document.getElementById('next-grounding-btn').addEventListener('click', function() {
    groundingIndex = (groundingIndex + 1) % groundingSteps.length;
    groundingText.textContent = groundingSteps[groundingIndex];
});

// --- ACCORDION FAQ ---
document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    const ans = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');
    btn.addEventListener('click', () => {
        const isOpen = ans.style.maxHeight && ans.style.maxHeight !== '0px';
        document.querySelectorAll('.faq-answer').forEach(a => a.style.maxHeight = '0px');
        document.querySelectorAll('.faq-icon').forEach(i => i.textContent = '+');
        if (!isOpen) { ans.style.maxHeight = ans.scrollHeight + 'px'; icon.textContent = '−'; }
    });
});

// --- PERMANENT PEER Q&A DATABASE SYSTEM ---
document.getElementById('question-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const category = document.getElementById('qa-category').value;
    const questionText = document.getElementById('qa-input').value.trim();
    if (!questionText) return;

    try {
        await db.collection('peer_questions').add({
            category: category,
            question: questionText,
            answers: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('qa-input').value = '';
    } catch (err) {
        console.error("Error saving question to cloud:", err);
    }
});

db.collection('peer_questions').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    const container = document.getElementById('qa-container');
    container.innerHTML = '';
    
    if (snapshot.empty) {
        container.innerHTML = `<p class="post-text">No questions asked yet. Be the first to ask one!</p>`;
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        const id = doc.id;
        const div = document.createElement('div');
        div.className = 'community-post';
        
        let answersHTML = '';
        if (data.answers && data.answers.length > 0) {
            data.answers.forEach(ans => {
                answersHTML += `<div style="font-size:0.85rem; margin-top:6px; color:#4a5568; background:#edf2f7; padding:6px 8px; border-radius:4px;">💡 ${escapeHtml(ans)}</div>`;
            });
        } else {
            answersHTML = `<div style="font-size:0.85rem; margin-top:6px; color:#a0aec0;"><em>No peer answers yet. Be the first to answer!</em></div>`;
        }

        div.innerHTML = `
            <span class="badge">${escapeHtml(data.category)}</span>
            <p style="font-weight: 600; margin: 6px 0;">Q: "${escapeHtml(data.question)}"</p>
            <div style="margin-top: 8px;">
                <div style="font-size: 0.8rem; font-weight: 600; color: #718096; margin-bottom: 4px;">Peer Answers:</div>
                ${answersHTML}
            </div>
            <div style="display:flex; gap:6px; margin-top:10px;">
                <input type="text" placeholder="Write an answer..." id="qa-answer-input-${id}" style="flex:1; padding:6px; font-size:0.8rem; border:1px solid #cbd5e0; border-radius:4px;">
                <button onclick="submitAnswer('${id}')" style="background:#34d399; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600;">Answer</button>
            </div>
        `;
        container.appendChild(div);
    });
});

window.submitAnswer = async function(id) {
    const input = document.getElementById(`qa-answer-input-${id}`);
    const answerText = input.value.trim();
    if (!answerText) return;

    try {
        const ref = db.collection('peer_questions').doc(id);
        const doc = await ref.get();
        if (doc.exists) {
            const currentAnswers = doc.data().answers || [];
            currentAnswers.push(answerText);
            await ref.update({ answers: currentAnswers });
            input.value = '';
        }
    } catch (err) {
        console.error("Error saving answer permanently:", err);
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}