#!/bin/bash

# Deploy Edge Function Fixes
echo "🚀 Deploying Edge Function Fixes..."
echo ""
echo "This script will deploy the cce-response function with the fixes."
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

# Check if linked to a project
if ! supabase status &> /dev/null; then
    echo "❌ Not linked to a Supabase project. Please run:"
    echo "   supabase link --project-ref your-project-ref"
    exit 1
fi

echo "📦 Deploying cce-response function..."
supabase functions deploy cce-response

if [ $? -eq 0 ]; then
    echo "✅ Function deployed successfully!"
    echo ""
    echo "The following fixes have been deployed:"
    echo "  1. ✅ Frontend now properly reads 'content' field from response_complete"
    echo "  2. ✅ Calculator bypass temporarily disabled (threshold raised to 0.95)"
    echo ""
    echo "Your chat should now work properly!"
else
    echo "❌ Deployment failed. Please check your Supabase configuration."
fi
