# 🚀 Database Setup Instructions

## URGENT: Run This SQL Schema First!

The error `"Could not find the table 'public.issues' in the schema cache"` means your database tables don't exist yet.

### Steps to Fix:

1. **Open Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy the Schema**
   - Copy ALL content from `supabase-schema.sql` file
   - Paste it into the SQL editor

4. **Execute the Schema**
   - Click "Run" button
   - Wait for all commands to complete
   - You should see "Success. No rows returned" for most commands

5. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `issues` ✅
     - `issue_comments` ✅
     - `notifications` ✅

6. **Verify Storage Bucket**
   - Go to "Storage" in the left sidebar
   - You should see `issue-images` bucket ✅

## After Database Setup:

1. **Restart your app**: The app should work immediately after database creation
2. **Test anonymous reporting**: Should work without errors
3. **Test image upload**: Should work if network allows

## Current Status:
- ✅ AI Analysis Working (Pothole → Roads mapping successful)
- ✅ Category Validation Working 
- ❌ Database Tables Missing (RUN SCHEMA NOW!)
- ❌ Storage Upload (Will work after schema)

## Need Help?
If you encounter any issues during schema execution, check the SQL editor error messages and let me know!
