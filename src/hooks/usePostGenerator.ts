import { useState, useCallback } from 'react';
import { 
  generatePosts, 
  generatePostIdeas,
  getPostHistory, 
  deletePostGeneration,
  PostGenerationRequest, 
  PostGenerationResponse,
  PostIdeasRequest,
  PostIdeasResponse,
  validateTwitterHandle,
  formatTwitterHandle
} from '@/lib/postGenerator';
import { useUserSettings } from './useUserSettings';

interface UsePostGeneratorState {
  isGenerating: boolean;
  isGeneratingIdeas: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  result: PostGenerationResponse | null;
  ideas: PostIdeasResponse | null;
  history: any[];
}

export function usePostGenerator() {
  const [state, setState] = useState<UsePostGeneratorState>({
    isGenerating: false,
    isGeneratingIdeas: false,
    isLoadingHistory: false,
    error: null,
    result: null,
    ideas: null,
    history: [],
  });
  const { writingStyleHandles, defaultTone } = useUserSettings();

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null }));
  }, []);

  const clearIdeas = useCallback(() => {
    setState(prev => ({ ...prev, ideas: null }));
  }, []);

  const generatePostsForTopic = useCallback(async (
    topic: string,
    tone?: string,
    writingStyleHandle?: string,
    goal?: string
  ) => {
    // Validate inputs
    if (!topic?.trim()) {
      setState(prev => ({ ...prev, error: 'Topic is required' }));
      return;
    }

    if (writingStyleHandle && !validateTwitterHandle(writingStyleHandle)) {
      setState(prev => ({ 
        ...prev, 
        error: 'Invalid Twitter handle format. Use format: @username or username' 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null, 
      result: null 
    }));

    try {
      const request: PostGenerationRequest = {
        topic: topic.trim(),
        tone: tone?.trim() || defaultTone,
        writingStyleHandle: writingStyleHandle?.trim() ? formatTwitterHandle(writingStyleHandle.trim()) : undefined,
        goal: goal?.trim() || undefined,
        writingStyleHandles // Include writing style handles from settings
      };

      console.log('Generating posts with request:', request);

      const response = await generatePosts(request);
      
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate posts';
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, [writingStyleHandles, defaultTone]);

  const generateIdeasForCreator = useCallback(async (writingStyleHandle: string) => {
    // Validate inputs
    if (!writingStyleHandle?.trim()) {
      setState(prev => ({ ...prev, error: 'Writing style handle is required for idea generation' }));
      return;
    }

    if (!validateTwitterHandle(writingStyleHandle)) {
      setState(prev => ({ 
        ...prev, 
        error: 'Invalid Twitter handle format. Use format: @username or username' 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isGeneratingIdeas: true, 
      error: null, 
      ideas: null 
    }));

    try {
      const request: PostIdeasRequest = {
        writingStyleHandle: formatTwitterHandle(writingStyleHandle.trim())
      };

      console.log('Generating post ideas with request:', request);

      const response = await generatePostIdeas(request);
      
      setState(prev => ({ 
        ...prev, 
        isGeneratingIdeas: false, 
        ideas: response,
        error: null 
      }));
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate post ideas';
      setState(prev => ({ 
        ...prev, 
        isGeneratingIdeas: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, []);

  const loadHistory = useCallback(async (limit: number = 10) => {
    setState(prev => ({ ...prev, isLoadingHistory: true, error: null }));

    try {
      const historyData = await getPostHistory(limit);
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
      await deletePostGeneration(id);
      
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
    isGeneratingIdeas: state.isGeneratingIdeas,
    isLoadingHistory: state.isLoadingHistory,
    error: state.error,
    result: state.result,
    ideas: state.ideas,
    history: state.history,
    
    // Actions
    generatePosts: generatePostsForTopic,
    generateIdeas: generateIdeasForCreator,
    loadHistory,
    deleteHistoryItem,
    retryGeneration: generatePostsForTopic,
    clearError,
    clearResult,
    clearIdeas,
    
    // Utilities
    validateTwitterHandle,
    formatTwitterHandle,
  };
} 