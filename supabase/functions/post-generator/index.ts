import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { topic, tone, writingStyleHandle, goal, writingStyleHandles } = await req.json()

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get API keys from environment
    const xApiKey = Deno.env.get('TWITTER_BEARER_TOKEN')
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')

    if (!openRouterKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let mimicUserInfo = null
    let styleContext = ''

    // Fetch user info and recent posts if writingStyleHandle is provided
    if (writingStyleHandle && xApiKey) {
      try {
        const cleanHandle = writingStyleHandle.replace('@', '')
        
        // Get user info
        const userResponse = await fetch(`https://api.twitter.com/2/users/by/username/${cleanHandle}?user.fields=description,public_metrics`, {
          headers: {
            'Authorization': `Bearer ${xApiKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.data) {
            mimicUserInfo = {
              id: userData.data.id,
              name: userData.data.name,
              username: userData.data.username,
              description: userData.data.description,
              followers_count: userData.data.public_metrics?.followers_count || 0
            }

            // Get recent tweets
            const tweetsResponse = await fetch(`https://api.twitter.com/2/users/${userData.data.id}/tweets?max_results=10&tweet.fields=text,created_at,public_metrics&exclude=retweets,replies`, {
              headers: {
                'Authorization': `Bearer ${xApiKey}`,
                'Content-Type': 'application/json'
              }
            })

            if (tweetsResponse.ok) {
              const tweetsData = await tweetsResponse.json()
              if (tweetsData.data && tweetsData.data.length > 0) {
                const recentTweets = tweetsData.data.slice(0, 5).map((tweet: any) => tweet.text).join('\n\n')
                styleContext = `\n\nStyle reference from @${cleanHandle}:\n${recentTweets}`
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        // Continue without style mimicking if API fails
      }
    }

    // Add writing style handles from settings if available
    let additionalStyleContext = ''
    if (writingStyleHandles && writingStyleHandles.length > 0 && xApiKey) {
      for (const handle of writingStyleHandles.slice(0, 2)) { // Limit to 2 handles to avoid token limits
        try {
          const cleanHandle = handle.replace('@', '')
          const userResponse = await fetch(`https://api.twitter.com/2/users/by/username/${cleanHandle}`, {
            headers: {
              'Authorization': `Bearer ${xApiKey}`,
              'Content-Type': 'application/json'
            }
          })

          if (userResponse.ok) {
            const userData = await userResponse.json()
            if (userData.data) {
              const tweetsResponse = await fetch(`https://api.twitter.com/2/users/${userData.data.id}/tweets?max_results=5&tweet.fields=text&exclude=retweets,replies`, {
                headers: {
                  'Authorization': `Bearer ${xApiKey}`,
                  'Content-Type': 'application/json'
                }
              })

              if (tweetsResponse.ok) {
                const tweetsData = await tweetsResponse.json()
                if (tweetsData.data && tweetsData.data.length > 0) {
                  const tweets = tweetsData.data.map((tweet: any) => tweet.text).join('\n')
                  additionalStyleContext += `\n\nStyle inspiration from @${cleanHandle}:\n${tweets}`
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching data for ${handle}:`, error)
        }
      }
    }

    // Build the prompt
    let prompt = `You're an expert in writing viral, engaging, and personality-driven posts for X (formerly Twitter). Your task is to generate 3-5 short, scroll-stopping X posts about "${topic}".

Each post should:
- Be under 280 characters
- Use a unique format (hook, story, question, bold claim, contrarian take, personal insight, etc.)
- Sound human and conversational, not robotic or corporate
- Include strategic emojis (1-3 max) that enhance the message
- Have a clear hook in the first line to stop scrolling
- End with engagement drivers (questions, calls to action, or thought-provoking statements)`

    if (tone) {
      const toneDescriptions = {
        smart: 'intelligent, insightful, and thought-provoking with data-driven insights',
        funny: 'humorous, witty, and entertaining with clever observations',
        punchy: 'bold, direct, and impactful with strong statements',
        viral: 'designed to spread with controversial takes and shareable insights',
        contrarian: 'challenges common beliefs with provocative but logical arguments',
        emotional: 'touches the heart with relatable stories and personal experiences'
      }
      prompt += `\n\nTone: Use a ${toneDescriptions[tone as keyof typeof toneDescriptions] || tone} tone throughout all posts.`
    }

    if (goal) {
      const goalStrategies = {
        replies: 'End with questions, ask for opinions, or share controversial takes that spark discussion',
        clicks: 'Use curiosity gaps, teasers, and "thread below" or "link in bio" hooks',
        lesson: 'Share actionable insights, frameworks, or step-by-step advice',
        debate: 'Present bold claims, contrarian views, or challenge popular opinions',
        viral: 'Use pattern interrupts, surprising statistics, or universally relatable experiences'
      }
      prompt += `\n\nPost Goal: ${goalStrategies[goal as keyof typeof goalStrategies] || goal}`
    }

    // Add style context if available
    if (styleContext) {
      prompt += `\n\nCreator Style Reference:${styleContext}`
      prompt += `\n\nMimic this creator's:
- Casual/formal language level
- Use of emojis and punctuation
- Sentence structure and rhythm
- Personality quirks and catchphrases
- Way of addressing the audience`
    }

    if (additionalStyleContext) {
      prompt += `\n\nAdditional Style Inspiration:${additionalStyleContext}`
    }

    prompt += `

POST FORMATS TO USE (pick different ones for variety):

1. HOOK + INSIGHT: "Most people think X. But here's what actually works..."
2. PERSONAL STORY: "3 years ago I was [struggle]. Today I [success]. Here's what changed:"
3. CONTRARIAN TAKE: "Unpopular opinion: [controversial statement]. Here's why..."
4. QUESTION HOOK: "What if I told you [surprising fact]? Would you believe me?"
5. LIST FORMAT: "5 things I wish I knew about [topic]: 1) ... 2) ... 3) ..."
6. BEFORE/AFTER: "Then: [old way]. Now: [new way]. The difference? [key insight]"
7. MISTAKE ADMISSION: "I made a $10k mistake so you don't have to. Here's what happened..."
8. BOLD CLAIM: "[Shocking statement]. And I can prove it in 30 seconds."

ENGAGEMENT TRIGGERS:
- "Agree or disagree?"
- "What's your experience?"
- "Am I missing something?"
- "Thoughts?"
- "Who else has seen this?"
- "RT if you agree"
- "Save this for later"

IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any other text, explanations, or formatting. The response must start with { and end with }.

Format:
{
  "variations": [
    "Post variation 1...",
    "Post variation 2...",
    "Post variation 3...",
    "Post variation 4...",
    "Post variation 5..."
  ]
}`

    // Call OpenRouter API with Llama 4 Scout
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparkreply.com',
        'X-Title': 'SparkReply Post Generator'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    })

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json()
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate posts',
          details: errorData 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const aiResponse = await openRouterResponse.json()
    const generatedContent = aiResponse.choices[0]?.message?.content

    if (!generatedContent) {
      return new Response(
        JSON.stringify({ error: 'No content generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the JSON response
    let variations = []
    try {
      // Clean the response to ensure it's valid JSON
      let cleanedContent = generatedContent.trim()
      
      // Remove any text before the first {
      const jsonStart = cleanedContent.indexOf('{')
      if (jsonStart > 0) {
        cleanedContent = cleanedContent.substring(jsonStart)
      }
      
      // Remove any text after the last }
      const jsonEnd = cleanedContent.lastIndexOf('}')
      if (jsonEnd > 0) {
        cleanedContent = cleanedContent.substring(0, jsonEnd + 1)
      }
      
      const parsed = JSON.parse(cleanedContent)
      variations = parsed.variations || []
      
      // Ensure all variations are strings
      variations = variations.map(variation => typeof variation === 'string' ? variation : (variation?.text || String(variation)))
    } catch (error) {
      console.error('JSON parsing failed, trying fallback extraction:', error)
      
      // Advanced fallback: try to extract variations from malformed JSON
      try {
        // Look for quoted strings that could be post variations
        const quotedStrings = generatedContent.match(/"([^"]{20,280})"/g)
        if (quotedStrings && quotedStrings.length > 0) {
          variations = quotedStrings
            .map(str => str.slice(1, -1)) // Remove quotes
            .filter(str => str.length > 10 && str.length <= 280) // Filter reasonable lengths
            .slice(0, 5) // Take first 5
        }
      } catch (fallbackError) {
        console.error('Fallback extraction also failed:', fallbackError)
        
        // Last resort: split by lines and take reasonable ones
        const lines = generatedContent.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 10 && line.length <= 280 && !line.includes('{') && !line.includes('}'))
          .slice(0, 5)
        
        if (lines.length > 0) {
          variations = lines
        }
      }
    }

    if (variations.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse generated content' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Save to database
    try {
      const { error: dbError } = await supabaseClient
        .from('post_generations')
        .insert([
          {
            user_id: user.id,
            topic,
            tone,
            goal,
            writing_style_handle: writingStyleHandle,
            variations,
            mimic_user_info: mimicUserInfo,
            created_at: new Date().toISOString()
          }
        ])

      if (dbError) {
        console.error('Database error:', dbError)
        // Continue even if database save fails
      }
    } catch (error) {
      console.error('Error saving to database:', error)
      // Continue even if database save fails
    }

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          variations,
          topic,
          tone,
          goal,
          writingStyleHandle,
          mimicUserInfo
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in post-generator function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 