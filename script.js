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

// Anonymous Community Wall Logic
document.getElementById('problem-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const category = document.getElementById('category-select').value;
    const problemText = document.getElementById('problem-input').value;
    
    if(!problemText.trim()) return;

    // Create new post element
    const postDiv = document.createElement('div');
    postDiv.className = 'community-post';
    
    postDiv.innerHTML = `
        <span class="badge">${category}</span>
        <p class="post-text">"${escapeHtml(problemText)}"</p>
        <div class="responses-section">
            <div class="response-item">🌱 <em>Be the first to share an idea or words of encouragement!</em></div>
        </div>
        <div class="reply-box">
            <input type="text" placeholder="Share your idea..." class="reply-input">
            <button class="btn-secondary reply-btn">Send Idea</button>
        </div>
    `;

    // Add event listener to the new reply button inside this post
    attachReplyEvent(postDiv);

    // Prepend new post to the top of the wall container
    const container = document.getElementById('posts-container');
    container.prepend(postDiv);

    // Reset form
    document.getElementById('problem-input').value = '';
});

// Function to handle replying to posts
function attachReplyEvent(postElement) {
    const btn = postElement.querySelector('.reply-btn');
    const input = postElement.querySelector('.reply-input');
    const responsesSection = postElement.querySelector('.responses-section');

    btn.addEventListener('click', function() {
        const replyText = input.value.trim();
        if(!replyText) return;

        // Remove placeholder text if it's the first response
        if(responsesSection.innerHTML.includes('Be the first')) {
            responsesSection.innerHTML = '';
        }

        const newResponse = document.createElement('div');
        newResponse.className = 'response-item';
        newResponse.innerHTML = `💡 <strong>Idea:</strong> ${escapeHtml(replyText)}`;
        responsesSection.appendChild(newResponse);

        input.value = '';
    });
}

// Attach event to the initial sample post
attachReplyEvent(document.querySelector('.community-post'));

// Security helper to prevent HTML injection
function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}