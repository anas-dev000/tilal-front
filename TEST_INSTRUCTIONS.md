# Testing Instructions for Garden Management System Frontend

## Prerequisites
- Node.js installed (v18 or higher recommended)
- npm installed

## Steps to Test the Application

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies (if not already done)
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The application should start on `http://localhost:5173`

### 4. Test Login
Open your browser and go to `http://localhost:5173`

You should be redirected to the login page.

**Test Credentials:**
- **Admin**: 
  - Email: `admin@garden.com`
  - Password: `admin123`
  
- **Worker**:
  - Email: `worker@garden.com`
  - Password: `worker123`

### 5. Test Admin Dashboard
After logging in as admin, you should see:
- Dashboard with statistics cards
- Charts showing task completion and revenue
- Sidebar navigation with menu items
- Language switcher in the top-right

**Test Navigation:**
- Click on "Clients" to see client management page
- Click on "Workers" to see worker management page
- Click on "Tasks" to see task management with before/after photos
- Click on "Invoices" to see invoice center
- Click on "Inventory" to see inventory management

### 6. Test Worker Dashboard
Log out and login as a worker:
- You should see the "My Tasks" page
- Filter tasks by status (All, Pending, In Progress, Completed)
- Click on a task to see task details
- Test photo upload functionality (before/after photos)
- Test material confirmation
- Test start/finish task buttons

### 7. Test Client Portal
Open a new browser tab and go to:
```
http://localhost:5173/client/test-token-123
```

You should see:
- Task details
- Before/after photos
- Invoice information
- Feedback form with star rating

### 8. Test Language Switching
- Click on the language switcher in the top-right
- Switch between English, Arabic, and Bengali
- Verify that:
  - Text changes to the selected language
  - Arabic switches to RTL (right-to-left) layout
  - English and Bengali use LTR (left-to-right) layout

### 9. Test Responsive Design
- Resize your browser window
- Test on mobile view (< 768px)
- Test on tablet view (768px - 1024px)
- Test on desktop view (> 1024px)

## Expected Behavior

### ✅ What Should Work:
- Login/logout functionality
- Role-based routing (admin vs worker)
- All dashboard pages render correctly
- Language switching with RTL/LTR support
- Responsive design on all screen sizes
- Mock data displays correctly
- Forms and modals work
- Navigation between pages
- Client portal accessible via token

### ⚠️ Known Limitations:
- Using mock data (not connected to real backend)
- Photo uploads are simulated (not saved to server)
- Invoice downloads show alert (not generating real PDFs)
- No real-time updates
- No actual API calls

## Troubleshooting

### If the dev server doesn't start:
1. Make sure you're in the `frontend` directory
2. Delete `node_modules` and run `npm install` again
3. Check if port 5173 is already in use
4. Try running `npm run build` to check for errors

### If you see Tailwind CSS errors:
- Make sure `@tailwindcss/postcss` is installed
- Check that `postcss.config.js` uses `@tailwindcss/postcss`
- Verify `index.css` uses `@import "tailwindcss"`

### If translations don't work:
- Check that translation files exist in `public/locales/{en,ar,bn}/translation.json`
- Verify `i18n/index.js` is imported in `main.jsx`
- Check browser console for errors

### If routing doesn't work:
- Verify React Router is installed
- Check that `App.jsx` has all routes configured
- Make sure you're using the correct URLs

## Next Steps

Once testing is complete and everything works:

1. **Connect to Backend API:**
   - Update `.env` with your backend API URL
   - Replace mock data with real API calls in components
   - Use the service functions in `src/services/api.js`

2. **Add Real Authentication:**
   - Integrate with your backend auth system
   - Update `AuthContext.jsx` to use real API calls
   - Implement token refresh logic

3. **Implement File Uploads:**
   - Add real file upload to backend
   - Update photo upload components to send files to API

4. **Add Real-time Features:**
   - Implement WebSocket for real-time updates
   - Add notifications for new tasks

5. **Deploy:**
   - Run `npm run build` to create production build
   - Deploy the `dist` folder to your hosting service

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the terminal for build errors
3. Verify all dependencies are installed
4. Make sure you're using a compatible Node.js version

---

**Happy Testing! 🌿**

