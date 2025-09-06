#!/bin/bash

# RAN Shift Sync System - Deployment Script
# This script automates the deployment process

echo "🚀 Starting deployment process..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
fi

# Add all changes
echo "📦 Adding all changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="feat: Update RAN Shift Sync System"
fi
git commit -m "$commit_msg"

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 No remote origin found."
    read -p "Enter your GitHub repository URL: " repo_url
    git remote add origin "$repo_url"
fi

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ Code pushed to GitHub successfully!"

# Supabase deployment
echo "🗄️ Deploying to Supabase..."
if command -v supabase &> /dev/null; then
    echo "Supabase CLI found. Checking project status..."
    
    # Check if project is linked
    if supabase status > /dev/null 2>&1; then
        echo "📊 Pushing database migrations..."
        supabase db push
        echo "✅ Database migrations deployed!"
    else
        echo "⚠️ Supabase project not linked."
        echo "Please run: supabase link --project-ref YOUR_PROJECT_REF"
        echo "Then run: supabase db push"
    fi
else
    echo "⚠️ Supabase CLI not found."
    echo "Please install it: npm install -g supabase"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

echo "🎉 Deployment process completed!"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel/Netlify using your GitHub repository"
echo "2. Set up environment variables in your hosting platform"
echo "3. Configure your custom domain (optional)"
echo "4. Run the CEO account creation script after first deployment"
echo ""
echo "📚 Check README.md for detailed deployment instructions."