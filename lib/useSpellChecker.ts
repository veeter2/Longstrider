import { useState, useCallback } from 'react';


interface SpellCheckError {
  word: string;
  position: { start: number; end: number };
  suggestions: string[];
}

interface UseSpellCheckerReturn {
  checkWord: (word: string) => boolean;
  getSuggestions: (word: string) => string[];
  checkText: (text: string) => SpellCheckError[];
  correctWord: (word: string) => string;
  isLoaded: boolean;
  addToDictionary: (word: string) => void;
  removeFromDictionary: (word: string) => void;
}


export function useSpellChecker(): UseSpellCheckerReturn {
  // Spell checker is disabled for performance - always return loaded=true with no-op functions
  const [isLoaded] = useState(true);

  // Disabled: Load custom dictionary from localStorage
  // useEffect(() => {
  //   try {
  //     const saved = localStorage.getItem('ivy_custom_dictionary');
  //     if (saved) {
  //       setCustomDictionary(new Set(JSON.parse(saved)));
  //     }
  //   } catch (e) {
  //     console.warn('Failed to load custom dictionary:', e);
  //   }
  // }, []);

  // Disabled: Save custom dictionary to localStorage
  // useEffect(() => {
  //   try {
  //     localStorage.setItem('ivy_custom_dictionary', JSON.stringify([...customDictionary]));
  //   } catch (e) {
  //     console.warn('Failed to save custom dictionary:', e);
  //   }
  // }, [customDictionary]);

  // Disabled: Initialize Typo.js with dictionaries
  // useEffect(() => {
  //   if (loadingRef.current || typoRef.current) return;
  //   
  //   loadingRef.current = true;
  //   
  //   const loadDictionary = async () => {
  //     try {
  //       console.log('Loading spell checker dictionaries...');
  //       
  //       // Load dictionary files
  //       const [affResponse, dicResponse] = await Promise.all([
  //         fetch('/dictionaries/en_US.aff'),
  //         fetch('/dictionaries/en_US.dic')
  //       ]);

  //       if (!affResponse.ok || !dicResponse.ok) {
  //         throw new Error('Failed to load dictionary files');
  //       }

  //       const [affData, dicData] = await Promise.all([
  //         affResponse.text(),
  //         dicResponse.text()
  //       ]);

  //       console.log('Dictionary files loaded, initializing Typo.js...');
  //       
  //       // Initialize Typo.js
  //       typoRef.current = new Typo('en_US', affData, dicData, {
  //         platform: 'web'
  //       });

  //       setIsLoaded(true);
  //       console.log('Spell checker loaded successfully!');
  //     } catch (error) {
  //       console.error('Failed to load spell checker:', error);
  //       // Set loaded to true anyway so UI doesn't hang
  //       setIsLoaded(true);
  //     } finally {
  //       loadingRef.current = false;
  //     }
  //   };

  //   loadDictionary();
  // }, []);

  const checkWord = useCallback((_word: string): boolean => {
    // Spell checker disabled for performance - all words are "correct"
    return true;
  }, []);

  const getSuggestions = useCallback((_word: string): string[] => {
    // Spell checker disabled for performance - no suggestions
    return [];
  }, []);

  const correctWord = useCallback((word: string): string => {
    // Spell checker disabled for performance - return word unchanged
    return word;
  }, []);

  const checkText = useCallback((_text: string): SpellCheckError[] => {
    // Spell checker disabled for performance - no errors
    return [];
  }, []);

  const addToDictionary = useCallback((_word: string) => {
    // Spell checker disabled for performance - no-op
  }, []);

  const removeFromDictionary = useCallback((_word: string) => {
    // Spell checker disabled for performance - no-op
  }, []);

  return {
    checkWord,
    getSuggestions,
    checkText,
    correctWord,
    isLoaded,
    addToDictionary,
    removeFromDictionary
  };
}

export default useSpellChecker;
