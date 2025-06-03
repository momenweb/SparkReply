import { supabase, SavedContent, UserSettings } from './supabase'

// OpenRouter API configuration
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

// Twitter API configuration
const TWITTER_BEARER_TOKEN = import.meta.env.VITE_TWITTER_BEARER_TOKEN

// OpenRouter API functions
export async function generateWithAI(prompt: string, model = 'anthropic/claude-3.5-sonnet') {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured')
    }

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SparkReply'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('OpenRouter API error:', error)
    // Return a fallback response for demo purposes
    return generateFallbackContent(prompt)
  }
}

// Fallback content generator for when APIs are not available
function generateFallbackContent(prompt: string): string {
  if (prompt.toLowerCase().includes('dm') || prompt.toLowerCase().includes('direct message')) {
    return "Hi! I came across your recent work and was genuinely impressed by your approach. I'd love to connect and learn more about your experience. Would you be open to a brief chat?"
  } else if (prompt.toLowerCase().includes('reply')) {
    return "Great point! This really resonates with my experience. Thanks for sharing this valuable insight! 💡"
  } else if (prompt.toLowerCase().includes('thread')) {
    return "🧵 Here's what I've learned about this topic (1/5)\n\n1/ The key insight is that consistency beats perfection every time.\n\n2/ Most people focus on the wrong metrics and miss the bigger picture.\n\n3/ The real secret is building genuine relationships, not just chasing numbers.\n\n4/ Start small, stay consistent, and compound your efforts over time.\n\n5/ That's a wrap! What's your biggest takeaway? Let me know in the comments 👇"
  }
  return "This is a sample AI-generated response. Please configure your API keys for full functionality."
}

// Twitter API functions
export async function fetchUserProfile(handle: string) {
  try {
    if (!TWITTER_BEARER_TOKEN) {
      console.warn('Twitter API not configured, using mock data')
      return {
        id: '123',
        username: handle.replace('@', ''),
        name: 'Sample User',
        description: 'Content creator and entrepreneur sharing insights about business and technology.',
        public_metrics: { followers_count: 1000 }
      }
    }

    // Remove @ if present
    const username = handle.replace('@', '')
    
    const response = await fetch(`https://api.twitter.com/2/users/by/username/${username}?user.fields=description,public_metrics`, {
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Twitter API error:', error)
    // Return mock data if API fails
    return {
      id: '123',
      username: handle.replace('@', ''),
      name: 'Sample User',
      description: 'Content creator and entrepreneur sharing insights about business and technology.',
      public_metrics: { followers_count: 1000 }
    }
  }
}

export async function fetchUserTweets(userId: string) {
  try {
    if (!TWITTER_BEARER_TOKEN) {
      return [
        { text: "Just launched a new project! Excited to share what I've been working on." },
        { text: "The key to success is consistency and never giving up on your dreams." },
        { text: "Building in public has been one of the best decisions for my business." }
      ]
    }

    const response = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=created_at,public_metrics`, {
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Twitter API error:', error)
    return [
      { text: "Just launched a new project! Excited to share what I've been working on." },
      { text: "The key to success is consistency and never giving up on your dreams." },
      { text: "Building in public has been one of the best decisions for my business." }
    ]
  }
}

// Content generation functions
export async function generateDM(targetHandle: string, goal: string, tone: string) {
  try {
    // Fetch user profile and recent tweets for personalization
    const profile = await fetchUserProfile(targetHandle)
    const tweets = await fetchUserTweets(profile.id)
    
    const prompt = `Generate a personalized cold DM for X (Twitter) with the following details:

Target: ${targetHandle}
Goal: ${goal}
Tone: ${tone}

User Profile:
- Name: ${profile.name}
- Bio: ${profile.description}
- Recent activity: ${tweets.slice(0, 3).map(t => t.text).join('; ')}

Requirements:
- Keep it under 280 characters
- Be genuine and personalized
- Reference something specific from their profile or recent tweets
- Clear call to action aligned with the goal
- Use ${tone} tone
- Don't be salesy or pushy

Generate only the DM text, no additional formatting or explanations.`

    return await generateWithAI(prompt)
  } catch (error) {
    console.error('Error generating DM:', error)
    throw new Error('Failed to generate DM')
  }
}

export async function generateReply(postContent: string, tone: string) {
  try {
    const prompt = `Generate a smart reply to this X (Twitter) post:

Post: "${postContent}"

Requirements:
- Use ${tone} tone
- Keep under 280 characters
- Add value to the conversation
- Be engaging and authentic
- Don't just agree - provide insight or ask a thoughtful question
- Use appropriate emojis sparingly

Generate only the reply text, no additional formatting or explanations.`

    return await generateWithAI(prompt)
  } catch (error) {
    console.error('Error generating reply:', error)
    throw new Error('Failed to generate reply')
  }
}

export async function generateThread(topic: string, length: string, style?: string) {
  try {
    const lengthMap = {
      'short': '5-7 tweets',
      'medium': '8-12 tweets', 
      'long': '13-20 tweets'
    }

    const prompt = `Create a viral X (Twitter) thread about: ${topic}

Requirements:
- Length: ${lengthMap[length as keyof typeof lengthMap]}
- Each tweet should be under 280 characters
- Start with a hook that grabs attention
- Use thread numbering (1/, 2/, etc.)
- Include actionable insights
- End with a strong CTA
- Use emojis strategically
${style ? `- Writing style inspiration: ${style}` : ''}

Format: Return as an array of individual tweets, each as a separate string.

Generate only the thread content, no additional formatting or explanations.`

    const response = await generateWithAI(prompt)
    
    // Parse the response into individual tweets
    const tweets = response.split('\n\n').filter(tweet => tweet.trim())
    return tweets.length > 0 ? tweets : [response] // Fallback to single tweet if parsing fails
  } catch (error) {
    console.error('Error generating thread:', error)
    throw new Error('Failed to generate thread')
  }
}

export async function rewriteThread(originalThread: string, newTone: string) {
  try {
    const prompt = `Rewrite this X (Twitter) thread with a ${newTone} tone while maintaining the core message:

Original Thread:
${originalThread}

Requirements:
- Maintain the same key points and structure
- Apply ${newTone} tone throughout
- Improve hooks and engagement
- Keep each tweet under 280 characters
- Enhance readability and flow
- Add better CTAs where appropriate
- Use emojis strategically

Format: Return as an array of individual tweets, each as a separate string.

Generate only the rewritten thread content, no additional formatting or explanations.`

    const response = await generateWithAI(prompt)
    
    // Parse the response into individual tweets
    const tweets = response.split('\n\n').filter(tweet => tweet.trim())
    return tweets.length > 0 ? tweets : [response] // Fallback to single tweet if parsing fails
  } catch (error) {
    console.error('Error rewriting thread:', error)
    throw new Error('Failed to rewrite thread')
  }
}

// Supabase content management functions
export async function saveContent(content: Omit<SavedContent, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('saved_content')
      .insert([content])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving content:', error)
    // For demo purposes, return a mock saved item
    return {
      id: Date.now().toString(),
      ...content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}

export async function getSavedContent(userId: string): Promise<SavedContent[]> {
  try {
    const { data, error } = await supabase
      .from('saved_content')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching saved content:', error)
    // Return empty array for demo
    return []
  }
}

export async function deleteContent(contentId: string) {
  try {
    const { error } = await supabase
      .from('saved_content')
      .delete()
      .eq('id', contentId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting content:', error)
    // Silently fail for demo
  }
}

// User settings functions
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (error) {
    console.error('Error fetching user settings:', error)
    // Return default settings
    return {
      id: Date.now().toString(),
      user_id: userId,
      default_tone: 'professional',
      writing_style_handles: [],
      auto_save: true,
      tweet_length_limit: 280,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert([{ user_id: userId, ...settings }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user settings:', error)
    // Return the settings as if they were saved
    return {
      id: Date.now().toString(),
      user_id: userId,
      ...settings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
} 