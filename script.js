// Mood Tracker Feature
document.getElementById('log-mood-btn').addEventListener('click', function() {
    const moods = [
        "😊 Feeling optimistic and balanced today!", 
        "🌿 Feeling calm and grounded.", 
        "🌧️ Feeling a bit overwhelmed today, remember to take it slow.", 
        "⚡ Energetic and ready to tackle your goals!"
    ];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    document.getElementById('mood-output').textContent = randomMood;
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