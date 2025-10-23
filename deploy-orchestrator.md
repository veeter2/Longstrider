# 🚀 Deploy cce-orchestrator Edge Function

## ⚡ QUICK DEPLOY (2 minutes)

### Step 1: Copy the Function
1. Open this file in VS Code:
   ```
   supabase/functions/cce-orchestrator/index.ts
   ```
2. Select All (Cmd+A) and Copy (Cmd+C)

### Step 2: Deploy to Supabase
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"Edge Functions"** in left sidebar
4. Find **"cce-orchestrator"**
5. Click **"Deploy new version"**
6. Paste the code (Cmd+V)
7. Click **"Deploy"**

### Step 3: Verify
- Check deployment timestamp shows **today (Oct 21, 2025) after 10:05 PM**
- Look for green success message

---

## 🔍 What This Fix Does

The fix at **line 310** removes duplicate `type` fields from SSE events:

```typescript
// BEFORE (broken - duplicate type field):
sendEvent(eventData.type, eventData);
// Results in: {type: 'response_token', type: 'response_token', ...}

// AFTER (fixed - clean event):
const { type, ...eventPayload } = eventData;
sendEvent(type, eventPayload);
// Results in: {timestamp: 1234, token: '...', messageId: '...'}
```

This allows the frontend to properly parse SSE events and display chat messages.

---

## ✅ After Deployment - Test Chat

1. **Clear browser cache** for localhost:3000
2. **Open chat:** http://localhost:3000/cognitive
3. **Open DevTools Console** (F12)
4. **Send message:** "Hello IVY"
5. **Watch for:**
   - `✅ [SSE] Connection established`
   - `🟢 [SSE] First token received`
   - Streaming response appears token-by-token
   - No duplicate event errors in console

---

## 📝 Other Functions Status

All 15 edge functions are present locally:
- ✅ cce-orchestrator (967 lines) - **HAS FIX - NEEDS DEPLOYMENT**
- ✅ cce-response (1687 lines)
- ✅ cce-recall (1837 lines)
- ✅ cognition-fusion-engine (2247 lines)
- ✅ All other functions (see full list with `ls supabase/functions/`)

Only **cce-orchestrator** needs to be deployed for chat to work.

---

## 🔗 Useful Links

- Supabase Dashboard: https://supabase.com/dashboard
- Local dev server: http://localhost:3000
- Chat interface: http://localhost:3000/cognitive

---

**Last updated:** 2025-10-21 22:05 (when fix was applied)
