# 🔧 Admin Setup Guide - CodeCikgu

## 🚨 **URGENT ISSUE RESOLUTION**

The user "adamsofi@codecikgu.com" is currently logged in as a regular user instead of admin, and the navigation menu is missing.

## 🔍 **ROOT CAUSES IDENTIFIED:**

1. **Missing Environment Variables**: Supabase connection not configured
2. **Admin Database Schema**: Admin system trying to use non-existent tables
3. **Navigation Component**: Hardcoded navigation instead of proper Navbar component

## ✅ **FIXES IMPLEMENTED:**

### 1. **Admin Authentication System Fixed**
- Updated `src/utils/adminAuth.ts` to work with existing `profiles` table
- Removed dependency on non-existent `admin_users` table
- System now checks `profiles.role` field for admin status

### 2. **Navigation Menu Fixed**
- Updated `src/app/layout.tsx` to use proper `Navbar` component
- Added `ThemeProvider` and `NotificationProvider`
- Navigation now shows proper menu items based on user role

### 3. **Admin Setup Page Created**
- Created `src/app/admin-setup/page.tsx` for easy admin user creation
- Access via: `http://localhost:3000/admin-setup`

## 🚀 **IMMEDIATE ACTION REQUIRED:**

### **Step 1: Set Environment Variables**
Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### **Step 2: Make User Admin**
1. Visit: `http://localhost:3000/admin-setup`
2. Enter email: `adamsofi@codecikgu.com`
3. Click "Make User Admin"
4. User will be updated to admin role

### **Step 3: Restart Development Server**
```bash
npm run dev
```

## 🔐 **HOW TO GET SUPABASE CREDENTIALS:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📱 **NAVIGATION MENU FEATURES:**

### **For Admin Users:**
- Laman Utama
- Playground
- Gamifikasi
- Nota
- Leaderboard
- **Admin Dashboard**
  - Urus Nota
  - Urus Cabaran

### **For Regular Users:**
- Laman Utama
- Playground
- Gamifikasi
- Nota
- Leaderboard

## 🧪 **TESTING THE FIX:**

1. **Check Navigation**: Should see proper menu items
2. **Check Admin Access**: Login as admin should show admin features
3. **Check Role Detection**: System should recognize admin role correctly

## 🚨 **IF ISSUES PERSIST:**

1. **Check Browser Console** for JavaScript errors
2. **Check Network Tab** for failed API calls
3. **Verify Environment Variables** are loaded correctly
4. **Check Database Connection** in Supabase dashboard

## 📞 **SUPPORT:**

If you continue to experience issues:
1. Check the browser console for error messages
2. Verify your Supabase project is active
3. Ensure the `profiles` table exists with `role` field
4. Check if Row Level Security (RLS) policies are blocking access

---

**Status**: ✅ **FIXES IMPLEMENTED** - Ready for testing
**Priority**: 🚨 **URGENT** - Admin access and navigation critical
**Next Steps**: Set environment variables and test admin setup page
