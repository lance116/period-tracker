import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
// Supabase provides these automatically in edge functions
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://rprgyceyksrcsqrtrome.supabase.co';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwcmd5Y2V5a3NyY3NxcnRyb21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzE5NjIsImV4cCI6MjA2NzUwNzk2Mn0.ModO05onhU4l4FyV1Wpr3oMYGZ-zB8FYqkLy2Ro-uUU';

// CORS configuration - permissive for development
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://rprgyceyksrcsqrtrome.supabase.co'
];

function getCorsHeaders(origin: string | null) {
  // For development, allow all localhost origins
  const isLocalhost = origin?.includes('localhost') || origin?.includes('127.0.0.1');
  const isAllowed = origin && (allowedOrigins.includes(origin) || isLocalhost);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : (isLocalhost ? origin : allowedOrigins[0]),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Rate limiting using in-memory store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  userLimit.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - userLimit.count };
}

// Input validation with sanitization
function validateAndSanitizeInput(message: any, userData: any): {
  isValid: boolean;
  error?: string;
  sanitizedMessage?: string;
} {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message must be a non-empty string' };
  }

  if (message.length > 1000) {
    return { isValid: false, error: 'Message too long (max 1000 characters)' };
  }

  if (message.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  if (userData && typeof userData !== 'object') {
    return { isValid: false, error: 'Invalid user data format' };
  }

  // Sanitize input to prevent prompt injection
  const sanitizedMessage = message
    .replace(/\n{3,}/g, '\n\n') // Collapse excessive newlines
    .trim();

  return { isValid: true, sanitizedMessage };
}

// Retry logic with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // Don't retry on client errors (4xx), except rate limits
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }

      // Rate limited or server error - wait and retry
      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10s
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Request timeout');
        if (attempt === maxRetries - 1) {
          throw new Error('Request timeout');
        }
      } else if (attempt === maxRetries - 1) {
        throw error;
      }
      // Wait before retry
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verify environment variables
    if (!openaiApiKey || !supabaseUrl || !supabaseAnonKey) {
      console.error('Missing environment variables', {
        hasOpenAIKey: !!openaiApiKey,
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseAnonKey
      });
      throw new Error('Service configuration error');
    }

    // Extract user ID from JWT token (simplified auth)
    // The JWT is already validated by Supabase's API Gateway
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'No authorization header provided'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract user from JWT using Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Parse the JWT to get user info
    const token = authHeader.replace('Bearer ', '');
    let user;

    try {
      // Decode JWT to get user_id (simple approach)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        user = { id: payload.sub || payload.user_id };
        console.log('User authenticated:', user.id);
      } else {
        throw new Error('Invalid token format');
      }
    } catch (error) {
      console.error('Token parsing error:', error);
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid authentication token'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check rate limit
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again in a minute.'
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(RATE_LIMIT_WINDOW / 1000))
        },
      });
    }

    // Parse and validate input
    const { message, userData } = await req.json();
    const validation = validateAndSanitizeInput(message, userData);

    if (!validation.isValid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sanitizedMessage = validation.sanitizedMessage!;

    // Structured logging
    console.log(JSON.stringify({
      requestId,
      userId: user.id,
      timestamp: new Date().toISOString(),
      messageLength: sanitizedMessage.length,
      hasUserData: !!userData,
      origin
    }));

    // Build context from user data
    let userContext = "";
    let conversationHistory: Array<{ role: string; content: string }> = [];

    if (userData) {
      const { cycles, profile, currentPhase, nextPeriod, healthLogs, chatHistory } = userData;

      if (profile) {
        userContext += `User profile: Average cycle length is ${profile.average_cycle_length || 28} days, average period duration is ${profile.average_period_duration || 5} days. `;
      }

      if (currentPhase) {
        userContext += `Currently in ${currentPhase} phase. `;
      }

      if (nextPeriod) {
        userContext += `Next period predicted for ${nextPeriod}. `;
      }

      if (cycles && cycles.length > 0) {
        // Sort to ensure most recent is last
        const sortedCycles = [...cycles].sort((a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
        const recentCycles = sortedCycles.slice(-3);

        // Get the most recent period info prominently
        const lastPeriod = recentCycles[recentCycles.length - 1];
        const lastStartDate = new Date(lastPeriod.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const lastEndDate = lastPeriod.end_date ? new Date(lastPeriod.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'still ongoing';

        userContext += `Last period: Started ${lastStartDate}, ended ${lastEndDate}. `;

        if (recentCycles.length > 1) {
          userContext += `Previous periods: `;
          recentCycles.slice(0, -1).forEach((c, i) => {
            const startDate = new Date(c.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const endDate = c.end_date ? new Date(c.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'ongoing';
            userContext += `${startDate} to ${endDate}${i < recentCycles.length - 2 ? ', ' : '. '}`;
          });
        }
      }

      if (healthLogs && healthLogs.length > 0) {
        userContext += `Recent health logs: `;
        healthLogs.slice(0, 5).forEach(log => {
          const logDate = new Date(log.log_date).toLocaleDateString();
          const details = [];
          if (log.flow) details.push(`flow: ${log.flow}`);
          if (log.pain_level) details.push(`pain level: ${log.pain_level}/10`);
          if (log.mood) details.push(`mood: ${log.mood}`);
          if (log.sleep_hours) details.push(`sleep: ${log.sleep_hours}h`);
          if (log.notes) {
            try {
              const notes = JSON.parse(log.notes);
              if (notes.symptoms && notes.symptoms.length > 0) {
                details.push(`symptoms: ${notes.symptoms.join(', ')}`);
              }
            } catch {}
          }
          if (details.length > 0) {
            userContext += `${logDate} (${details.join(', ')}); `;
          }
        });
      }

      if (chatHistory && chatHistory.length > 0) {
        conversationHistory = chatHistory.slice(-5).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      }
    }

    // Build OpenAI messages array
    const messages = [
      {
        role: "system",
        content: `You are Perica, a period tracking assistant. Be conversational, casual yet professional, like texting a knowledgeable friend. Keep responses concise (1-3 sentences max). Never use em dashes. You're an expert on female health: periods, cycles, ovulation, PMS, pregnancy symptoms, menstrual phases, fertility, hormones, and all related topics. Be supportive and informative without being clinical or overly formal.${userContext ? `\n\nUser's current data: ${userContext}` : ''}`
      },
      ...conversationHistory,
      {
        role: "user",
        content: sanitizedMessage
      }
    ];

    console.log('Making request to OpenAI API...');

    // Call OpenAI API with retry logic
    const response = await fetchWithRetry(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Fast and cost-effective
          messages: messages,
          temperature: 0.7,
          max_tokens: 150,
          top_p: 0.95,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', {
        requestId,
        status: response.status,
        error: errorText
      });
      throw new Error('AI service unavailable');
    }

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content ||
                  'Sorry, I could not generate a response. Please try again.';

    const responseTime = Date.now() - startTime;

    // Log success metrics
    console.log(JSON.stringify({
      requestId,
      userId: user.id,
      success: true,
      responseTimeMs: responseTime,
      replyLength: reply.length,
      rateLimitRemaining: rateLimit.remaining,
      tokensUsed: data.usage?.total_tokens || 0
    }));

    return new Response(JSON.stringify({ reply }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-Response-Time': String(responseTime)
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Detailed logging for debugging
    console.error(JSON.stringify({
      requestId,
      error: error.message,
      stack: error.stack,
      responseTimeMs: responseTime
    }));

    // Generic error message to user (don't leak internals)
    return new Response(JSON.stringify({
      error: 'Unable to process your request',
      message: 'Please try again in a moment. If the problem persists, contact support.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
