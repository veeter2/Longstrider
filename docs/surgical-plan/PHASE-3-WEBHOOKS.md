# Phase 3: Webhook & External Events 🔗

**Priority**: P1 - HIGH
**Timeline**: Week 3
**Status**: Ready for Implementation
**Dependencies**: Phase 1 Complete

---

## Objective

Enable external systems (Slack, email, calendar, etc.) to create memories via secure webhook endpoints, expanding memory creation beyond chat-only.

---

## Success Criteria

- ✅ Webhook endpoint receives external events
- ✅ HMAC signature verification implemented
- ✅ External memories appear in timeline
- ✅ Slack integration functional
- ✅ Rate limiting prevents abuse
- ✅ API documentation complete

---

## Architecture

```
External System (Slack, Email) → Webhook Endpoint (HMAC verified)
                                       ↓
                                cognition_intake
                                       ↓
                                   gravity_map
                                       ↓
                           Memory Timeline (real-time)
```

---

## Tasks

### Task 3.1: Create Webhook Receiver Function

**File**: `supabase/functions/webhook-memory-intake/index.ts` (NEW)
**Estimated Time**: 2 hours

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Verify HMAC signature
function verifySignature(signature: string, body: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret)
  hmac.update(body)
  const expectedSignature = hmac.digest('hex')
  return signature === expectedSignature
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    // Get signature from header
    const signature = req.headers.get('X-Webhook-Signature')
    if (!signature) {
      return new Response('Missing signature', { status: 401, headers: corsHeaders })
    }

    // Read body
    const body = await req.text()

    // Verify signature
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET')!
    if (!verifySignature(signature, body, webhookSecret)) {
      console.error('❌ Invalid webhook signature')
      return new Response('Invalid signature', { status: 401, headers: corsHeaders })
    }

    // Parse payload
    const payload = JSON.parse(body)

    // Validate required fields
    if (!payload.user_id || !payload.content) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders })
    }

    // Transform external event to memory format
    const memory = {
      user_id: payload.user_id,
      content: payload.content,
      type: payload.source || 'external_event',
      metadata: {
        source: payload.source,
        external_id: payload.external_id,
        external_timestamp: payload.timestamp,
        webhook_received_at: new Date().toISOString(),
        raw_payload: payload
      },
      gravity_score: payload.gravity_score || 0.5,
      emotion: payload.emotion || 'neutral'
    }

    // Call cognition_intake to process
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/cognition_intake`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memory)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`cognition_intake failed: ${errorText}`)
    }

    const result = await response.json()

    return new Response(JSON.stringify({
      success: true,
      memory_id: result.memory_id,
      external_id: payload.external_id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
```

---

### Task 3.2: Implement Rate Limiting

**File**: `supabase/functions/webhook-memory-intake/rate-limiter.ts` (NEW)

```typescript
// Simple in-memory rate limiter (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT = 100 // requests
const WINDOW_MS = 60 * 1000 // 1 minute

export function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(userId)

  if (!record || now > record.resetAt) {
    // New window
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + WINDOW_MS
    })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}
```

---

### Task 3.3: Slack Integration Example

**File**: `integrations/slack-webhook.ts` (NEW)

```typescript
// Example: Send Slack messages to LongStrider
import crypto from 'crypto'

const WEBHOOK_URL = 'https://your-project.supabase.co/functions/v1/webhook-memory-intake'
const WEBHOOK_SECRET = 'your-webhook-secret'

function generateSignature(body: string): string {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET)
  hmac.update(body)
  return hmac.digest('hex')
}

async function sendSlackMessageToMemory(slackEvent: any) {
  const payload = {
    user_id: slackEvent.user_id, // Map Slack user to LongStrider user
    content: slackEvent.text,
    source: 'slack',
    external_id: slackEvent.ts,
    timestamp: new Date(parseFloat(slackEvent.ts) * 1000).toISOString(),
    emotion: detectEmotion(slackEvent.text),
    metadata: {
      channel: slackEvent.channel,
      team: slackEvent.team
    }
  }

  const body = JSON.stringify(payload)
  const signature = generateSignature(body)

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature
    },
    body
  })

  return await response.json()
}

function detectEmotion(text: string): string {
  // Simple heuristic
  if (text.match(/[!]{2,}/) || text.match(/excited|amazing|awesome/i)) {
    return 'joy'
  }
  if (text.match(/\?{2,}/) || text.match(/confused|unsure/i)) {
    return 'confusion'
  }
  return 'neutral'
}
```

---

### Task 3.4: API Documentation

**File**: `docs/WEBHOOK_API.md` (NEW)

```markdown
# LongStrider Webhook API

## Overview
External systems can create memories via webhook POST requests with HMAC verification.

## Endpoint
```
POST https://your-project.supabase.co/functions/v1/webhook-memory-intake
```

## Authentication
HMAC-SHA256 signature in `X-Webhook-Signature` header.

### Generating Signature
```javascript
const crypto = require('crypto')
const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET)
hmac.update(JSON.stringify(payload))
const signature = hmac.digest('hex')
```

## Request Format
```json
{
  "user_id": "uuid",
  "content": "Memory content text",
  "source": "slack" | "email" | "calendar" | "custom",
  "external_id": "external-system-id",
  "timestamp": "2025-10-30T12:00:00Z",
  "gravity_score": 0.5,
  "emotion": "neutral",
  "metadata": {}
}
```

## Response Format
```json
{
  "success": true,
  "memory_id": "uuid",
  "external_id": "external-system-id"
}
```

## Rate Limits
- 100 requests per minute per user
- 1000 requests per hour per user

## Example: cURL
```bash
curl -X POST https://your-project.supabase.co/functions/v1/webhook-memory-intake \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: abc123..." \
  -d '{
    "user_id": "user-123",
    "content": "Meeting with team about Q4 planning",
    "source": "calendar",
    "external_id": "cal-event-456"
  }'
```

## Supported Sources
- `slack` - Slack messages
- `email` - Email content
- `calendar` - Calendar events
- `notion` - Notion page updates
- `custom` - Custom integrations
```

---

## Testing

### Manual Test
```bash
# Generate signature
echo -n '{"user_id":"test","content":"Test webhook"}' | \
  openssl dgst -sha256 -hmac "your-secret" | \
  awk '{print $2}'

# Send request
curl -X POST http://localhost:54321/functions/v1/webhook-memory-intake \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: YOUR_SIGNATURE" \
  -d '{"user_id":"test","content":"Test webhook","source":"test"}'
```

### Automated Test
```typescript
describe('Webhook', () => {
  it('accepts valid signature', async () => {
    const payload = { user_id: 'test', content: 'Test' }
    const signature = generateSignature(JSON.stringify(payload))
    const response = await fetch(webhook_url, { ... })
    expect(response.status).toBe(200)
  })

  it('rejects invalid signature', async () => {
    const response = await fetch(webhook_url, {
      headers: { 'X-Webhook-Signature': 'invalid' },
      body: JSON.stringify({ ... })
    })
    expect(response.status).toBe(401)
  })
})
```

---

## Deployment

```bash
# Deploy function
supabase functions deploy webhook-memory-intake

# Set environment variables
supabase secrets set WEBHOOK_SECRET=your-secret-key

# Test production
curl https://your-project.supabase.co/functions/v1/webhook-memory-intake
```

---

## Next Steps

After Phase 3:
1. Integrate with Slack workspace
2. Add email forwarding integration
3. Calendar sync (Google Calendar, Outlook)
4. Move to [Phase 4: Visualizations](./PHASE-4-VISUALIZATIONS.md)

---

**Status**: Ready for Implementation
**Estimated Completion**: End of Week 3
