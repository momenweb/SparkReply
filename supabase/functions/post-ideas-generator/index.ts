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
    const { writingStyleHandle } = await req.json()

    if (!writingStyleHandle) {
      return new Response(
        JSON.stringify({ error: 'Writing style handle is required' }),
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

    if (!xApiKey) {
      return new Response(
        JSON.stringify({ error: 'X API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let creatorInfo = null
    let recentPosts = ''

    // Fetch user info and recent posts
    try {
      const cleanHandle = writingStyleHandle.replace('@', '')
      
      // Get user info
      const userResponse = await fetch(`https://api.twitter.com/2/users/by/username/${cleanHandle}?user.fields=description,public_metrics`, {
        headers: {
          'Authorization': `Bearer ${xApiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!userResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user information from X API' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const userData = await userResponse.json()
      if (!userData.data) {
        return new Response(
          JSON.stringify({ error: 'User not found on X' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      creatorInfo = {
        name: userData.data.name,
        username: userData.data.username,
        description: userData.data.description,
        followers_count: userData.data.public_metrics?.followers_count || 0
      }

      // Get recent tweets
      const tweetsResponse = await fetch(`https://api.twitter.com/2/users/${userData.data.id}/tweets?max_results=20&tweet.fields=text,created_at,public_metrics&exclude=retweets,replies`, {
        headers: {
          'Authorization': `Bearer ${xApiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (tweetsResponse.ok) {
        const tweetsData = await tweetsResponse.json()
        if (tweetsData.data && tweetsData.data.length > 0) {
          recentPosts = tweetsData.data.map((tweet: any) => tweet.text).join('\n\n')
        }
      }

      if (!recentPosts) {
        return new Response(
          JSON.stringify({ error: 'No recent posts found for this user' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

    } catch (error) {
      console.error('Error fetching user data:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data from X API' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build the prompt for idea generation
    const prompt = `You are an expert content strategist. Analyze the following recent posts from @${creatorInfo.username} and generate 5 post ideas that match their themes, topics, and style.

Creator Info:
- Name: ${creatorInfo.name}
- Username: @${creatorInfo.username}
- Bio: ${creatorInfo.description || 'No bio available'}
- Followers: ${creatorInfo.followers_count.toLocaleString()}

Recent Posts:
${recentPosts}

Based on these posts, generate 5 post ideas that:
1. Match their writing style and tone
2. Cover similar themes and topics
3. Would appeal to their audience
4. Are specific and actionable
5. Could potentially go viral

IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any other text, explanations, or formatting. The response must start with { and end with }.

Format:
{
  "ideas": [
    "Post idea 1...",
    "Post idea 2...",
    "Post idea 3...",
    "Post idea 4...",
    "Post idea 5..."
  ]
}`

    // Call OpenRouter API with Llama 4 Scout
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparkreply.com',
        'X-Title': 'SparkReply Post Ideas Generator'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json()
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate post ideas',
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
    let ideas = []
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
      ideas = parsed.ideas || []
      
      // Ensure all ideas are strings
      ideas = ideas.map(idea => typeof idea === 'string' ? idea : (idea?.text || String(idea)))
    } catch (error) {
      console.error('JSON parsing failed, trying fallback extraction:', error)
      
      // Advanced fallback: try to extract ideas from malformed JSON
      try {
        // Look for quoted strings that could be post ideas
        const quotedStrings = generatedContent.match(/"([^"]{20,500})"/g)
        if (quotedStrings && quotedStrings.length > 0) {
          ideas = quotedStrings
            .map(str => str.slice(1, -1)) // Remove quotes
            .filter(str => str.length > 10 && str.length <= 500) // Filter reasonable lengths
            .slice(0, 5) // Take first 5
        }
      } catch (fallbackError) {
        console.error('Fallback extraction also failed:', fallbackError)
        
        // Last resort: split by lines and take reasonable ones
        const lines = generatedContent.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 10 && line.length <= 500 && !line.includes('{') && !line.includes('}'))
          .slice(0, 5)
        
        if (lines.length > 0) {
          ideas = lines
        }
      }
    }

    if (ideas.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse generated ideas' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ideas,
          creatorInfo
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in post-ideas-generator function:', error)
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