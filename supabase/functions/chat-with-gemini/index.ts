
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userData } = await req.json();
    
    console.log('Received chat message:', message);
    console.log('User data provided:', !!userData);
    console.log('Gemini API Key exists:', !!geminiApiKey);

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    // Build context from user data
    let userContext = "";
    let conversationHistory = "";
    
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
        const recentCycles = cycles.slice(-3);
        userContext += `Recent cycles: ${recentCycles.map(c => `${c.cycle_length || 'ongoing'} days`).join(', ')}. `;
      }
      
      if (healthLogs && healthLogs.length > 0) {
        userContext += `Recent health logs: `;
        healthLogs.forEach(log => {
          const logDate = new Date(log.log_date).toLocaleDateString();
          const details = [];
          if (log.flow) details.push(`flow: ${log.flow}`);
          if (log.pain_level) details.push(`pain level: ${log.pain_level}/10`);
          if (log.mood) details.push(`mood: ${log.mood}`);
          if (log.sleep_hours) details.push(`sleep: ${log.sleep_hours}h`);
          if (log.notes) {
            try {
              const notes = JSON.parse(log.notes);
              Object.entries(notes).forEach(([key, value]) => {
                if (value) details.push(`${key}: ${value}`);
              });
            } catch {}
          }
          if (details.length > 0) {
            userContext += `${logDate} (${details.join(', ')}); `;
          }
        });
      }
      
      if (chatHistory && chatHistory.length > 0) {
        conversationHistory = `Previous conversation context:\n${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\n`;
      }
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: `You are Perica, a period tracking assistant. Be conversational, casual yet professional, like texting a knowledgeable friend. Keep responses concise (1-3 sentences max). Never use em dashes. You're an expert on female health: periods, cycles, ovulation, PMS, pregnancy symptoms, menstrual phases, fertility, hormones, and all related topics. Be supportive and informative without being clinical or overly formal.

${conversationHistory}${userContext ? `User's current data: ${userContext}` : ''}

Current user message: ${message}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 150,
      }
    };

    console.log('Making request to Gemini API...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error details:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');
    
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    console.log('Reply generated successfully');

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-gemini function:', error);
    console.error('Error details:', error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
