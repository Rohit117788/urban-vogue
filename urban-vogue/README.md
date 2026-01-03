# Urban Vogue - College Club Website

A modern web application for the Urban Vogue college fashion club with user authentication, contests, social features, and account management.

## Features

- **Dashboard**: Overview of activities, events, and statistics
- **Contest**: Participate in fashion design competitions
- **Social**: Connect with the community, share posts, and interact
- **Account**: Manage profile, settings, and preferences
- **Authentication**: Secure login system with user role differentiation (Member/Admin)

## Sections

1. **Dashboard** (`index.html`)
   - Welcome banner with user information
   - Activity cards for events, contests, and community
   - User statistics and recent activity feed

2. **Contest** (`contest.html`)
   - View active, upcoming, and past contests
   - Join contests and view details
   - Admin can create new contests

3. **Social** (`social.html`)
   - Create and share posts
   - View community feed
   - Like and interact with posts
   - Trending topics and active members

4. **Account** (`account.html`)
   - Profile management
   - Security settings (change password)
   - User preferences
   - Admin panel (for admins only)

## User Roles

- **Member**: Can participate in contests, create posts, and manage their account
- **Admin**: All member privileges plus ability to create contests and manage users

## Installation

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   
   **Windows:** Double-click `start-server.bat` or run:
   ```bash
   npm start
   ```
   
   **Mac/Linux:** Run:
   ```bash
   chmod +x start-server.sh
   ./start-server.sh
   ```
   
   Or manually:
   ```bash
   npm start
   ```

3. **Verify server is running:**
   - You should see: `Urban Vogue server running on http://localhost:3000`
   - Open browser and go to: `http://localhost:3000`
   - Check health: `http://localhost:3000/health`

4. **Create the first admin user (optional but recommended):**
   ```bash
   node setup-admin.js
   ```
   This will create an admin account. Regular users can sign up through the website.

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Troubleshooting Network Errors

If you see "Network error" when trying to login or signup:

1. **Make sure the server is running:**
   - Check the terminal/command prompt for: `Urban Vogue server running on http://localhost:3000`
   - If not running, start it with `npm start`

2. **Check if port 3000 is available:**
   - If port 3000 is in use, change `PORT` in `server.js` to another port (e.g., 3001)
   - Update `API_BASE_URL` in `js/auth.js` to match

3. **Verify Node.js is installed:**
   ```bash
   node --version
   npm --version
   ```

4. **Check browser console (F12):**
   - Look for specific error messages
   - Check Network tab to see if requests are being made

## Project Structure

```
urban-vogue/
├── index.html          # Dashboard page
├── login.html          # Login/Signup page
├── contest.html        # Contest page
├── social.html         # Social feed page
├── account.html        # Account settings page
├── server.js           # Express.js backend server
├── package.json        # Node.js dependencies
├── styles/
│   ├── main.css        # Main stylesheet
│   └── login.css       # Login page styles
├── js/
│   ├── auth.js         # Authentication functions
│   ├── login.js        # Login page logic
│   ├── main.js         # Dashboard logic
│   ├── contest.js      # Contest page logic
│   ├── social.js       # Social page logic
│   └── account.js      # Account page logic
└── data/               # JSON data files (created automatically)
    ├── users.json
    ├── contests.json
    └── posts.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/:id/activity` - Get user activity
- `GET /api/users/active` - Get active members

### Contests
- `GET /api/contests` - Get all contests
- `POST /api/contests` - Create contest (Admin only)
- `POST /api/contests/:id/join` - Join a contest

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a post
- `POST /api/posts/:id/like` - Like/unlike a post
- `DELETE /api/posts/:id` - Delete a post

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Password requirements: minimum 8 characters with uppercase, lowercase, number, and special character
- Admin functions are protected by role-based access control

## Default Data

The application starts with empty data files. Users need to sign up to create accounts. The first user can be manually set as admin by editing `data/users.json` and changing the `role` field to `"admin"`.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile devices

## Development

To modify the application:

1. Frontend: Edit HTML, CSS, and JavaScript files in the root and respective folders
2. Backend: Edit `server.js` for API changes
3. Data: JSON files in `data/` directory are automatically created and managed

## License

ISC

