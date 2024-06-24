import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Flashcard from './Flashcard';
import './App.css';

const App = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [learnedWords, setLearnedWords] = useState([]);

  useEffect(() => {
    const fetchRandomWords = async () => {
      try {
        const response = await axios.get('https://random-word-api.herokuapp.com/word?number=10');
        const randomWords = response.data;
        console.log('Random Words:', randomWords);

        const fetchWordData = async (word) => {
          try {
            const response = await axios.get(`https://thingproxy.freeboard.io/fetch/https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (response.data && response.data.length > 0) {
              const wordData = {
                word: response.data[0].word,
                meaning: response.data[0].meanings[0].definitions[0].definition
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

        const wordPromises = randomWords.map(word => fetchWordData(word));
        const wordDataArray = await Promise.all(wordPromises);
        const filteredWordData = wordDataArray.filter(wordData => wordData !== null);

        console.log('Processed Word Data:', filteredWordData);
        setFlashcards(filteredWordData);
      } catch (error) {
        console.error('Error fetching random words:', error);
      }
    };

    fetchRandomWords();
  }, []);

  const markAsLearned = async (word) => {
    setLearnedWords([...learnedWords, word]);
    const updatedFlashcards = flashcards.filter(card => card.word !== word);
    setFlashcards(updatedFlashcards);

    // Fetch a new word to replace the learned word
    try {
      const newWordResponse = await axios.get('https://random-word-api.herokuapp.com/word?number=1');
      const newWord = newWordResponse.data[0];
      const response = await axios.get(`https://thingproxy.freeboard.io/fetch/https://api.dictionaryapi.dev/api/v2/entries/en/${newWord}`);
      if (response.data && response.data.length > 0) {
        const newWordData = {
          word: response.data[0].word,
          meaning: response.data[0].meanings[0].definitions[0].definition
        };
        setFlashcards([...updatedFlashcards, newWordData]);
      }
    } catch (error) {
      console.error('Error fetching new word:', error);
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
