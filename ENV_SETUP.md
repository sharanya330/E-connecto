# Environment Variables Template

## Required Environment Variables

### Database
MONGODB_URI=your_mongodb_connection_string_here

### JWT Secret
JWT_SECRET=your_very_long_random_secret_key_here_minimum_32_characters

### Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app

## Security Notes
1. Never commit `.env.local` or `.env.production` to version control
2. Use strong, randomly generated secrets for JWT_SECRET (minimum 32 characters)
3. Use MongoDB Atlas or a secure MongoDB provider for production
4. Enable IP whitelisting on your MongoDB database
5. Use environment variables in Vercel dashboard for deployment

## Generating Secure Secrets
You can generate a secure JWT secret using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Vercel Deployment
Add these environment variables in your Vercel project settings:
- Go to Project Settings → Environment Variables
- Add each variable with its production value
- Make sure to add them for "Production" environment
