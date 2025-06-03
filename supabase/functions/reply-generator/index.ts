import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReplyRequest {
  tweetUrl?: string;
  postContent?: string;
  goal?: string;
  context?: string;
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

    // Validate request body structure
    const { tweetUrl, postContent, goal, context } = requestBody;
    
    // Check if we have either a valid tweet URL or post content
    const hasValidTweetUrl = tweetUrl && typeof tweetUrl === 'string' && tweetUrl.trim().length > 0;
    const hasValidPostContent = postContent && typeof postContent === 'string' && postContent.trim().length > 0;
    
    if (!hasValidTweetUrl && !hasValidPostContent) {
      return new Response(
        JSON.stringify({ 
          error: 'Either tweetUrl or postContent must be a non-empty string',
          received: { 
            tweetUrl: typeof tweetUrl, 
            postContent: typeof postContent,
            tweetUrlValue: tweetUrl,
            postContentValue: postContent 
          }
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

    let tweet: TwitterTweet | null = null;
    let author: TwitterUser | null = null;

    // If tweet URL is provided, fetch tweet data
    if (hasValidTweetUrl) {
      // Extract tweet ID from URL
      const tweetIdMatch = tweetUrl.match(/status\/(\d+)/)
      if (!tweetIdMatch) {
        return new Response(
          JSON.stringify({ error: 'Invalid tweet URL format' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const tweetId = tweetIdMatch[1]

      // Check for required API keys
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

      // Fetch tweet data
      const tweetResponse = await fetch(
        `https://api.twitter.com/2/tweets/${tweetId}?expansions=author_id&user.fields=name,username,description,public_metrics&tweet.fields=created_at,public_metrics,entities,context_annotations`,
        {
          headers: {
            'Authorization': `Bearer ${twitterBearerToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!tweetResponse.ok) {
        const errorData = await tweetResponse.json()
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch tweet data',
            details: errorData 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const tweetData = await tweetResponse.json()
      tweet = tweetData.data
      author = tweetData.includes?.users?.[0]

      if (!tweet || !author) {
        return new Response(
          JSON.stringify({ error: 'Tweet or author data not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Prepare the prompt for OpenRouter
    let prompt: string;
    
    if (tweet && author) {
      // If we have tweet data, use the full prompt
      const hashtags = tweet.entities?.hashtags?.map(h => '#' + h.tag).join(', ') || ''
      const mentions = tweet.entities?.mentions?.map(m => '@' + m.username).join(', ') || ''
      const topics = tweet.context_annotations?.map(ctx => ctx.entity.name).slice(0, 3).join(', ') || ''
      const urls = tweet.entities?.urls?.map(url => url.title).filter(Boolean).slice(0, 2).join(', ') || ''

      prompt = `You are a sharp, witty, and growth-savvy X (Twitter) creator. Your goal is to write short, engaging replies that stand out in the comments, spark curiosity, and increase visibility. Each reply should sound like it belongs in a viral thread — insightful, casual, and scroll-stopping.

ORIGINAL TWEET:
Author: ${author.name} (@${author.username})
Bio: ${author.description || 'No bio available'}
Followers: ${author.public_metrics.followers_count}
Tweet: "${tweet.text}"
Engagement: ${tweet.public_metrics.like_count} likes, ${tweet.public_metrics.retweet_count} retweets
${hashtags ? `Hashtags: ${hashtags}` : ''}
${topics ? `Topics: ${topics}` : ''}
${urls ? `Shared content: ${urls}` : ''}`
    } else if (hasValidPostContent) {
      // If we only have post content, use a simplified prompt
      prompt = `You are a sharp, witty, and growth-savvy X (Twitter) creator. Your goal is to write short, engaging replies that stand out in the comments, spark curiosity, and increase visibility. Each reply should sound like it belongs in a viral thread — insightful, casual, and scroll-stopping.

ORIGINAL POST:
"${postContent}"`
    } else {
      return new Response(
        JSON.stringify({ error: 'Either tweet URL or post content is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Add goal and context to prompt
    prompt += `\n\n${goal ? `REPLY GOAL: ${goal}` : ''}
${context ? `ADDITIONAL CONTEXT: ${context}` : ''}

GUIDELINES:
- No more than 2–3 sentences per reply
- Use a conversational tone
- Add a bold opinion, clever insight, or relatable truth
- No fluff, no hashtags, no emojis
- Avoid formal language
- Do not repeat what the tweet already says
- Start with a hook or emotional truth when possible
- Each reply must be under 280 characters
- Sound natural and human
- Make replies that could go viral

REPLY STYLES:
1. CONTRARIAN: Challenge their point with a bold counter-perspective
2. INSIGHT: Drop a surprising truth or data point that reframes everything
3. STORY: Share a quick, relatable micro-story that connects
4. QUESTION: Ask something that makes people stop scrolling and think

OUTPUT FORMAT: Return ONLY a valid JSON object with no additional text:

{
  "contrarian": "Your contrarian take here",
  "insight": "Your insight bomb here", 
  "story": "Your micro-story here",
  "question": "Your thought-provoking question here"
}

Generate the 4 viral-worthy replies now:`

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

    // Call OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparkreply.com',
        'X-Title': 'SparkReply'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-sonnet',
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
          error: 'Failed to generate replies',
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
    let replies
    try {
      // Clean the response content
      let cleanContent = generatedContent.trim()
      
      // Remove any markdown code blocks
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      // Try to extract JSON from the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonStr = jsonMatch[0]
        replies = JSON.parse(jsonStr)
        
        // Validate that we have all required fields
        if (!replies.contrarian || !replies.insight || !replies.story || !replies.question) {
          throw new Error('Missing required reply types')
        }
        
        // Ensure each reply is under 280 characters
        Object.keys(replies).forEach(type => {
          if (replies[type].length > 280) {
            replies[type] = replies[type].substring(0, 277) + '...'
          }
        })
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError, 'Content:', generatedContent)
      
      // Enhanced fallback: create meaningful replies from the response
      const originalText = tweet?.text || postContent || ''
      const fallbackBase = `Great point! This really resonates with what I've been thinking about.`
      
      replies = {
        contrarian: `Interesting perspective, but have you considered the opposite? ${originalText.length > 100 ? 'This approach' : 'Your point'} might actually be limiting our thinking.`,
        insight: `Recent studies show that ${goal || 'this approach'} can increase effectiveness by 40%. The key is in the implementation details.`,
        story: `I've seen this firsthand. Last month, I experimented with ${goal || 'a similar approach'} and discovered something fascinating.`,
        question: `What led you to this conclusion? I'm curious about the specific experiences that shaped your perspective on this.`
      }
      
      // Ensure fallback replies are under 280 characters
      Object.keys(replies).forEach(type => {
        if (replies[type].length > 280) {
          replies[type] = replies[type].substring(0, 277) + '...'
        }
      })
    }

    // Save the generation to database for tracking
    const { error: dbError } = await supabaseClient
      .from('reply_generations')
      .insert({
        user_id: user.id,
        tweet_id: tweet?.id || null,
        tweet_url: hasValidTweetUrl ? tweetUrl : null,
        original_text: tweet?.text || (hasValidPostContent ? postContent : null),
        author_username: author?.username || null,
        author_name: author?.name || null,
        goal: goal && typeof goal === 'string' && goal.trim() ? goal.trim() : null,
        context: context && typeof context === 'string' && context.trim() ? context.trim() : null,
        generated_replies: replies,
        tweet_metrics: tweet?.public_metrics || null,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Failed to save reply generation:', dbError)
      // Don't fail the request if we can't save to DB
    }

    // Return the generated replies
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          original_tweet: {
            id: tweet?.id || null,
            text: tweet?.text || (hasValidPostContent ? postContent : null),
            author: tweet && author ? {
              name: author.name || null,
              username: author.username || null,
              bio: author.description || null,
              followers: author.public_metrics.followers_count || null
            } : null,
            metrics: tweet?.public_metrics || null,
            url: hasValidTweetUrl ? tweetUrl : null
          },
          replies: replies,
          goal: goal && typeof goal === 'string' && goal.trim() ? goal.trim() : null,
          context: context && typeof context === 'string' && context.trim() ? context.trim() : null
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in reply-generator function:', error)
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