import { supabase } from './supabase';

export interface PostGenerationRequest {
  topic: string;
  tone?: string;
  writingStyleHandle?: string;
  goal?: string;
  writingStyleHandles?: string[];
}

export interface PostGenerationResponse {
  success: boolean;
  data: {
    variations: string[];
    topic: string;
    tone?: string;
    goal?: string;
    writingStyleHandle?: string;
    mimicUserInfo?: {
      name: string;
      username: string;
      description?: string;
      followers_count: number;
    };
  };
}

export interface PostIdeasRequest {
  writingStyleHandle: string;
}

export interface PostIdeasResponse {
  success: boolean;
  data: {
    ideas: string[];
    creatorInfo: {
      name: string;
      username: string;
      description?: string;
      followers_count: number;
    };
  };
}

export interface PostGenerationError {
  error: string;
  details?: any;
}

/**
 * Generate viral posts using AI
 */
export async function generatePosts(
  request: PostGenerationRequest
): Promise<PostGenerationResponse> {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Authentication required');
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('post-generator', {
      body: request,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to generate posts');
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate posts');
    }

    return data;
  } catch (error) {
    console.error('Error generating posts:', error);
    throw error;
  }
}

/**
 * Generate post ideas based on a creator's style
 */
export async function generatePostIdeas(
  request: PostIdeasRequest
): Promise<PostIdeasResponse> {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Authentication required');
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('post-ideas-generator', {
      body: request,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to generate post ideas');
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate post ideas');
    }

    return data;
  } catch (error) {
    console.error('Error generating post ideas:', error);
    throw error;
  }
}

/**
 * Get post generation history for the current user
 */
export async function getPostHistory(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('post_generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error fetching post history:', error);
    throw error;
  }
}

/**
 * Delete a post generation from history
 */
export async function deletePostGeneration(id: string) {
  try {
    const { error } = await supabase
      .from('post_generations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error deleting post generation:', error);
    throw error;
  }
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