import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DMRequest {
  handle: string;
  goal: string;
}

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  description?: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
  };
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
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { handle, goal }: DMRequest = await req.json()

    if (!handle || !goal) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: handle and goal' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Clean handle (remove @ if present)
    const cleanHandle = handle.replace('@', '')

    // Fetch Twitter user data
    const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN')
    if (!twitterBearerToken) {
      return new Response(
        JSON.stringify({ error: 'Twitter API not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user info
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${cleanHandle}?user.fields=description,public_metrics`,
      {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!userResponse.ok) {
      const errorData = await userResponse.json()
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch Twitter user data',
          details: errorData 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const userData = await userResponse.json()
    const twitterUser: TwitterUser = userData.data

    // Get recent tweets (excluding replies and retweets)
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${twitterUser.id}/tweets?max_results=10&exclude=replies,retweets&tweet.fields=created_at,public_metrics`,
      {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    let recentTweets: Tweet[] = []
    if (tweetsResponse.ok) {
      const tweetsData = await tweetsResponse.json()
      recentTweets = tweetsData.data || []
    }

    // Prepare the prompt for OpenRouter
    const tweetsList = recentTweets
      .slice(0, 5) // Limit to 5 most recent tweets
      .map(tweet => `- ${tweet.text}`)
      .join('\n')

    const prompt = `You are a highly skilled cold DM writer helping founders improve their outreach game.

Objective:
"${goal}"

Recipient's X bio:
${twitterUser.description || 'No bio available'}

Their recent tweets:
${tweetsList || 'No recent tweets available'}

Based on the above, write 4 personalized cold DMs with different tones:
1. Professional
2. Casual  
3. Bold
4. Witty

Each message must:
- Reference their personality, work, or tweets
- Be short enough for X DMs (under 280 characters)
- Sound human and personalized
- Avoid sounding like a mass message
- Include a clear call-to-action related to the objective

Format your response as a JSON object with this structure:
{
  "professional": "Your professional DM here",
  "casual": "Your casual DM here", 
  "bold": "Your bold DM here",
  "witty": "Your witty DM here"
}`

    // Call OpenRouter API
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openRouterKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout:free',
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
          error: 'Failed to generate DMs',
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

    // Parse the AI response to extract the JSON
    let dms
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        dms = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      // Fallback: create a structured response from the raw text
      dms = {
        professional: generatedContent.substring(0, 280),
        casual: generatedContent.substring(0, 280),
        bold: generatedContent.substring(0, 280),
        witty: generatedContent.substring(0, 280)
      }
    }

    // Save the generation to database for tracking
    const { error: dbError } = await supabaseClient
      .from('dm_generations')
      .insert({
        user_id: user.id,
        target_handle: cleanHandle,
        goal: goal,
        generated_dms: dms,
        target_bio: twitterUser.description,
        target_tweets: recentTweets.slice(0, 5),
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Failed to save generation:', dbError)
      // Don't fail the request if we can't save to DB
    }

    // Return the generated DMs
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          target_user: {
            name: twitterUser.name,
            username: twitterUser.username,
            bio: twitterUser.description,
            followers: twitterUser.public_metrics.followers_count
          },
          dms: dms,
          goal: goal
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in dm-generator function:', error)
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