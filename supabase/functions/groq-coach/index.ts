// ==============================================================================
// LyricsType Supabase Edge Function: Groq AI Typing Coach
// ==============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { metrics, songTitle, songArtist } = await req.json()
    const groqApiKey = Deno.env.get('GROQ_API_KEY')

    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY is not set on the server environment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const weakKeysList = Object.entries(metrics.characterStats || {})
      .filter(([_, stats]: [string, any]) => stats.incorrect > 0)
      .sort((a: any, b: any) => b[1].incorrect - a[1].incorrect)
      .map(([char]) => char)
      .slice(0, 5)

    const prompt = `You are the master typing coach on LyricsType.
Analyze this user's music typing performance:
Song: "${songTitle}" by ${songArtist}
Gross WPM: ${metrics.grossWpm}
Net WPM: ${metrics.netWpm}
Accuracy: ${metrics.accuracy}%
Errors: ${metrics.errorsCount}
Completion: ${metrics.completionRate}%
Weakest Keys: ${weakKeysList.join(', ') || 'None (Clean run)'}

Respond STRICTLY in JSON format with this exact structure:
{
  "summary": "2 sentences summarizing performance and rhythm",
  "overallGrade": "S" | "A" | "B" | "C" | "D",
  "weakKeys": ["list", "of", "keys"],
  "strengths": ["bullet 1", "bullet 2"],
  "rhythmConsistency": "Analysis of pacing with song beat",
  "recommendedDrills": [
    {"title": "Drill Name", "description": "Why practice this", "sampleText": "5-10 words"}
  ],
  "actionableTips": ["tip 1", "tip 2"]
}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an elite music typing coach. Respond in valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()
    return new Response(data.choices[0].message.content, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
