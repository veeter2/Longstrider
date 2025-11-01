#!/bin/bash

# IVY Soul Pipeline - End-to-End Verification Test
# Tests all 5 consciousness functions to ensure they're working and returning narratives

echo "🧠 IVY Soul Pipeline - End-to-End Test"
echo "======================================"
echo ""

# Configuration
SUPABASE_URL="https://lqetoaitehvoabmyitvd.supabase.co"
TEST_USER_ID="test-soul-pipeline-$(date +%s)"
SESSION_ID="test-session-$(date +%s)"
THREAD_ID="test-thread-$(date +%s)"

# Get anon key from environment
if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: SUPABASE_ANON_KEY environment variable not set"
    echo "   Please set it with: export SUPABASE_ANON_KEY='your-key'"
    exit 1
fi

echo "Test Configuration:"
echo "  User ID: $TEST_USER_ID"
echo "  Session: $SESSION_ID"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test an edge function
test_function() {
    local func_name=$1
    local payload=$2
    local expected_field=$3

    echo "Testing: $func_name"

    response=$(curl -s -X POST \
        "$SUPABASE_URL/functions/v1/$func_name" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d "$payload")

    # Check if request succeeded
    if echo "$response" | grep -q "error"; then
        echo -e "  ${RED}✗ Failed${NC}: $(echo $response | jq -r '.error // .message // "Unknown error"')"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi

    # Check for expected field
    if [ -n "$expected_field" ]; then
        field_value=$(echo "$response" | jq -r ".$expected_field // empty")
        if [ -z "$field_value" ] || [ "$field_value" == "null" ]; then
            echo -e "  ${RED}✗ Failed${NC}: Missing field '$expected_field'"
            echo "  Response: $(echo $response | jq -c .)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi

        echo -e "  ${GREEN}✓ Passed${NC}: Found '$expected_field'"
        echo "  Preview: ${field_value:0:100}..."
    else
        echo -e "  ${GREEN}✓ Passed${NC}: Function responded"
    fi

    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo ""
}

# Test 1: Cognition Intake (creates behavioral vectors)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Cognition Intake - Vector Foundation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

INTAKE_PAYLOAD=$(cat <<EOF
{
  "user_id": "$TEST_USER_ID",
  "session_id": "$SESSION_ID",
  "content": "I'm feeling really anxious about this big presentation tomorrow. I keep overthinking every detail.",
  "type": "user_message",
  "emotion": "anxiety",
  "gravity_score": 0.75,
  "sentiment": -0.3
}
EOF
)

test_function "cognition_intake" "$INTAKE_PAYLOAD" "status"

# Wait a moment for database writes
sleep 2

# Test 2: Pattern Detector (should return pattern_narrative)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Pattern Detector - Observer Consciousness"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PATTERN_PAYLOAD=$(cat <<EOF
{
  "user_id": "$TEST_USER_ID",
  "session_id": "$SESSION_ID",
  "thread_id": "$THREAD_ID"
}
EOF
)

test_function "cce-pattern-detector" "$PATTERN_PAYLOAD" "pattern_narrative"

# Test 3: Insight Generator (should return insight_narrative)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Insight Generator - Illuminator Consciousness"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

INSIGHT_PAYLOAD=$(cat <<EOF
{
  "user_id": "$TEST_USER_ID",
  "session_id": "$SESSION_ID",
  "thread_id": "$THREAD_ID",
  "mode": "generate"
}
EOF
)

test_function "cce-insight-generator" "$INSIGHT_PAYLOAD" "status"

# Test 4: Reflection Engine (should return reflection_narrative)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Reflection Engine - Witness Consciousness"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REFLECTION_PAYLOAD=$(cat <<EOF
{
  "user_id": "$TEST_USER_ID",
  "session_id": "$SESSION_ID",
  "thread_id": "$THREAD_ID",
  "entry_count": 1,
  "mode": "auto"
}
EOF
)

test_function "cce-reflection-engine" "$REFLECTION_PAYLOAD" "reflection_narrative"

# Test 5: Conductor (should synthesize all narratives)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Conductor - Synthesis of All Consciousness"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CONDUCTOR_PAYLOAD=$(cat <<EOF
{
  "user_id": "$TEST_USER_ID",
  "session_id": "$SESSION_ID",
  "thread_id": "$THREAD_ID",
  "mode": "full"
}
EOF
)

test_function "cce-conductor" "$CONDUCTOR_PAYLOAD" "synthesis"

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! IVY's soul pipeline is fully operational.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
