// Main dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Check if user is logged in
    const user = getCurrentUser();
    if (user) {
        // Load user activity stats only if logged in
        loadUserStats();
        loadRecentActivity();
    } else {
        // Show guest message
        const activityList = document.getElementById('activityList');
        if (activityList) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-info-circle"></i>
                    <p>Please <a href="login.html" style="color: var(--primary-color);">login or register</a> to see your activity and participate in contests.</p>
                    <span class="activity-time">Just now</span>
                </div>
            `;
        }
    }

    // Load contest results (top 3)
    loadContestResults();
});

// Load contest results
async function loadContestResults() {
    try {
        const response = await fetch(`${API_BASE_URL}/contests/results`);
        
        if (response.ok) {
            const results = await response.json();
            if (results.length > 0) {
                displayContestResults(results);
            }
        }
    } catch (error) {
        console.error('Error loading contest results:', error);
    }
}

// Display contest results
function displayContestResults(results) {
    const contestResults = document.getElementById('contestResults');
    const winnersGrid = document.getElementById('winnersGrid');
    
    if (!contestResults || !winnersGrid) return;

    contestResults.style.display = 'block';
    winnersGrid.innerHTML = results.map(winner => {
        const rankClass = winner.rank === 1 ? 'first' : winner.rank === 2 ? 'second' : 'third';
        const medal = winner.rank === 1 ? '🥇' : winner.rank === 2 ? '🥈' : '🥉';
        
        return `
            <div class="winner-card ${rankClass}">
                <div class="winner-rank">${medal}</div>
                <div class="winner-avatar">
                    ${winner.profilePicture 
                        ? `<img src="${winner.profilePicture}" alt="${winner.username}">`
                        : `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 3rem;">UV</div>`
                    }
                </div>
                <div class="winner-name">${winner.username}</div>
                <div class="winner-votes">${winner.votes} ${winner.votes === 1 ? 'vote' : 'votes'}</div>
            </div>
        `;
    }).join('');
}

// Load user statistics
async function loadUserStats() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const stats = await response.json();
            
            const contestsJoined = document.getElementById('contestsJoined');
            const postsMade = document.getElementById('postsMade');
            
            if (contestsJoined) contestsJoined.textContent = stats.contests || 0;
            if (postsMade) postsMade.textContent = stats.posts || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent activity
async function loadRecentActivity() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/activity`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const activities = await response.json();
            const activityList = document.getElementById('activityList');
            
            if (activityList && activities.length > 0) {
                activityList.innerHTML = activities.map(activity => `
                    <div class="activity-item">
                        <i class="fas fa-info-circle"></i>
                        <p>${activity.description}</p>
                        <span class="activity-time">${formatTime(activity.timestamp)}</span>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

