#!/bin/bash

echo "🚀 Setting up environment variables for CodeCikgu..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local from example
if [ -f "env.example" ]; then
    cp env.example .env.local
    echo "✅ Created .env.local from env.example"
else
    echo "❌ env.example not found. Creating basic .env.local..."
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF
fi

echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local and add your actual Supabase credentials"
echo "2. Get your credentials from: https://supabase.com/dashboard"
echo "3. Run: npm run dev"
echo ""
echo "🔑 Required environment variables:"
echo "   - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon/public key"
echo ""
echo "✅ Environment setup complete!"
