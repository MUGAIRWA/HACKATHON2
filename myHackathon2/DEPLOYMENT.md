# Deployment Guide for Smart Hub

## Option 1: GitHub Pages (Recommended for Hackathon)

### Prerequisites
- GitHub account
- Supabase project set up

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Set up GitHub Secrets**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` (will be created automatically)

4. **Automatic Deployment**
   - The GitHub Action will automatically build and deploy on every push to main
   - Your site will be available at: `https://yourusername.github.io/repository-name`

## Option 2: Manual GitHub Pages Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy dist folder**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: `/dist`

## Option 3: Vercel (Alternative)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables in Vercel dashboard

2. **Environment Variables**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Deploy**
   - Vercel automatically deploys on every push

## Option 4: Netlify (Alternative)

1. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Add your Supabase credentials in Site settings → Environment variables

## Testing Your Deployment

After deployment, test these features:
- [ ] Landing page loads correctly
- [ ] User registration works
- [ ] Login functionality
- [ ] Student dashboard displays
- [ ] Donor dashboard displays
- [ ] Admin dashboard displays
- [ ] Responsive design on mobile

## Troubleshooting

### Common Issues

1. **Blank page after deployment**
   - Check browser console for errors
   - Verify environment variables are set correctly
   - Ensure `base: './'` is set in vite.config.ts

2. **Supabase connection errors**
   - Verify Supabase URL and key are correct
   - Check if Supabase project is active
   - Verify RLS policies are set up

3. **404 errors on refresh**
   - Add `_redirects` file to public folder with: `/* /index.html 200`
   - Or configure your hosting provider for SPA routing

## Performance Optimization

For production, consider:
- Enable gzip compression
- Set up CDN
- Optimize images
- Enable caching headers
- Use environment-specific configurations

## Security Considerations

- Supabase anon key is safe to expose (it's public by design)
- Enable RLS policies in Supabase
- Use HTTPS in production
- Implement proper error handling
- Set up monitoring and logging