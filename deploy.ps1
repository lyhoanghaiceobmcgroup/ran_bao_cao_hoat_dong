# RAN Shift Sync System - Deployment Script for Windows
# This script automates the deployment process on Windows

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not a git repository. Initializing..." -ForegroundColor Yellow
    git init
}

# Add all changes
Write-Host "📦 Adding all changes to git..." -ForegroundColor Blue
git add .

# Commit changes
$commitMsg = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "feat: Update RAN Shift Sync System"
}

Write-Host "💾 Committing changes..." -ForegroundColor Blue
git commit -m $commitMsg

# Check if remote origin exists
try {
    git remote get-url origin | Out-Null
    Write-Host "🔗 Remote origin found." -ForegroundColor Green
} catch {
    Write-Host "🔗 No remote origin found." -ForegroundColor Yellow
    $repoUrl = Read-Host "Enter your GitHub repository URL"
    git remote add origin $repoUrl
}

# Push to GitHub
Write-Host "⬆️ Pushing to GitHub..." -ForegroundColor Blue
git branch -M main
git push -u origin main

Write-Host "✅ Code pushed to GitHub successfully!" -ForegroundColor Green

# Supabase deployment
Write-Host "🗄️ Deploying to Supabase..." -ForegroundColor Blue

# Check if Supabase CLI is installed
if (Get-Command supabase -ErrorAction SilentlyContinue) {
    Write-Host "Supabase CLI found. Checking project status..." -ForegroundColor Green
    
    # Check if project is linked
    try {
        supabase status | Out-Null
        Write-Host "📊 Pushing database migrations..." -ForegroundColor Blue
        supabase db push
        Write-Host "✅ Database migrations deployed!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Supabase project not linked." -ForegroundColor Yellow
        Write-Host "Please run: supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor Yellow
        Write-Host "Then run: supabase db push" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Supabase CLI not found." -ForegroundColor Yellow
    Write-Host "Please install it: npm install -g supabase" -ForegroundColor Yellow
}

# Build the project
Write-Host "🔨 Building the project..." -ForegroundColor Blue
npm run build

Write-Host "🎉 Deployment process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy to Vercel/Netlify using your GitHub repository" -ForegroundColor White
Write-Host "2. Set up environment variables in your hosting platform" -ForegroundColor White
Write-Host "3. Configure your custom domain (optional)" -ForegroundColor White
Write-Host "4. Run the CEO account creation script after first deployment" -ForegroundColor White
Write-Host ""
Write-Host "📚 Check README.md for detailed deployment instructions." -ForegroundColor Cyan

Pause