#!/bin/bash

# Script to apply the get_cortex function fix
# This fixes the "malformed array literal" error

echo "🔧 Applying get_cortex function fix..."
echo ""
echo "This script will fix the 'malformed array literal' error in the get_cortex function."
echo ""

# Check if we have the Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Apply the migration
echo "📝 Applying migration to fix get_cortex function..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "The get_cortex function has been fixed. The array handling error should be resolved."
else
    echo "❌ Failed to apply migration."
    echo ""
    echo "You can manually apply the fix by running this SQL in your Supabase dashboard:"
    echo "  /supabase/migrations/20251021_fix_cortex_array_error.sql"
fi
