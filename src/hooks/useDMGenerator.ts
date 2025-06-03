import { useState, useCallback } from 'react';
import { 
  generateDMs, 
  getDMHistory, 
  deleteDMGeneration,
  DMGenerationRequest, 
  DMGenerationResponse,
  validateTwitterHandle,
  formatTwitterHandle
} from '@/lib/dmGenerator';

interface UseDMGeneratorState {
  isGenerating: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  result: DMGenerationResponse | null;
  history: any[];
}

export function useDMGenerator() {
  const [state, setState] = useState<UseDMGeneratorState>({
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

  const generateDMsForUser = useCallback(async (handle: string, goal: string) => {
    // Validate inputs
    if (!handle.trim()) {
      setState(prev => ({ ...prev, error: 'Twitter handle is required' }));
      return;
    }

    if (!goal.trim()) {
      setState(prev => ({ ...prev, error: 'Goal is required' }));
      return;
    }

    const cleanHandle = formatTwitterHandle(handle);
    
    if (!validateTwitterHandle(cleanHandle)) {
      setState(prev => ({ 
        ...prev, 
        error: 'Invalid Twitter handle. Please enter a valid username (1-15 characters, letters, numbers, and underscores only)' 
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
      const request: DMGenerationRequest = {
        handle: cleanHandle,
        goal: goal.trim(),
      };

      const response = await generateDMs(request);
      
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate DMs';
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
      const historyData = await getDMHistory(limit);
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
      await deleteDMGeneration(id);
      
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

  const retryGeneration = useCallback(async (handle: string, goal: string) => {
    return generateDMsForUser(handle, goal);
  }, [generateDMsForUser]);

  return {
    // State
    isGenerating: state.isGenerating,
    isLoadingHistory: state.isLoadingHistory,
    error: state.error,
    result: state.result,
    history: state.history,
    
    // Actions
    generateDMs: generateDMsForUser,
    loadHistory,
    deleteHistoryItem,
    retryGeneration,
    clearError,
    clearResult,
    
    // Utilities
    validateHandle: validateTwitterHandle,
    formatHandle: formatTwitterHandle,
  };
} 