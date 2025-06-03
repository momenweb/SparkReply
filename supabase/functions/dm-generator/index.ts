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
    quote_count?: number;
    impression_count?: number;
  };
  entities?: {
    urls?: Array<{
      expanded_url: string;
      title?: string;
      description?: string;
    }>;
    mentions?: Array<{
      username: string;
    }>;
    hashtags?: Array<{
      tag: string;
    }>;
  };
  context_annotations?: Array<{
    domain: {
      id: string;
      name: string;
      description?: string;
    };
    entity: {
      id: string;
      name: string;
    };
  }>;
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
      `https://api.twitter.com/2/users/${twitterUser.id}/tweets?max_results=3&exclude=replies,retweets&tweet.fields=created_at,public_metrics,entities,context_annotations&expansions=attachments.media_keys&media.fields=url`,
      {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    let recentTweets: Tweet[] = []
    let tweetAnalysis = ''
    if (tweetsResponse.ok) {
      const tweetsData = await tweetsResponse.json()
      recentTweets = tweetsData.data || []
      
      // Analyze tweets for common themes and interests
      const hashtags = new Set<string>()
      const mentions = new Set<string>()
      const topics = new Set<string>()
      const urls = new Set<string>()
      
      recentTweets.forEach(tweet => {
        // Extract hashtags
        tweet.entities?.hashtags?.forEach(h => hashtags.add(h.tag))
        
        // Extract mentions
        tweet.entities?.mentions?.forEach(m => mentions.add(m.username))
        
        // Extract topics from context annotations
        tweet.context_annotations?.forEach(ctx => {
          topics.add(ctx.domain.name)
          topics.add(ctx.entity.name)
        })
        
        // Extract shared links titles/descriptions
        tweet.entities?.urls?.forEach(url => {
          if (url.title) urls.add(url.title)
        })
      })

      // Create tweet analysis summary
      const topTweet = recentTweets.reduce((prev, current) => {
        const prevEngagement = prev.public_metrics.like_count + prev.public_metrics.retweet_count
        const currentEngagement = current.public_metrics.like_count + current.public_metrics.retweet_count
        return prevEngagement > currentEngagement ? prev : current
      })

      tweetAnalysis = `
Latest Activity Analysis:
- Most recent tweet: "${recentTweets[0]?.text}"
- Most engaged tweet (${topTweet.public_metrics.like_count} likes, ${topTweet.public_metrics.retweet_count} retweets): "${topTweet.text}"
${hashtags.size > 0 ? `- Recent hashtags: ${Array.from(hashtags).map(h => '#' + h).join(', ')}` : ''}
${topics.size > 0 ? `- Recent topics: ${Array.from(topics).slice(0, 3).join(', ')}` : ''}
${urls.size > 0 ? `- Recently shared: ${Array.from(urls).slice(0, 2).join(', ')}` : ''}
`
    }

    // Prepare the prompt for OpenRouter
    const tweetsList = recentTweets
      .map(tweet => `- ${tweet.text} (${tweet.public_metrics.like_count} likes, ${new Date(tweet.created_at).toLocaleDateString()})`)
      .join('\n')

    const prompt = `You are an expert cold DM writer. Write 4 personalized direct messages for Twitter/X outreach.

TARGET ANALYSIS:
- Handle: @${cleanHandle}
- Name: ${twitterUser.name}
- Bio: ${twitterUser.description || 'No bio available'}
- Followers: ${twitterUser.public_metrics.followers_count}
${tweetAnalysis}

Latest 3 tweets:
${tweetsList}

OBJECTIVE: ${goal}

REQUIREMENTS:
- Each DM must be under 280 characters
- Reference their most recent activity or bio
- Sound natural and human
- Include a clear call-to-action
- Avoid generic language
- If possible, reference their latest tweet or most engaged content
- Keep the tone aligned with their recent posting style

OUTPUT FORMAT: Return ONLY a valid JSON object with no additional text:

{
  "professional": "Your professional DM here",
  "casual": "Your casual DM here",
  "bold": "Your bold DM here",
  "witty": "Your witty DM here"
}

Generate the 4 DMs now:`

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
      // Clean the response content
      let cleanContent = generatedContent.trim()
      
      // Remove any markdown code blocks
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      // Try to extract JSON from the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonStr = jsonMatch[0]
        dms = JSON.parse(jsonStr)
        
        // Validate that we have all required fields
        if (!dms.professional || !dms.casual || !dms.bold || !dms.witty) {
          throw new Error('Missing required DM tones')
        }
        
        // Ensure each DM is under 280 characters
        Object.keys(dms).forEach(tone => {
          if (dms[tone].length > 280) {
            dms[tone] = dms[tone].substring(0, 277) + '...'
          }
        })
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError, 'Content:', generatedContent)
      
      // Enhanced fallback: try to create meaningful DMs from the response
      const lines = generatedContent.split('\n').filter(line => line.trim().length > 0)
      const fallbackDM = lines.find(line => line.length > 20 && line.length < 280) || 
                        `Hi @${cleanHandle}! I noticed your work and would love to connect about ${goal.toLowerCase()}. Interested in a quick chat?`
      
      dms = {
        professional: `Hi @${cleanHandle}, I came across your profile and was impressed by your work. ${goal} - would you be open to a brief conversation?`,
        casual: `Hey @${cleanHandle}! Love what you're building. ${goal} - mind if I share something that might interest you?`,
        bold: `@${cleanHandle}, your work caught my attention. ${goal} - let's make it happen. Are you free for a quick call?`,
        witty: `@${cleanHandle}, great minds think alike! ${goal} - what do you say we put our heads together?`
      }
      
      // Ensure fallback DMs are under 280 characters
      Object.keys(dms).forEach(tone => {
        if (dms[tone].length > 280) {
          dms[tone] = dms[tone].substring(0, 277) + '...'
        }
      })
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