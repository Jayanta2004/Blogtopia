# Blogtopia

A modern blog management system built with Vue.js 3 and Supabase, featuring a clean and modern design.

## Features

- **Modern Design**: Clean interface with professional styling
- **Rich Content**: Support for text, images, videos, and more
- **Search**: Real-time blog search functionality
- **Responsive**: Works on desktop, tablet, and mobile
- **No Auth Required**: Open access for easy use
- **Edit Blogs**: Update existing blog posts with full content editing

## Tech Stack

- Vue.js 3 with Composition API
- Supabase (PostgreSQL + API)
- Custom CSS with design system
- Vite for fast development

## Prerequisites

- Node.js 20.19.0 or higher
- npm (comes with Node.js)
- Supabase account (free at supabase.com)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd blogtopia
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase Database

**Step 3.1: Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be created (2-3 minutes)

**Step 3.2: Get Database Credentials**
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the **Project URL** and **anon/public key**

**Step 3.3: Configure Database Connection**
1. Open `src/supabase.js` in your code editor
2. Replace the placeholder values:
   ```javascript
   const supabaseUrl = 'YOUR_PROJECT_URL_HERE'
   const supabaseKey = 'YOUR_ANON_KEY_HERE'
   ```

**Step 3.4: Setup Database Schema**
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `database-setup.sql` file
3. Paste it in the SQL Editor and click **Run**
4. You should see "Database setup completed successfully!" message

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Application
- Open your browser and go to `http://localhost:5173`
- You should see the Blogtopia homepage
- Click "Create Blog" to access the admin panel

## Verification Steps

1. **Homepage loads** with Blogtopia branding
2. **Search bar** is visible and functional
3. **Admin panel** accessible at `/admin`
4. **Empty state** shows "No blogs yet" message
5. **Create new blog** functionality works
6. **Edit existing blogs** using Edit buttons on blog cards or individual blog pages

## Troubleshooting

**Issue: "Failed to load blogs"**
- Check Supabase URL and key in `src/supabase.js`
- Verify database setup was completed
- Check browser console for specific errors

**Issue: "Cannot connect to database"**
- Ensure Supabase project is active
- Verify internet connection
- Check if database-setup.sql was executed successfully

**Issue: Port 5173 already in use**
```bash
# Kill process using the port
npx kill-port 5173
# Or use different port
npm run dev -- --port 3000
```

## Usage

- **Homepage**: View and search all blogs
- **Admin Panel**: Create and manage blog posts at `/admin`
- **Blog Reader**: Read individual posts with rich content
- **Edit Blogs**: Edit existing blogs using the "Edit" button on blog cards or "Edit Blog" button when viewing a post

## Content Types

- Rich text with HTML
- Headings (H1-H4)
- Bullet lists
- Images and videos
- Code blocks
- Quotes
- File downloads

## Build

```bash
npm run build
```

Builds the app for production to the `dist` folder.