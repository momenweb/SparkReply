import { supabase } from './supabase';

export interface DMGenerationRequest {
  handle: string;
  goal: string;
}

export interface DMGenerationResponse {
  success: boolean;
  data: {
    target_user: {
      name: string;
      username: string;
      bio?: string;
      followers: number;
    };
    dms: {
      professional: string;
      casual: string;
      bold: string;
      witty: string;
    };
    goal: string;
  };
}

export interface DMGenerationError {
  error: string;
  details?: any;
}

/**
 * Generate personalized DMs for a target Twitter/X user
 */
export async function generateDMs(
  request: DMGenerationRequest
): Promise<DMGenerationResponse> {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Authentication required');
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('dm-generator', {
      body: request,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to generate DMs');
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate DMs');
    }

    return data;
  } catch (error) {
    console.error('Error generating DMs:', error);
    throw error;
  }
}

/**
 * Get DM generation history for the current user
 */
export async function getDMHistory(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('dm_generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error fetching DM history:', error);
    throw error;
  }
}

/**
 * Delete a DM generation record
 */
export async function deleteDMGeneration(id: string) {
  try {
    const { error } = await supabase
      .from('dm_generations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error deleting DM generation:', error);
    throw error;
  }
}

/**
 * Validate Twitter handle format
 */
export function validateTwitterHandle(handle: string): boolean {
  // Remove @ if present
  const cleanHandle = handle.replace('@', '');
  
  // Twitter username rules:
  // - 1-15 characters
  // - Only letters, numbers, and underscores
  // - Cannot be all numbers
  const twitterHandleRegex = /^[a-zA-Z0-9_]{1,15}$/;
  const isAllNumbers = /^\d+$/.test(cleanHandle);
  
  return twitterHandleRegex.test(cleanHandle) && !isAllNumbers;
}

/**
 * Clean and format Twitter handle
 */
export function formatTwitterHandle(handle: string): string {
  return handle.replace('@', '').toLowerCase();
} 