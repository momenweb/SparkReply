import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ThreadRewriteRequest {
  threadContent: string;
  threadUrl?: string;
  tone?: string;
  rewriteType: string;
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

    const { threadContent, threadUrl, tone, rewriteType, handleToMimic } = requestBody;
    
    if ((!threadContent || typeof threadContent !== 'string' || threadContent.trim().length === 0) && 
        (!threadUrl || typeof threadUrl !== 'string' || threadUrl.trim().length === 0)) {
      return new Response(
        JSON.stringify({ 
          error: 'Either threadContent or threadUrl is required',
          received: { threadContent, threadUrl }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!rewriteType || typeof rewriteType !== 'string') {
      return new Response(
        JSON.stringify({ 
          error: 'rewriteType is required',
          received: { rewriteType }
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

    let originalThread: string[] = [];
    let userTweets: TwitterTweet[] = [];
    let userInfo: TwitterUser | null = null;

    // If thread URL is provided, fetch the thread via X API
    if (threadUrl && threadUrl.trim()) {
      const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN')
      if (twitterBearerToken) {
        try {
          // Extract tweet ID from URL
          const tweetIdMatch = threadUrl.match(/status\/(\d+)/);
          if (tweetIdMatch) {
            const tweetId = tweetIdMatch[1];
            
            // Fetch the main tweet
            const tweetResponse = await fetch(
              `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=created_at,public_metrics,conversation_id&expansions=author_id`,
              {
                headers: {
                  'Authorization': `Bearer ${twitterBearerToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (tweetResponse.ok) {
              const tweetData = await tweetResponse.json();
              const mainTweet = tweetData.data;
              
              if (mainTweet) {
                originalThread.push(mainTweet.text);
                
                // Try to fetch thread replies (conversation)
                const conversationResponse = await fetch(
                  `https://api.twitter.com/2/tweets/search/recent?query=conversation_id:${mainTweet.conversation_id}&tweet.fields=created_at,public_metrics&max_results=100`,
                  {
                    headers: {
                      'Authorization': `Bearer ${twitterBearerToken}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );

                if (conversationResponse.ok) {
                  const conversationData = await conversationResponse.json();
                  if (conversationData.data) {
                    // Sort by creation time and add to thread
                    const sortedTweets = conversationData.data
                      .filter((tweet: any) => tweet.id !== tweetId) // Exclude main tweet
                      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                    
                    originalThread.push(...sortedTweets.map((tweet: any) => tweet.text));
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error fetching thread from X API:', error);
          // Fall back to using threadContent if provided
        }
      }
    }

    // If no thread was fetched from URL, use provided content
    if (originalThread.length === 0 && threadContent) {
      // Split thread content by common separators
      originalThread = threadContent
        .split(/\n\n+|\d+\/\d+|\d+\.|Tweet \d+:/)
        .map(tweet => tweet.trim())
        .filter(tweet => tweet.length > 0);
    }

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
    let prompt = `You are an expert X (Twitter) thread rewriter. Your job is to take an existing thread and rewrite it according to specific instructions while maintaining the core message and value.

ORIGINAL THREAD:
${originalThread.map((tweet, i) => `${i + 1}. ${tweet}`).join('\n')}

REWRITE TYPE: ${rewriteType}
${tone ? `TONE/STYLE: ${tone}` : ''}

${userInfo && userTweets.length > 0 ? `
STYLE TO MIMIC:
User: ${userInfo.name} (@${userInfo.username})
Bio: ${userInfo.description || 'No bio available'}
Followers: ${userInfo.public_metrics.followers_count}

Recent tweets for style reference:
${userTweets.slice(0, 5).map((tweet, i) => `${i + 1}. "${tweet.text}"`).join('\n')}

Please rewrite the thread to match this user's writing style, tone, and approach.
` : ''}

REWRITE INSTRUCTIONS BASED ON TYPE:

${rewriteType === 'viral' ? `
MAKE IT GO VIRAL:
- Start with a contrarian hook that challenges common thinking
- Use specific numbers and outcomes
- Include curiosity gaps and cliffhangers
- Add social proof and examples
- End with strong engagement CTAs
- Use viral formatting (→ bullets, ✅ checkmarks)
- Make each tweet shareable and quotable
` : ''}

${rewriteType === 'simplify' ? `
SIMPLIFY IT:
- Break down complex ideas into simple concepts
- Use shorter sentences and common words
- Remove jargon and technical terms
- Make it accessible to a broader audience
- Use analogies and simple examples
- Focus on the core message
- Eliminate unnecessary details
` : ''}

${rewriteType === 'storytelling' ? `
ADD STORYTELLING:
- Transform facts into narrative
- Add personal anecdotes or case studies
- Use story structure (setup, conflict, resolution)
- Include emotional elements
- Make it relatable with characters and situations
- Use "show don't tell" approach
- Create a journey for the reader
` : ''}

${rewriteType === 'punchy' ? `
MAKE IT MORE PUNCHY:
- Use short, impactful sentences
- Add power words and strong verbs
- Create urgency and excitement
- Use bold statements and claims
- Include action-oriented language
- Make every word count
- Remove filler and weak phrases
` : ''}

${rewriteType === 'style-mimic' && userInfo ? `
REWRITE IN ${userInfo.username}'S STYLE:
- Match their tone, voice, and personality
- Use similar sentence structures and phrases
- Adopt their level of formality/casualness
- Include their typical topics and interests
- Mirror their engagement style
- Use their preferred formatting and emojis
` : ''}

REQUIREMENTS:
- Maintain the core message and value of the original thread
- Keep each tweet under 280 characters
- Preserve the thread structure (same number of tweets or optimize)
- Make it unique and creative (avoid copying the original)
- Ensure high engagement potential
- Use proper formatting and line breaks

OUTPUT FORMAT: Return ONLY a valid JSON object:

{
  "original": [
    "${originalThread[0] || 'Original tweet 1'}",
    "${originalThread[1] || 'Original tweet 2'}",
    "..."
  ],
  "rewritten": [
    "Rewritten tweet 1 with new style/approach",
    "Rewritten tweet 2 with new style/approach",
    "..."
  ]
}

Rewrite the thread now with creativity and uniqueness:`

    // Call OpenRouter API with Llama 4 Scout
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparkreply.com',
        'X-Title': 'SparkReply Thread Rewriter'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9, // Higher temperature for more creativity
        max_tokens: 2500,
      }),
    })

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json()
      return new Response(
        JSON.stringify({ 
          error: 'Failed to rewrite thread',
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
    let result
    try {
      // Clean the response content
      let cleanContent = generatedContent.trim()
      
      // Remove any markdown code blocks
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      // Try to extract JSON from the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonStr = jsonMatch[0]
        const parsedResult = JSON.parse(jsonStr)
        
        // Validate that we have both original and rewritten arrays
        if (!parsedResult.original || !Array.isArray(parsedResult.original) ||
            !parsedResult.rewritten || !Array.isArray(parsedResult.rewritten)) {
          throw new Error('Invalid thread format')
        }
        
        // Ensure each tweet is under 280 characters
        result = {
          original: parsedResult.original.map((tweet: string) => {
            if (tweet.length > 280) {
              return tweet.substring(0, 277) + '...'
            }
            return tweet
          }),
          rewritten: parsedResult.rewritten.map((tweet: string) => {
            if (tweet.length > 280) {
              return tweet.substring(0, 277) + '...'
            }
            return tweet
          })
        }
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError, 'Content:', generatedContent)
      
      // Enhanced fallback: create a basic rewrite
      result = {
        original: originalThread,
        rewritten: originalThread.map((tweet, index) => {
          if (index === 0) {
            return `🧵 ${tweet.replace(/^🧵\s*/, '')}`
          }
          return `${index + 1}/ ${tweet}`
        })
      }
    }

    // Save the rewrite to database for tracking
    const { error: dbError } = await supabaseClient
      .from('thread_generations')
      .insert({
        user_id: user.id,
        topic: `Thread Rewrite: ${rewriteType}`,
        tone: tone?.trim() || null,
        target_audience: null,
        handle_to_mimic: handleToMimic?.trim() || null,
        generated_thread: result.rewritten,
        mimic_user_info: userInfo || null,
        mimic_tweets_sample: userTweets.slice(0, 5) || null,
        metadata: {
          rewriteType,
          originalThread: result.original,
          threadUrl: threadUrl?.trim() || null
        },
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Failed to save thread rewrite:', dbError)
      // Don't fail the request if we can't save to DB
    }

    // Return the rewritten thread
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          original: result.original,
          rewritten: result.rewritten,
          rewriteType,
          tone: tone?.trim() || null,
          handleToMimic: handleToMimic?.trim() || null,
          mimicUserInfo: userInfo || null,
          threadUrl: threadUrl?.trim() || null
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in thread-rewriter function:', error)
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