import { supabase } from './supabase';

export interface ThreadGenerationRequest {
  topic: string;
  tone?: string;
  targetAudience?: string;
  handleToMimic?: string;
}

export interface ThreadGenerationResponse {
  success: boolean;
  data: {
    thread: string[];
    topic: string;
    tone?: string;
    targetAudience?: string;
    handleToMimic?: string;
    mimicUserInfo?: {
      name: string;
      username: string;
      description?: string;
      followers_count: number;
    };
    threadLength: number;
  };
}

export interface ThreadGenerationError {
  error: string;
  details?: any;
}

export interface TrendingTopic {
  name: string;
  tweet_volume?: number;
  url?: string;
}

/**
 * Generate a viral thread using AI
 */
export async function generateThread(
  request: ThreadGenerationRequest
): Promise<ThreadGenerationResponse> {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Authentication required');
    }

    // Construct request body with only defined values
    const requestBody: any = {};
    
    if (request.topic?.trim()) {
      requestBody.topic = request.topic.trim();
    }
    
    if (request.tone?.trim()) {
      requestBody.tone = request.tone.trim();
    }
    
    if (request.targetAudience?.trim()) {
      requestBody.targetAudience = request.targetAudience.trim();
    }
    
    if (request.handleToMimic?.trim()) {
      requestBody.handleToMimic = request.handleToMimic.trim();
    }

    console.log('Sending thread generation request:', requestBody);

    // Call the Supabase Edge Function
    const response = await supabase.functions.invoke('thread-generator', {
      body: requestBody,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    console.log('Raw thread generation response:', response);
    
    const { data, error } = response;

    if (error) {
      console.error('Thread generation error:', error);
      throw new Error(error.message || 'Failed to generate thread');
    }

    if (!data || !data.success) {
      console.error('Thread generation response:', data);
      throw new Error((data && data.error) || 'Failed to generate thread');
    }

    return data;
  } catch (error) {
    console.error('Error generating thread:', error);
    throw error;
  }
}

/**
 * Get thread generation history for the current user
 */
export async function getThreadHistory(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('thread_generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error fetching thread history:', error);
    throw error;
  }
}

/**
 * Delete a thread generation from history
 */
export async function deleteThreadGeneration(id: string) {
  try {
    const { error } = await supabase
      .from('thread_generations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error deleting thread generation:', error);
    throw error;
  }
}

/**
 * Get trending topics from Twitter API (mock implementation for now)
 */
export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  // Mock trending topics for now - in a real implementation, 
  // this would call the Twitter API trends endpoint
  return [
    { name: "AI Revolution", tweet_volume: 125000 },
    { name: "Remote Work", tweet_volume: 89000 },
    { name: "Productivity Hacks", tweet_volume: 67000 },
    { name: "Startup Life", tweet_volume: 54000 },
    { name: "Tech Innovation", tweet_volume: 43000 },
    { name: "Digital Marketing", tweet_volume: 38000 },
    { name: "Personal Branding", tweet_volume: 32000 },
    { name: "Entrepreneurship", tweet_volume: 28000 },
    { name: "Web3", tweet_volume: 25000 },
    { name: "Climate Tech", tweet_volume: 21000 }
  ];
}

/**
 * Get viral posts for inspiration (mock implementation)
 */
export async function getViralPosts(): Promise<string[]> {
  // Mock viral post topics - in a real implementation,
  // this would fetch recent viral posts from Twitter API
  return [
    "The 5 habits that changed my life in 2024",
    "Why most people fail at building habits (and how to fix it)",
    "I analyzed 1000 successful tweets. Here's what I learned:",
    "The psychology behind viral content (a thread)",
    "How to build a personal brand in 30 days",
    "The future of work is here, and it's not what you think",
    "Why your morning routine is sabotaging your success",
    "The one skill that will make you irreplaceable in 2025"
  ];
}

/**
 * Validate Twitter handle format
 */
export function validateTwitterHandle(handle: string): boolean {
  const cleanHandle = handle.replace('@', '');
  const handlePattern = /^[a-zA-Z0-9_]{1,15}$/;
  return handlePattern.test(cleanHandle);
}

/**
 * Format Twitter handle to consistent format
 */
export function formatTwitterHandle(handle: string): string {
  return handle.startsWith('@') ? handle : `@${handle}`;
} 