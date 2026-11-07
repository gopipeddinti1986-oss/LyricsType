import type { TypingMetrics, AICoachAnalysis } from '@/types'

export async function analyzeTypingSession(
  metrics: TypingMetrics,
  songTitle: string,
  songArtist: string
): Promise<AICoachAnalysis> {
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY || ''

  // Compute character weakness from actual typed character statistics
  const weakKeysList = Object.entries(metrics.characterStats || {})
    .filter(([_, stats]) => stats.incorrect > 0)
    .sort((a, b) => b[1].incorrect - a[1].incorrect)
    .map(([char]) => char)
    .slice(0, 5)

  // Grade calculation
  let grade: AICoachAnalysis['overallGrade'] = 'B'
  if (metrics.netWpm >= 85 && metrics.accuracy >= 97) grade = 'S'
  else if (metrics.netWpm >= 65 && metrics.accuracy >= 94) grade = 'A'
  else if (metrics.netWpm >= 45 && metrics.accuracy >= 88) grade = 'B'
  else if (metrics.netWpm >= 30) grade = 'C'
  else grade = 'D'

  // Attempt Groq LLM API request if key is available
  if (groqApiKey && !groqApiKey.includes('your_groq_api_key')) {
    try {
      const prompt = `You are the master typing coach on LyricsType.
Analyze this user's music typing performance:
Song: "${songTitle}" by ${songArtist}
Gross WPM: ${metrics.grossWpm}
Net WPM: ${metrics.netWpm}
Accuracy: ${metrics.accuracy}%
Errors Count: ${metrics.errorsCount}
Completion: ${metrics.completionRate}%
Weakest Keys: ${weakKeysList.join(', ') || 'None (Clean session)'}

Respond STRICTLY in JSON format with this exact structure:
{
  "summary": "2 sentences summarizing performance and rhythm",
  "overallGrade": "${grade}",
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
            {
              role: 'system',
              content: 'You are an elite music typing coach. Respond only in raw JSON without markdown markers.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          response_format: { type: 'json_object' },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const parsed: AICoachAnalysis = JSON.parse(data.choices[0].message.content)
        return parsed
      }
    } catch (err) {
      console.warn('Groq API call encountered an issue, switching to intelligent heuristic coach:', err)
    }
  }

  // Fallback intelligent heuristic coach analysis based on true statistics
  return generateHeuristicAnalysis(metrics, songTitle, songArtist, weakKeysList, grade)
}

function generateHeuristicAnalysis(
  metrics: TypingMetrics,
  songTitle: string,
  songArtist: string,
  weakKeys: string[],
  grade: AICoachAnalysis['overallGrade']
): AICoachAnalysis {
  const isHighAccuracy = metrics.accuracy >= 95
  const isSpeedy = metrics.netWpm >= 60

  const summary = isHighAccuracy
    ? `Impressive precision on "${songTitle}"! You sustained ${metrics.accuracy}% accuracy while maintaining a net cadence of ${metrics.netWpm} WPM.`
    : `Good effort on "${songTitle}". Your rhythm showed bursts of speed (${metrics.grossWpm} Gross WPM), but unforced errors lowered your net output to ${metrics.netWpm} WPM.`

  const strengths = []
  if (metrics.accuracy >= 92) strengths.push('High keystroke accuracy and clean finger placement')
  if (metrics.grossWpm > 50) strengths.push('Fluid burst typing during fast lyrical bridges')
  if (metrics.completionRate >= 90) strengths.push('Strong stamina throughout the track')
  if (strengths.length === 0) strengths.push('Steadily developing musical rhythm recognition')

  const recommendedDrills = []

  if (weakKeys.length > 0) {
    const keyTargets = weakKeys.slice(0, 3).join(', ')
    recommendedDrills.push({
      title: `Finger Targeting Drill (${keyTargets.toUpperCase()})`,
      description: `Targeting your most frequent misfires: keys [${keyTargets}].`,
      sampleText: `${weakKeys[0] || 't'}est ${weakKeys[1] || 'r'}hythm ${weakKeys[2] || 'e'}xcellence ${weakKeys[0] || 't'}actical`,
    })
  }

  recommendedDrills.push({
    title: isSpeedy ? 'Syncopated Tempo Sprint' : 'Cadence Metronome Practice',
    description: isSpeedy
      ? 'Push your limits on high-BPM tracks like Blinding Lights or Believer.'
      : 'Focus on smooth keystrokes without rushing the lyric beats.',
    sampleText: 'music rhythm harmony tempo melody symphony cadence pulse',
  })

  return {
    summary,
    overallGrade: grade,
    weakKeys: weakKeys.length > 0 ? weakKeys : ['Space', 'e', 't'],
    strengths,
    rhythmConsistency: isHighAccuracy
      ? 'Evenly distributed keystroke intervals aligned nicely with the vocal melody.'
      : 'Slight hesitation observed during word transitions and punctuation marks.',
    recommendedDrills,
    actionableTips: [
      'Keep your eyes on the upcoming line rather than the character currently under your cursor.',
      'Maintain continuous finger hovering over the home row to minimize travel distance.',
      'In Rhythm mode, let the beat guide your keystroke tempo.',
    ],
  }
}
