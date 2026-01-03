// Social page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Publish post
    const publishPostBtn = document.getElementById('publishPostBtn');
    const postContent = document.getElementById('postContent');

    if (publishPostBtn) {
        publishPostBtn.addEventListener('click', async function() {
            const content = postContent.value.trim();
            
            if (!content) {
                alert('Please enter some content for your post');
                return;
            }

            const result = await createPost(content);
            
            if (result.success) {
                postContent.value = '';
                loadPosts();
            } else {
                alert('Error creating post: ' + result.message);
            }
        });
    }

    // Load posts
    loadPosts();
    loadActiveMembers();
});

// Load posts
async function loadPosts() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/posts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const posts = await response.json();
            displayPosts(posts);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Display posts
function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">No posts yet. Be the first to share something!</p>';
        return;
    }

    postsContainer.innerHTML = posts.map(post => {
        const user = getCurrentUser();
        const isAuthor = user && user.id === post.authorId;
        
        return `
            <div class="post-card">
                <div class="post-header">
                    <div class="post-author">
                        <div class="user-avatar-small">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="author-info">
                            <span class="author-name">${post.authorName}</span>
                            <span class="post-time">${formatTime(post.timestamp)}</span>
                        </div>
                    </div>
                    ${isAuthor ? `
                        <div class="post-menu">
                            <i class="fas fa-ellipsis-v" onclick="deletePost('${post.id}')"></i>
                        </div>
                    ` : ''}
                </div>
                <div class="post-content">
                    <p>${escapeHtml(post.content)}</p>
                </div>
                ${post.image ? `
                    <div class="post-image">
                        <img src="${post.image}" alt="Post image">
                    </div>
                ` : ''}
                <div class="post-engagement">
                    <button class="engagement-btn" onclick="likePost('${post.id}')">
                        <i class="far fa-heart"></i> Like (${post.likes || 0})
                    </button>
                    <button class="engagement-btn" onclick="commentPost('${post.id}')">
                        <i class="far fa-comment"></i> Comment
                    </button>
                    <button class="engagement-btn" onclick="sharePost('${post.id}')">
                        <i class="far fa-share-square"></i> Share
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Create post
async function createPost(content) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, post: data.post };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Error creating post:', error);
        return { success: false, message: 'Network error' };
    }
}

// Like post
async function likePost(postId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadPosts();
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

// Comment on post
function commentPost(postId) {
    const comment = prompt('Enter your comment:');
    if (comment) {
        // TODO: Implement comment functionality
        alert('Comment feature coming soon!');
    }
}

// Share post
function sharePost(postId) {
    if (navigator.share) {
        navigator.share({
            title: 'Urban Vogue Post',
            text: 'Check out this post on Urban Vogue!',
            url: window.location.href
        });
    } else {
        alert('Share feature coming soon!');
    }
}

// Delete post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadPosts();
        } else {
            alert('Error deleting post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Network error');
    }
}

// Load active members
async function loadActiveMembers() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/users/active`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const members = await response.json();
            displayActiveMembers(members);
        }
    } catch (error) {
        console.error('Error loading active members:', error);
    }
}

// Display active members
function displayActiveMembers(members) {
    const activeMembers = document.getElementById('activeMembers');
    if (!activeMembers) return;

    if (members.length === 0) {
        activeMembers.innerHTML = '<li>No active members</li>';
        return;
    }

    activeMembers.innerHTML = members.map(member => `
        <li>
            <div class="member-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="member-info">
                <span class="member-name">${member.username}</span>
                <span class="member-status">Online</span>
            </div>
        </li>
    `).join('');
}

// Format time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

