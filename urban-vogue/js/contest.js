// Contest page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Check if user is logged in for protected actions
    const user = getCurrentUser();
    if (!user) {
        // Hide create contest button if not logged in
        const createContestBtn = document.getElementById('createContestBtn');
        if (createContestBtn) {
            createContestBtn.style.display = 'none';
        }
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            filterContests(filter);
        });
    });

    // Create contest modal
    const createContestBtn = document.getElementById('createContestBtn');
    const createContestModal = document.getElementById('createContestModal');
    const closeCreateContestModal = document.getElementById('closeCreateContestModal');
    const createContestForm = document.getElementById('createContestForm');

    // Check if user is admin before showing create button
    if (!isAdmin()) {
        if (createContestBtn) {
            createContestBtn.style.display = 'none';
        }
    }

    if (createContestBtn && createContestModal) {
        createContestBtn.addEventListener('click', function() {
            createContestModal.style.display = 'block';
        });
    }

    if (closeCreateContestModal && createContestModal) {
        closeCreateContestModal.addEventListener('click', function() {
            createContestModal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === createContestModal) {
            createContestModal.style.display = 'none';
        }
    });

    if (createContestForm) {
        createContestForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const contestData = {
                title: document.getElementById('contestTitle').value,
                description: document.getElementById('contestDescription').value,
                startDate: document.getElementById('contestStartDate').value,
                endDate: document.getElementById('contestEndDate').value,
                prize: parseFloat(document.getElementById('contestPrize').value)
            };

            const result = await createContest(contestData);
            
            if (result.success) {
                alert('Contest created successfully!');
                createContestModal.style.display = 'none';
                createContestForm.reset();
                loadContests();
            } else {
                alert('Error creating contest: ' + result.message);
            }
        });
    }

    // Load contests
    loadContests();
    
    // Load voting info if user is logged in
    const user = getCurrentUser();
    if (user) {
        loadVotingInfo();
    }
});

// Load contests from API
async function loadContests() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/contests`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const contests = await response.json();
            displayContests(contests);
        }
    } catch (error) {
        console.error('Error loading contests:', error);
    }
}

// Display contests
function displayContests(contests) {
    const contestsGrid = document.getElementById('contestsGrid');
    if (!contestsGrid) return;

    if (contests.length === 0) {
        contestsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">No contests available at the moment.</p>';
        return;
    }

    contestsGrid.innerHTML = contests.map(contest => {
        const now = new Date();
        const startDate = new Date(contest.startDate);
        const endDate = new Date(contest.endDate);
        
        let badge = '';
        let badgeClass = '';
        let joinDisabled = false;
        let joinText = 'Join Contest';
        
        if (now < startDate) {
            badge = 'Upcoming';
            badgeClass = 'upcoming';
            joinDisabled = true;
            joinText = 'Coming Soon';
        } else if (now >= startDate && now <= endDate) {
            badge = 'Active';
            badgeClass = 'active';
        } else {
            badge = 'Past';
            badgeClass = 'past';
            joinDisabled = true;
            joinText = 'Ended';
        }

        return `
            <div class="contest-card">
                <div class="contest-badge ${badgeClass}">${badge}</div>
                <div class="contest-header">
                    <h3>${contest.title}</h3>
                    <span class="contest-date">
                        <i class="fas fa-calendar"></i> ${formatDate(contest.startDate)} - ${formatDate(contest.endDate)}
                    </span>
                </div>
                <p class="contest-description">${contest.description}</p>
                <div class="contest-stats">
                    <div class="stat">
                        <i class="fas fa-users"></i>
                        <span>${contest.participants || 0} Participants</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-trophy"></i>
                        <span>$${contest.prize.toLocaleString()} Prize</span>
                    </div>
                </div>
                <div class="contest-actions">
                    <button class="btn btn-primary" onclick="joinContest('${contest.id}')" ${joinDisabled ? 'disabled' : ''}>
                        <i class="fas fa-sign-in-alt"></i> ${joinText}
                    </button>
                    <button class="btn btn-secondary" onclick="viewDetails('${contest.id}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Filter contests
function filterContests(filter) {
    const contestCards = document.querySelectorAll('.contest-card');
    contestCards.forEach(card => {
        const badge = card.querySelector('.contest-badge');
        if (filter === 'all') {
            card.style.display = 'block';
        } else {
            const badgeText = badge.textContent.toLowerCase();
            card.style.display = badgeText.includes(filter) ? 'block' : 'none';
        }
    });
}

// Join contest
async function joinContest(contestId) {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login to join contests');
        return;
    }

    if (!confirm('Are you sure you want to join this contest?')) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/contests/${contestId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Successfully joined the contest!');
            loadContests();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error joining contest:', error);
        alert('Network error. Please try again.');
    }
}

// View contest details
function viewDetails(contestId) {
    alert('Contest details feature coming soon!');
}

// Create contest (admin only)
async function createContest(contestData) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/contests`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contestData)
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, contest: data.contest };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Error creating contest:', error);
        return { success: false, message: 'Network error' };
    }
}

