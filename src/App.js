import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Flashcard from './Flashcard';
import './App.css';

const App = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [learnedWords, setLearnedWords] = useState([]);
  const maxRetries = 3; // Maximum retries for fetching a new word

  // Fetch data for each word
  const fetchWordData = async (word) => {
    try {
      const response = await axios.get(`https://thingproxy.freeboard.io/fetch/https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (response.data && response.data.length > 0) {
        const wordData = {
          word: response.data[0].word,
          meaning: response.data[0].meanings[0].definitions[0].definition,
        };
        return wordData;
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`Word not found: ${word}`);
      } else {
        console.error(`Error fetching word: ${word}`, error);
      }
    }
    return null;
  };

  // Fetch data for an array of words
  const fetchWordDataArray = useCallback(async (words) => {
    const wordPromises = words.map(word => fetchWordData(word));
    return await Promise.all(wordPromises);
  }, []);

  // Fetch initial set of random words
  useEffect(() => {
    const fetchRandomWords = async () => {
      try {
        const response = await axios.get('https://random-word-api.herokuapp.com/word?number=10');
        const randomWords = response.data;
        console.log('Random Words:', randomWords);

        const wordDataArray = await fetchWordDataArray(randomWords);
        const filteredWordData = wordDataArray.filter(wordData => wordData !== null);

        console.log('Processed Word Data:', filteredWordData);
        setFlashcards(filteredWordData);
      } catch (error) {
        console.error('Error fetching random words:', error);
      }
    };

    fetchRandomWords();
  }, [fetchWordDataArray]);

  // Fetch a new word with retries
  const fetchNewWordWithRetries = async (retries = maxRetries) => {
    while (retries > 0) {
      let newWord = '';
      try {
        const newWordResponse = await axios.get('https://random-word-api.herokuapp.com/word?number=1');
        newWord = newWordResponse.data[0];
        const newWordData = await fetchWordData(newWord);
        if (newWordData) {
          return newWordData;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`Word not found: ${newWord}`);
        } else {
          console.error(`Error fetching new word: ${newWord}`, error);
        }
        retries -= 1;
      }
    }
    return null;
  };

  // Mark a word as learned and fetch a new word
  const markAsLearned = async (word) => {
    setLearnedWords([...learnedWords, word]);
    const updatedFlashcards = flashcards.filter(card => card.word !== word);
    setFlashcards(updatedFlashcards);

    const newWordData = await fetchNewWordWithRetries();
    if (newWordData) {
      setFlashcards([...updatedFlashcards, newWordData]);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Vocab Flash Cards</h1>
      </header>
      {console.log('Flashcards to be displayed:', flashcards)}
      {flashcards.map((card, index) => (
        <Flashcard
          key={index}
          word={card.word}
          meaning={card.meaning}
          markAsLearned={markAsLearned}
        />
      ))}
      <div className="learned-words">
        <h3>Learned Words:</h3>
        <ul>
          {learnedWords.map((word, index) => (
            <li key={index}>{word}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
