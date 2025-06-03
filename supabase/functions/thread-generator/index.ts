import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ThreadRequest {
  topic: string;
  tone?: string;
  targetAudience?: string;
  handleToMimic?: string;
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Received request body:', requestBody);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { topic, tone, targetAudience, handleToMimic } = requestBody;
    
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Topic is required and must be a non-empty string',
          received: { topic }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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

    let userTweets: TwitterTweet[] = [];
    let userInfo: TwitterUser | null = null;

    // If handle to mimic is provided, fetch their recent tweets
    if (handleToMimic && typeof handleToMimic === 'string' && handleToMimic.trim()) {
      const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN')
      if (twitterBearerToken) {
        try {
          // First, get user info by username
          const userResponse = await fetch(
            `https://api.twitter.com/2/users/by/username/${handleToMimic.replace('@', '')}?user.fields=name,username,description,public_metrics`,
            {
              headers: {
                'Authorization': `Bearer ${twitterBearerToken}`,
                'Content-Type': 'application/json',
              },
            }
          )

          if (userResponse.ok) {
            const userData = await userResponse.json()
            userInfo = userData.data

            if (userInfo) {
              // Get user's recent tweets
              const tweetsResponse = await fetch(
                `https://api.twitter.com/2/users/${userInfo.id}/tweets?max_results=10&tweet.fields=created_at,public_metrics&exclude=retweets,replies`,
                {
                  headers: {
                    'Authorization': `Bearer ${twitterBearerToken}`,
                    'Content-Type': 'application/json',
                  },
                }
              )

              if (tweetsResponse.ok) {
                const tweetsData = await tweetsResponse.json()
                userTweets = tweetsData.data || []
              }
            }
          }
        } catch (error) {
          console.error('Error fetching Twitter data:', error)
          // Continue without Twitter data
        }
      }
    }

    // Check for OpenRouter API key
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

    // Prepare the prompt for OpenRouter
    let prompt = `You are an expert X (Twitter) thread creator who specializes in viral, engaging content. Your goal is to create a compelling thread that captures attention, provides value, and encourages engagement.

THREAD TOPIC: "${topic}"
${tone ? `TONE/STYLE: ${tone}` : ''}
${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}

${userInfo && userTweets.length > 0 ? `
WRITING STYLE TO MIMIC:
User: ${userInfo.name} (@${userInfo.username})
Bio: ${userInfo.description || 'No bio available'}
Followers: ${userInfo.public_metrics.followers_count}

Recent tweets for style reference:
${userTweets.slice(0, 5).map((tweet, i) => `${i + 1}. "${tweet.text}"`).join('\n')}

Please mimic this user's writing style, tone, and approach while creating the thread.
` : ''}

THREAD REQUIREMENTS:
- Create a thread with 6-12 tweets total
- Start with a compelling hook tweet that makes people want to read more
- Include 5-10 body tweets that provide value, insights, or entertainment
- End with a strong call-to-action or conclusion
- Each tweet must be under 280 characters
- Use engaging formatting (line breaks, emojis sparingly, bullet points when appropriate)
- Make it shareable and likely to go viral
- Ensure each tweet flows naturally to the next
- Include actionable insights or valuable information

OUTPUT FORMAT: Return ONLY a valid JSON object with no additional text:

{
  "thread": [
    "Hook tweet that grabs attention...",
    "First body tweet with valuable insight...",
    "Second body tweet building on the topic...",
    "Continue with more valuable content...",
    "Final tweet with strong CTA or conclusion..."
  ]
}

Create the thread now:`

    // Call OpenRouter API with Llama 4 Scout
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparkreply.com',
        'X-Title': 'SparkReply Thread Generator'
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
        max_tokens: 2000,
      }),
    })

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json()
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate thread',
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
    let thread
    try {
      // Clean the response content
      let cleanContent = generatedContent.trim()
      
      // Remove any markdown code blocks
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      // Try to extract JSON from the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonStr = jsonMatch[0]
        const parsedThread = JSON.parse(jsonStr)
        
        // Validate that we have a thread array
        if (!parsedThread.thread || !Array.isArray(parsedThread.thread)) {
          throw new Error('Invalid thread format')
        }
        
        // Ensure each tweet is under 280 characters
        thread = parsedThread.thread.map((tweet: string) => {
          if (tweet.length > 280) {
            return tweet.substring(0, 277) + '...'
          }
          return tweet
        })
        
        // Ensure we have at least 3 tweets
        if (thread.length < 3) {
          throw new Error('Thread too short')
        }
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError, 'Content:', generatedContent)
      
      // Enhanced fallback: create a basic thread
      thread = [
        `🧵 Thread about ${topic}:\n\nLet me break this down for you...`,
        `1/ ${topic} is more important than most people realize.\n\nHere's why it matters:`,
        `2/ The key insight is that understanding ${topic} can transform how you approach your goals.`,
        `3/ Most people miss this because they focus on the wrong aspects.`,
        `4/ Instead, try this approach:\n\n• Focus on the fundamentals\n• Practice consistently\n• Measure your progress`,
        `5/ The results speak for themselves when you apply these principles correctly.`,
        `That's a wrap! 🎬\n\nIf you found this helpful:\n• Follow me for more insights\n• RT the first tweet\n• Share your thoughts below`
      ]
    }

    // Save the generation to database for tracking
    const { error: dbError } = await supabaseClient
      .from('thread_generations')
      .insert({
        user_id: user.id,
        topic: topic.trim(),
        tone: tone?.trim() || null,
        target_audience: targetAudience?.trim() || null,
        handle_to_mimic: handleToMimic?.trim() || null,
        generated_thread: thread,
        mimic_user_info: userInfo || null,
        mimic_tweets_sample: userTweets.slice(0, 5) || null,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Failed to save thread generation:', dbError)
      // Don't fail the request if we can't save to DB
    }

    // Return the generated thread
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          thread: thread,
          topic: topic.trim(),
          tone: tone?.trim() || null,
          targetAudience: targetAudience?.trim() || null,
          handleToMimic: handleToMimic?.trim() || null,
          mimicUserInfo: userInfo || null,
          threadLength: thread.length
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in thread-generator function:', error)
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