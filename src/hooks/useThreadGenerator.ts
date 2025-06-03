import { useState, useCallback } from 'react';
import { 
  generateThread, 
  getThreadHistory, 
  deleteThreadGeneration,
  getTrendingTopics,
  getViralPosts,
  ThreadGenerationRequest, 
  ThreadGenerationResponse,
  TrendingTopic,
  validateTwitterHandle,
  formatTwitterHandle
} from '@/lib/threadGenerator';

interface UseThreadGeneratorState {
  isGenerating: boolean;
  isLoadingHistory: boolean;
  isLoadingTrends: boolean;
  error: string | null;
  result: ThreadGenerationResponse | null;
  history: any[];
  trendingTopics: TrendingTopic[];
  viralPosts: string[];
}

export function useThreadGenerator() {
  const [state, setState] = useState<UseThreadGeneratorState>({
    isGenerating: false,
    isLoadingHistory: false,
    isLoadingTrends: false,
    error: null,
    result: null,
    history: [],
    trendingTopics: [],
    viralPosts: [],
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null }));
  }, []);

  const generateThreadContent = useCallback(async (
    topic: string,
    tone?: string,
    targetAudience?: string,
    handleToMimic?: string
  ) => {
    // Validate inputs
    if (!topic?.trim()) {
      setState(prev => ({ ...prev, error: 'Topic is required' }));
      return;
    }

    if (handleToMimic && !validateTwitterHandle(handleToMimic)) {
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
      const request: ThreadGenerationRequest = {
        topic: topic.trim(),
        tone: tone?.trim() || undefined,
        targetAudience: targetAudience?.trim() || undefined,
        handleToMimic: handleToMimic?.trim() ? formatTwitterHandle(handleToMimic.trim()) : undefined,
      };

      console.log('Generating thread with request:', request);

      const response = await generateThread(request);
      
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate thread';
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
      const historyData = await getThreadHistory(limit);
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
      await deleteThreadGeneration(id);
      
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

  const loadTrendingTopics = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingTrends: true, error: null }));

    try {
      const [trends, viral] = await Promise.all([
        getTrendingTopics(),
        getViralPosts()
      ]);
      
      setState(prev => ({ 
        ...prev, 
        isLoadingTrends: false, 
        trendingTopics: trends,
        viralPosts: viral,
        error: null 
      }));
      
      return { trends, viral };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load trending topics';
      setState(prev => ({ 
        ...prev, 
        isLoadingTrends: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, []);

  const getRandomTopic = useCallback(() => {
    const allTopics = [
      ...state.trendingTopics.map(t => t.name),
      ...state.viralPosts
    ];
    
    if (allTopics.length === 0) {
      return "The future of AI and how it will change everything";
    }
    
    return allTopics[Math.floor(Math.random() * allTopics.length)];
  }, [state.trendingTopics, state.viralPosts]);

  return {
    // State
    isGenerating: state.isGenerating,
    isLoadingHistory: state.isLoadingHistory,
    isLoadingTrends: state.isLoadingTrends,
    error: state.error,
    result: state.result,
    history: state.history,
    trendingTopics: state.trendingTopics,
    viralPosts: state.viralPosts,
    
    // Actions
    generateThread: generateThreadContent,
    loadHistory,
    deleteHistoryItem,
    loadTrendingTopics,
    getRandomTopic,
    retryGeneration: generateThreadContent,
    clearError,
    clearResult,
    
    // Utilities
    validateTwitterHandle,
    formatTwitterHandle,
  };
} 