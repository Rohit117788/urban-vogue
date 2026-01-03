const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-in-production'; // Change this in production!

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONTESTS_FILE = path.join(DATA_DIR, 'contests.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialize files if they don't exist
        try {
            await fs.access(USERS_FILE);
        } catch {
            await fs.writeFile(USERS_FILE, JSON.stringify([]));
        }
        
        try {
            await fs.access(CONTESTS_FILE);
        } catch {
            await fs.writeFile(CONTESTS_FILE, JSON.stringify([]));
        }
        
        try {
            await fs.access(POSTS_FILE);
        } catch {
            await fs.writeFile(POSTS_FILE, JSON.stringify([]));
        }
    } catch (error) {
        console.error('Error setting up data directory:', error);
    }
}

// Helper functions
async function readData(file) {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeData(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        const users = await readData(USERS_FILE);
        const user = users.find(u => u.username === username);

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                bio: user.bio,
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password, role = 'member' } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields required' });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
            return res.status(400).json({
                message: 'Password must contain uppercase, lowercase, number, and special character'
            });
        }

        const users = await readData(USERS_FILE);

        // Check if username or email already exists
        if (users.some(u => u.username === username)) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (users.some(u => u.email === email)) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            passwordHash,
            role: 'member', // Always set to member for security
            bio: '',
            preferences: {
                emailNotifications: true,
                contestReminders: true,
                socialUpdates: false
            },
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await writeData(USERS_FILE, users);

        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                bio: newUser.bio,
                preferences: newUser.preferences
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password required' });
        }

        const users = await readData(USERS_FILE);
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Validate new password
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const hasUpper = /[A-Z]/.test(newPassword);
        const hasLower = /[a-z]/.test(newPassword);
        const hasDigit = /[0-9]/.test(newPassword);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

        if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
            return res.status(400).json({
                message: 'Password must contain uppercase, lowercase, number, and special character'
            });
        }

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await writeData(USERS_FILE, users);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User Routes
app.get('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const users = await readData(USERS_FILE);
        const user = users.find(u => u.id === req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            bio: user.bio,
            preferences: user.preferences
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const users = await readData(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === req.params.id);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only allow users to update their own profile (unless admin)
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const updates = req.body;
        const updatedUser = {
            ...users[userIndex],
            ...updates,
            id: users[userIndex].id, // Don't allow ID changes
            passwordHash: users[userIndex].passwordHash // Don't allow password changes here
        };

        users[userIndex] = updatedUser;
        await writeData(USERS_FILE, users);

        res.json({
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                bio: updatedUser.bio,
                preferences: updatedUser.preferences
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/:id/stats', authenticateToken, async (req, res) => {
    try {
        const contests = await readData(CONTESTS_FILE);
        const posts = await readData(POSTS_FILE);

        const userContests = contests.filter(c => 
            c.participants && c.participants.includes(req.params.id)
        ).length;

        const userPosts = posts.filter(p => p.authorId === req.params.id).length;

        const userLikes = posts.reduce((total, post) => {
            return total + (post.likes && post.likes.includes(req.params.id) ? 1 : 0);
        }, 0);

        res.json({
            contests: userContests,
            posts: userPosts,
            likes: userLikes
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/:id/activity', authenticateToken, async (req, res) => {
    try {
        const posts = await readData(POSTS_FILE);
        const contests = await readData(CONTESTS_FILE);

        const activities = [];

        // Add post activities
        posts.filter(p => p.authorId === req.params.id).forEach(post => {
            activities.push({
                type: 'post',
                description: `You created a post: "${post.content.substring(0, 50)}..."`,
                timestamp: post.timestamp
            });
        });

        // Add contest activities
        contests.forEach(contest => {
            if (contest.participants && contest.participants.includes(req.params.id)) {
                activities.push({
                    type: 'contest',
                    description: `You joined the contest: ${contest.title}`,
                    timestamp: contest.participantsJoined?.[req.params.id] || contest.createdAt
                });
            }
        });

        // Sort by timestamp (newest first)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(activities.slice(0, 10)); // Return last 10 activities
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/active', authenticateToken, async (req, res) => {
    try {
        const users = await readData(USERS_FILE);
        // Return last 5 users (simplified - in production, track last activity)
        const activeUsers = users.slice(-5).map(u => ({
            id: u.id,
            username: u.username
        }));

        res.json(activeUsers);
    } catch (error) {
        console.error('Get active users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Contest Routes
app.get('/api/contests', authenticateToken, async (req, res) => {
    try {
        const contests = await readData(CONTESTS_FILE);
        res.json(contests);
    } catch (error) {
        console.error('Get contests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/contests', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { title, description, startDate, endDate, prize } = req.body;

        if (!title || !description || !startDate || !endDate || !prize) {
            return res.status(400).json({ message: 'All fields required' });
        }

        const contests = await readData(CONTESTS_FILE);
        const newContest = {
            id: Date.now().toString(),
            title,
            description,
            startDate,
            endDate,
            prize: parseFloat(prize),
            participants: [],
            participantsJoined: {},
            createdAt: new Date().toISOString(),
            createdBy: req.user.id
        };

        contests.push(newContest);
        await writeData(CONTESTS_FILE, contests);

        res.status(201).json({ contest: newContest });
    } catch (error) {
        console.error('Create contest error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/contests/:id/join', authenticateToken, async (req, res) => {
    try {
        const contests = await readData(CONTESTS_FILE);
        const contestIndex = contests.findIndex(c => c.id === req.params.id);

        if (contestIndex === -1) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const contest = contests[contestIndex];

        if (!contest.participants) {
            contest.participants = [];
        }

        if (contest.participants.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already joined this contest' });
        }

        contest.participants.push(req.user.id);
        if (!contest.participantsJoined) {
            contest.participantsJoined = {};
        }
        contest.participantsJoined[req.user.id] = new Date().toISOString();

        contests[contestIndex] = contest;
        await writeData(CONTESTS_FILE, contests);

        res.json({ message: 'Successfully joined contest', contest });
    } catch (error) {
        console.error('Join contest error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Post Routes
app.get('/api/posts', authenticateToken, async (req, res) => {
    try {
        const posts = await readData(POSTS_FILE);
        const users = await readData(USERS_FILE);

        // Enrich posts with author names
        const enrichedPosts = posts.map(post => {
            const author = users.find(u => u.id === post.authorId);
            return {
                ...post,
                authorName: author ? author.username : 'Unknown'
            };
        });

        // Sort by timestamp (newest first)
        enrichedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(enrichedPosts);
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Post content required' });
        }

        const posts = await readData(POSTS_FILE);
        const newPost = {
            id: Date.now().toString(),
            authorId: req.user.id,
            content: content.trim(),
            likes: [],
            comments: [],
            timestamp: new Date().toISOString()
        };

        posts.push(newPost);
        await writeData(POSTS_FILE, posts);

        res.status(201).json({ post: newPost });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
    try {
        const posts = await readData(POSTS_FILE);
        const postIndex = posts.findIndex(p => p.id === req.params.id);

        if (postIndex === -1) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const post = posts[postIndex];

        if (!post.likes) {
            post.likes = [];
        }

        const likeIndex = post.likes.indexOf(req.user.id);
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(req.user.id);
        }

        posts[postIndex] = post;
        await writeData(POSTS_FILE, posts);

        res.json({ likes: post.likes.length });
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const posts = await readData(POSTS_FILE);
        const postIndex = posts.findIndex(p => p.id === req.params.id);

        if (postIndex === -1) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const post = posts[postIndex];

        // Only allow author or admin to delete
        if (post.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        posts.splice(postIndex, 1);
        await writeData(POSTS_FILE, posts);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Initialize and start server
ensureDataDir().then(() => {
    app.listen(PORT, () => {
        console.log(`Urban Vogue server running on http://localhost:${PORT}`);
        console.log(`Data directory: ${DATA_DIR}`);
    });
}).catch(error => {
    console.error('Failed to start server:', error);
});

