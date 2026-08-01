document.getElementById('log-mood-btn').addEventListener('click', function() {
    const moods = ["😊 Feeling optimistic and balanced", "🌿 Feeling calm and grounded", "🌧️ Feeling a bit overwhelmed today, take it slow", "⚡ Energetic and ready to tackle goals"];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    
    const output = document.getElementById('mood-output');
    output.style.marginTop = "10px";
    output.style.fontWeight = "600";
    output.style.color = "#2b6cb0";
    output.textContent = randomMood;
});