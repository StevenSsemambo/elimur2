# Deployment Notes

## Environment Variables Required
Set these in your Vercel/Netlify dashboard:

- `VITE_SUPABASE_URL` = your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key

## Files Fixed in This Version
1. `vercel.json` - Fixes 404 routing errors on Vercel
2. `public/_redirects` - Fixes 404 routing errors on Netlify  
3. `src/App.jsx` - BrowserRouter moved outside conditional to fix navigation
4. `public/icons/icon-192.png` - Missing PWA icon added
5. `public/icons/icon-512.png` - Missing PWA icon added
