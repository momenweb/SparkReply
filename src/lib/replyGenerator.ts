import { supabase } from './supabase';

export interface ReplyGenerationRequest {
  tweetUrl?: string;
  postContent?: string;
  goal?: string;
  context?: string;
}

export interface ReplyGenerationResponse {
  success: boolean;
  data: {
    original_tweet: {
      id?: string;
      text: string;
      author?: {
        name: string;
        username: string;
        bio?: string;
        followers: number;
      };
      metrics?: {
        retweet_count: number;
        like_count: number;
        reply_count: number;
        quote_count: number;
      };
      url?: string;
    };
    replies: {
      contrarian: string;
      insight: string;
      story: string;
      question: string;
    };
    goal?: string;
    context?: string;
  };
}

export interface ReplyGenerationError {
  error: string;
  details?: any;
}

/**
 * Generate personalized replies for a tweet URL or direct post content
 */
export async function generateReplies(
  request: ReplyGenerationRequest
): Promise<ReplyGenerationResponse> {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Authentication required');
    }

    // Log request for debugging
    console.log('Sending request to edge function:', request);
    console.log('Request body that will be sent:', {
      tweetUrl: request.tweetUrl || null,
      postContent: request.postContent || null,
      goal: request.goal || null,
      context: request.context || null
    });

    // Call the Supabase Edge Function
    const requestBody: any = {};
    
    if (request.tweetUrl) {
      requestBody.tweetUrl = request.tweetUrl;
    }
    
    if (request.postContent) {
      requestBody.postContent = request.postContent;
    }
    
    if (request.goal) {
      requestBody.goal = request.goal;
    }
    
    if (request.context) {
      requestBody.context = request.context;
    }

    console.log('Final request body:', requestBody);

    const response = await supabase.functions.invoke('reply-generator', {
      body: requestBody,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    console.log('Raw Supabase response:', response);
    
    const { data, error } = response;

    if (error) {
      console.error('Edge function error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Try to get more details from the error
      if (error.context) {
        console.error('Error context:', error.context);
      }
      
      throw new Error(error.message || 'Failed to generate replies');
    }

    console.log('Edge function response:', data);

    if (!data || !data.success) {
      console.error('Edge function response:', data);
      console.error('Response details:', {
        hasData: !!data,
        success: data?.success,
        error: data?.error,
        fullResponse: data
      });
      throw new Error((data && data.error) || 'Failed to generate replies');
    }

    return data;
  } catch (error) {
    console.error('Error generating replies:', error);
    throw error;
  }
}

/**
 * Get reply generation history for the current user
 */
export async function getReplyHistory(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('reply_generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error fetching reply history:', error);
    throw error;
  }
}

/**
 * Delete a reply generation from history
 */
export async function deleteReplyGeneration(id: string) {
  try {
    const { error } = await supabase
      .from('reply_generations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error deleting reply generation:', error);
    throw error;
  }
}

/**
 * Validate a tweet URL format
 */
export function validateTweetUrl(url: string): boolean {
  const tweetUrlPattern = /^https?:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/i;
  return tweetUrlPattern.test(url);
}

/**
 * Format a tweet URL to a consistent format
 */
export function formatTweetUrl(url: string): string {
  return url.replace(/\?.*$/, ''); // Remove query parameters
}

/**
 * Extract tweet ID from a tweet URL
 */
export function extractTweetId(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
} 