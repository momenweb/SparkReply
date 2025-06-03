import { useState, useCallback } from 'react';
import { 
  generateReplies, 
  getReplyHistory, 
  deleteReplyGeneration,
  ReplyGenerationRequest, 
  ReplyGenerationResponse,
  validateTweetUrl,
  formatTweetUrl,
  extractTweetId
} from '@/lib/replyGenerator';

interface UseReplyGeneratorState {
  isGenerating: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  result: ReplyGenerationResponse | null;
  history: any[];
}

export function useReplyGenerator() {
  const [state, setState] = useState<UseReplyGeneratorState>({
    isGenerating: false,
    isLoadingHistory: false,
    error: null,
    result: null,
    history: [],
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null }));
  }, []);

  const generateRepliesForContent = useCallback(async (
    tweetUrl?: string,
    postContent?: string,
    goal?: string,
    context?: string
  ) => {
    // Validate inputs
    if (!tweetUrl && !postContent) {
      setState(prev => ({ ...prev, error: 'Either tweet URL or post content is required' }));
      return;
    }

    if (tweetUrl) {
      const formattedUrl = formatTweetUrl(tweetUrl.trim());
      if (!validateTweetUrl(formattedUrl)) {
        setState(prev => ({ 
          ...prev, 
          error: 'Invalid tweet URL. Please enter a valid Twitter/X post URL.' 
        }));
        return;
      }
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null, 
      result: null 
    }));

    try {
      // Construct request object with only defined values
      const request: ReplyGenerationRequest = {};
      
      if (tweetUrl?.trim()) {
        request.tweetUrl = formatTweetUrl(tweetUrl.trim());
      }
      
      if (postContent?.trim()) {
        request.postContent = postContent.trim();
      }
      
      if (goal?.trim()) {
        request.goal = goal.trim();
      }
      
      if (context?.trim()) {
        request.context = context.trim();
      }

      console.log('Constructed request:', request);
      console.log('Request details:', {
        tweetUrl: request.tweetUrl,
        postContent: request.postContent,
        goal: request.goal,
        context: request.context,
        hasUrl: !!request.tweetUrl,
        hasContent: !!request.postContent
      });

      const response = await generateReplies(request);
      
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        result: response,
        error: null 
      }));

      // Refresh history after successful generation
      loadHistory();
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate replies';
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, []);

  const loadHistory = useCallback(async (limit: number = 10) => {
    setState(prev => ({ ...prev, isLoadingHistory: true, error: null }));

    try {
      const historyData = await getReplyHistory(limit);
      setState(prev => ({ 
        ...prev, 
        isLoadingHistory: false, 
        history: historyData,
        error: null 
      }));
      return historyData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load history';
      setState(prev => ({ 
        ...prev, 
        isLoadingHistory: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, []);

  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      await deleteReplyGeneration(id);
      
      // Remove the item from local state
      setState(prev => ({
        ...prev,
        history: prev.history.filter(item => item.id !== id)
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  return {
    // State
    isGenerating: state.isGenerating,
    isLoadingHistory: state.isLoadingHistory,
    error: state.error,
    result: state.result,
    history: state.history,
    
    // Actions
    generateReplies: generateRepliesForContent,
    loadHistory,
    deleteHistoryItem,
    retryGeneration: generateRepliesForContent,
    clearError,
    clearResult,
    
    // Utilities
    validateTweetUrl,
    formatTweetUrl,
    extractTweetId,
  };
} 