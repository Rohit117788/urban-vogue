// Chat functionality
let chatSocket = null;
let chatPollInterval = null;

function initChat() {
    const user = getCurrentUser();
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatMessages = document.getElementById('chatMessages');

    if (!user) {
        // Disable chat for guests
        if (chatInput) chatInput.disabled = true;
        if (sendChatBtn) sendChatBtn.disabled = true;
        if (chatInput) chatInput.placeholder = 'Please login to chat';
        return;
    }

    // Enable chat for logged in users
    if (chatInput) chatInput.disabled = false;
    if (sendChatBtn) sendChatBtn.disabled = false;

    // Load chat messages
    loadChatMessages();

    // Start polling for new messages
    startChatPolling();

    // Send message on button click
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', sendChatMessage);
    }

    // Send message on Enter key
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
}

async function loadChatMessages() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/chat/messages`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const messages = await response.json();
            displayChatMessages(messages);
        }
    } catch (error) {
        console.error('Error loading chat messages:', error);
    }
}

function displayChatMessages(messages) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Clear existing messages (except system message)
    const systemMsg = chatMessages.querySelector('.system');
    chatMessages.innerHTML = '';
    if (systemMsg) {
        chatMessages.appendChild(systemMsg);
    }

    const user = getCurrentUser();
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        if (user && message.userId === user.id) {
            messageDiv.classList.add('own');
        }

        const avatar = document.createElement('div');
        avatar.className = 'chat-avatar';
        
        if (message.profilePicture) {
            const img = document.createElement('img');
            img.src = message.profilePicture;
            img.alt = message.username;
            avatar.appendChild(img);
        } else {
            avatar.innerHTML = '<i class="fas fa-user"></i>';
        }

        const content = document.createElement('div');
        content.className = 'chat-content';

        const username = document.createElement('div');
        username.className = 'chat-username';
        username.textContent = message.username;

        const text = document.createElement('div');
        text.className = 'chat-text';
        text.textContent = message.message;

        const time = document.createElement('div');
        time.className = 'chat-time';
        time.textContent = formatChatTime(message.timestamp);

        content.appendChild(username);
        content.appendChild(text);
        content.appendChild(time);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        chatMessages.appendChild(messageDiv);
    });

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const user = getCurrentUser();

    if (!user || !chatInput) return;

    const message = chatInput.value.trim();
    if (!message) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/chat/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (response.ok) {
            chatInput.value = '';
            // Reload messages to show new one
            loadChatMessages();
        } else {
            alert('Error sending message');
        }
    } catch (error) {
        console.error('Error sending chat message:', error);
        alert('Network error. Please try again.');
    }
}

function startChatPolling() {
    // Poll for new messages every 2 seconds
    chatPollInterval = setInterval(() => {
        loadChatMessages();
        updateOnlineCount();
    }, 2000);
}

async function updateOnlineCount() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/chat/online`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const onlineCount = document.getElementById('onlineCount');
            if (onlineCount) {
                onlineCount.textContent = `${data.count} online`;
            }
        }
    } catch (error) {
        console.error('Error updating online count:', error);
    }
}

function formatChatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (chatPollInterval) {
        clearInterval(chatPollInterval);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    initChat();
});

