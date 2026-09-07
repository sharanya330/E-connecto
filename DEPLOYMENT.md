# E-Connecto Deployment Guide for Vercel

## Prerequisites
- Vercel account
- MongoDB Atlas account (or other MongoDB hosting)
- GitHub repository with your code

## Step 1: Prepare Environment Variables

Create the following environment variables in Vercel:

### Required Variables
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/e-connecto?retryWrites=true&w=majority
JWT_SECRET=<generate-a-secure-random-string-minimum-32-characters>
NODE_ENV=production
```

### Generating JWT_SECRET
Run this command locally to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account** at https://www.mongodb.com/cloud/atlas
2. **Create a New Cluster** (Free tier is sufficient for testing)
3. **Configure Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for Vercel
4. **Create Database User**:
   - Go to "Database Access"
   - Create a new user with password authentication
   - Grant "Read and write to any database" permission
5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `frontend` (if applicable)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
4. Add Environment Variables (from Step 1)
5. Click "Deploy"

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Step 4: Post-Deployment Configuration

### 1. Create Admin Account
After deployment, create an admin account using the script:
```bash
# Locally, with production MongoDB URI
MONGODB_URI="your-production-uri" node scripts/create-admin.js
```

Or use the custom admin creation script:
```bash
MONGODB_URI="your-production-uri" node scripts/create-custom-admin.js
```

### 2. Verify Security Headers
Check that security headers are working:
```bash
curl -I https://your-app.vercel.app
```

You should see headers like:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`

### 3. Test Authentication
1. Try logging in with admin credentials
2. Test user registration
3. Test recycler registration and approval flow

## Step 5: Domain Configuration (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Security Checklist

- [ ] JWT_SECRET is a strong, random string (32+ characters)
- [ ] MongoDB Atlas IP whitelist is configured
- [ ] Database user has minimal required permissions
- [ ] Environment variables are set in Vercel (not in code)
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Security headers are active
- [ ] Rate limiting is working
- [ ] Admin account is created with strong password

## Monitoring and Maintenance

### Vercel Logs
- View deployment logs in Vercel dashboard
- Monitor function execution logs
- Set up error alerts

### MongoDB Atlas Monitoring
- Monitor database performance
- Set up alerts for high CPU/memory usage
- Review slow queries

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure TypeScript errors are resolved

### Database Connection Issues
- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access settings
- Ensure database user credentials are correct

### Authentication Issues
- Verify JWT_SECRET is set correctly
- Check cookie settings (secure, httpOnly, sameSite)
- Ensure middleware is not blocking auth routes

## Performance Optimization

1. **Enable Edge Functions** (if needed)
2. **Configure Caching** for static assets
3. **Optimize Images** using Next.js Image component
4. **Monitor Bundle Size** and code-split where necessary

## Support

For issues:
1. Check Vercel deployment logs
2. Review MongoDB Atlas logs
3. Check browser console for client-side errors
4. Review server logs for API errors

---

**Important**: Never commit `.env.local` or `.env.production` files to version control. Always use Vercel's environment variable system for production secrets.
