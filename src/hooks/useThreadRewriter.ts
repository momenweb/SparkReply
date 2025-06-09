import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ThreadRewriteRequest {
  threadContent: string;
  threadUrl?: string;
  tone?: string;
  rewriteType: string;
  handleToMimic?: string;
}

interface ThreadRewriteResult {
  original: string[];
  rewritten: string[];
  rewriteType: string;
  tone?: string;
  handleToMimic?: string;
  mimicUserInfo?: {
    id: string;
    name: string;
    username: string;
    description?: string;
    public_metrics: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
    };
  };
  threadUrl?: string;
}

interface ThreadRewriteResponse {
  success: boolean;
  data: ThreadRewriteResult;
}

export const useThreadRewriter = () => {
  const [isRewriting, setIsRewriting] = useState(false);
  const [result, setResult] = useState<ThreadRewriteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const rewriteThread = useCallback(async (
    threadContent: string,
    rewriteType: string,
    threadUrl?: string,
    tone?: string,
    handleToMimic?: string
  ) => {
    if (!user) {
      setError('You must be logged in to rewrite threads');
      return;
    }

    setIsRewriting(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const requestBody: ThreadRewriteRequest = {
        threadContent: threadContent.trim(),
        rewriteType,
      };

      // Add optional fields only if they have values
      if (threadUrl && threadUrl.trim()) {
        requestBody.threadUrl = threadUrl.trim();
      }
      if (tone && tone.trim()) {
        requestBody.tone = tone.trim();
      }
      if (handleToMimic && handleToMimic.trim()) {
        requestBody.handleToMimic = handleToMimic.trim();
      }

      const { data, error } = await supabase.functions.invoke('thread-rewriter', {
        body: requestBody,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to rewrite thread');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to rewrite thread');
      }

      setResult(data);
      return data;
    } catch (error: any) {
      console.error('Error rewriting thread:', error);
      setError(error.message || 'Failed to rewrite thread');
      throw error;
    } finally {
      setIsRewriting(false);
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    rewriteThread,
    isRewriting,
    result,
    error,
    clearError,
    clearResult,
  };
}; 