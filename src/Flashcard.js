import React, { useState } from 'react';

const Flashcard = ({ word, meaning, markAsLearned }) => {
  const [revealed, setRevealed] = useState(false);

  // Add debug statement to log props
  console.log('Flashcard props:', { word, meaning });

  return (
    <div className="flashcard" onClick={() => setRevealed(!revealed)}>
      <h2>{word}</h2>
      {revealed && <p>{meaning}</p>}
      <button onClick={(e) => { e.stopPropagation(); markAsLearned(word); }}>
        Mark as Learned
      </button>
    </div>
  );
};

export default Flashcard;
