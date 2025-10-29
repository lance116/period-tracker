# Gemini Edge Function Analysis

## Current Implementation Overview

The `chat-with-gemini` edge function is a Deno-based serverless function that:
- Receives user messages via POST requests
- Collects user context (cycles, health logs, profile)
- Sends prompts to Google Gemini API
- Returns AI-generated responses

## ✅ What's Working Well

### 1. **Input Validation**
- Message length limit (1000 chars)
- Type checking for message and userData
- Early return on invalid input

### 2. **Context Building**
- Comprehensive user data collection (cycles, profile, health logs)
- Chat history included for conversational continuity
- Structured context formatting

### 3. **Error Handling**
- Try-catch blocks implemented
- Error logging to console
- Graceful error messages to client

### 4. **CORS Configuration**
- Proper preflight handling
- Configurable allowed origins
- Correct headers set

### 5. **Security Basics**
- Environment variable for API key
- POST-only endpoint
- Reduced logging to avoid data leaks

### 6. **Prompt Engineering**
- Well-defined persona (Perica assistant)
- Clear instructions (conversational, concise)
- Context injection strategy

## ❌ Critical Issues & Missing Best Practices

### 1. **No Authentication Verification** 🔴 CRITICAL
**Issue:** Function doesn't verify the JWT token from Supabase Auth
**Risk:** Anyone with the function URL can call it and consume your Gemini API quota
**Impact:** High - potential API abuse and cost overruns

```typescript
// Currently missing:
const authHeader = req.headers.get('Authorization');
// No JWT verification
```

### 2. **No Rate Limiting** 🔴 CRITICAL
**Issue:** No limits on requests per user/IP
**Risk:** Abuse, DoS attacks, quota exhaustion
**Impact:** High - could drain Gemini API quota quickly

### 3. **No Request Timeout** 🟡 IMPORTANT
**Issue:** Gemini API calls have no timeout
**Risk:** Function could hang indefinitely
**Impact:** Medium - poor UX, wasted resources

### 4. **Missing Safety Settings** 🟡 IMPORTANT
**Issue:** Gemini API call lacks safety filters
**Risk:** Potentially inappropriate content generation
**Impact:** Medium - could return harmful content

```typescript
// Missing from requestBody:
safetySettings: [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  // etc.
]
```

### 5. **No Retry Logic** 🟡 IMPORTANT
**Issue:** Single API call with no retry on failure
**Risk:** Transient network errors cause hard failures
**Impact:** Medium - poor reliability

### 6. **Error Messages Leak Details** 🟡 IMPORTANT
**Issue:** Some error responses include internal details
```typescript
// Line 149: Exposes status code
throw new Error(`Gemini API error: ${response.status}`);
```

### 7. **No Request Logging/Monitoring** 🟡 IMPORTANT
**Issue:** No structured logging for debugging/analytics
**Risk:** Difficult to troubleshoot issues
**Impact:** Medium - operational challenges

### 8. **No Caching** 🟢 NICE-TO-HAVE
**Issue:** Repeated questions hit API every time
**Risk:** Unnecessary API costs
**Impact:** Low - cost optimization opportunity

### 9. **No Usage Analytics** 🟢 NICE-TO-HAVE
**Issue:** No tracking of:
- Tokens used per request
- Response times
- Error rates
- User engagement metrics

### 10. **CORS Too Permissive** 🟡 IMPORTANT
**Issue:** Defaults to `'*'` if ALLOWED_ORIGINS not set
**Risk:** Any website can call your function
**Impact:** Medium - potential abuse

### 11. **No Input Sanitization** 🟡 IMPORTANT
**Issue:** User input goes directly to Gemini without sanitization
**Risk:** Prompt injection attacks
**Impact:** Medium - could manipulate AI behavior

### 12. **Context Size Not Optimized** 🟢 NICE-TO-HAVE
**Issue:** Sends all chat history and logs without token counting
**Risk:** Could exceed token limits or waste tokens
**Impact:** Low - cost/efficiency concern

## 📋 Recommended Fixes (Priority Order)

### Priority 1: Critical Security

1. **Add Authentication Verification**
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)

// Verify JWT and get user
const authHeader = req.headers.get('Authorization')!
const token = authHeader.replace('Bearer ', '')
const { data: { user }, error } = await supabaseClient.auth.getUser(token)

if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: corsHeaders
  })
}
```

2. **Implement Rate Limiting**
```typescript
// Use Supabase Edge Function built-in rate limiting
// Or implement custom logic with Redis/KV store
```

3. **Fix CORS Configuration**
```typescript
// Set specific origins in Supabase dashboard secrets
const allowedOrigins = ['https://yourdomain.com', 'http://localhost:8080']
```

### Priority 2: Reliability

4. **Add Request Timeout**
```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

const response = await fetch(geminiUrl, {
  ...options,
  signal: controller.signal
})
clearTimeout(timeoutId)
```

5. **Implement Retry Logic**
```typescript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response
      if (response.status === 429) {
        // Rate limited, wait and retry
        await new Promise(r => setTimeout(r, 2000 * (i + 1)))
        continue
      }
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}
```

6. **Add Gemini Safety Settings**
```typescript
safetySettings: [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
]
```

### Priority 3: Operational Excellence

7. **Add Structured Logging**
```typescript
const requestId = crypto.randomUUID()
console.log(JSON.stringify({
  requestId,
  userId: user.id,
  timestamp: new Date().toISOString(),
  messageLength: message.length,
  hasContext: !!userData
}))
```

8. **Sanitize Error Messages**
```typescript
catch (error) {
  console.error('Error:', error) // Log detailed error
  return new Response(JSON.stringify({
    error: 'Unable to process request' // Generic user message
  }), { status: 500, headers: corsHeaders })
}
```

9. **Add Input Sanitization**
```typescript
function sanitizeInput(message: string): string {
  // Remove potential prompt injection patterns
  return message
    .replace(/\n\n+/g, '\n') // Collapse multiple newlines
    .replace(/[^\w\s.,!?'-]/g, '') // Remove special chars
    .trim()
}
```

### Priority 4: Optimization

10. **Implement Simple Caching**
```typescript
// Use Supabase KV or Deno KV for caching common responses
const cacheKey = `chat:${hash(message)}`
const cached = await kv.get(cacheKey)
if (cached) return cached
```

11. **Add Usage Tracking**
```typescript
// Log to Supabase analytics table
await supabaseClient.from('function_analytics').insert({
  function_name: 'chat-with-gemini',
  user_id: user.id,
  tokens_used: estimateTokens(message + reply),
  response_time_ms: Date.now() - startTime,
  success: true
})
```

## 🔧 Environment Variables Needed

Currently using:
- ✅ `GEMINI_API_KEY`
- ⚠️ `ALLOWED_ORIGINS` (optional, defaults to `*`)

Should add:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (for auth verification)
- `MAX_REQUESTS_PER_MINUTE` (rate limit config)
- `ENABLE_CACHING` (feature flag)

## 📊 Testing Recommendations

1. **Unit Tests**
   - Input validation edge cases
   - Context building logic
   - Error handling paths

2. **Integration Tests**
   - End-to-end message flow
   - Authentication verification
   - Rate limiting behavior

3. **Load Tests**
   - Concurrent request handling
   - API quota management
   - Timeout behavior

4. **Security Tests**
   - JWT verification bypass attempts
   - Prompt injection attacks
   - Rate limit evasion

## 🚀 Deployment Checklist

Before deploying to production:
- [ ] Set GEMINI_API_KEY in Supabase dashboard
- [ ] Configure ALLOWED_ORIGINS with production domain
- [ ] Enable authentication verification
- [ ] Set up rate limiting (via Supabase or custom)
- [ ] Configure monitoring/alerting
- [ ] Test error scenarios
- [ ] Document API usage for team
- [ ] Set up cost alerts for Gemini API usage

## 💡 Future Enhancements

1. **Streaming Responses** - Use Gemini streaming API for real-time responses
2. **Multi-turn Conversation** - Better conversation memory management
3. **Personalized Prompts** - Adjust prompt based on user preferences
4. **A/B Testing** - Test different prompt strategies
5. **Analytics Dashboard** - Track usage, popular questions, response quality
6. **Feedback Loop** - Let users rate responses to improve prompts

## Summary

**Current Grade: C+ (Functional but needs security hardening)**

The function works and has good basics, but lacks critical production-ready features:
- ❌ No authentication verification (CRITICAL)
- ❌ No rate limiting (CRITICAL)
- ⚠️ Limited error resilience
- ⚠️ Security improvements needed

**Recommended: Implement Priority 1 & 2 fixes before production use.**
