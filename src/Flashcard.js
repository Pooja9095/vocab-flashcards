import React, { useState } from 'react';

const Flashcard = ({ word, meaning, markAsLearned }) => {
  const [revealed, setRevealed] = useState(false);

  // Toggle the revealed state to show/hide the meaning
  const handleToggle = () => {
    setRevealed(!revealed);
  };

  // Prevent event propagation and mark the word as learned
  const handleMarkAsLearned = (e) => {
    e.stopPropagation();
    markAsLearned(word);
  };

  return (
    <div className="flashcard" onClick={handleToggle}>
      <h2>{word}</h2>
      {revealed && <p>{meaning}</p>}
      <button onClick={handleMarkAsLearned}>
        Mark as Learned
      </button>
    </div>
  );
};

export default Flashcard;
