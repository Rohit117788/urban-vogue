# How to Start the Server

## Quick Start

1. **Open Terminal/Command Prompt**
   - Navigate to the `urban-vogue` folder
   - Example: `cd D:\Collage\CurserCodes\CodeAlpha\urban-vogue`

2. **Install Dependencies (if not already installed)**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Verify Server is Running**
   - You should see: `Urban Vogue server running on http://localhost:3000`
   - Open browser and go to: `http://localhost:3000`

## Troubleshooting

### Port 3000 Already in Use
If you get an error that port 3000 is already in use:
- Change `PORT` in `server.js` to a different port (e.g., 3001)
- Update `API_BASE_URL` in `js/auth.js` to match the new port

### Dependencies Not Installed
If you get module not found errors:
```bash
npm install express cors bcryptjs jsonwebtoken
```

### Server Won't Start
- Check Node.js is installed: `node --version`
- Check npm is installed: `npm --version`
- Make sure you're in the correct directory

## Testing the Server

Once the server is running, you can test it:
- Open browser: `http://localhost:3000`
- Try to register a new account
- Check browser console (F12) for any errors

