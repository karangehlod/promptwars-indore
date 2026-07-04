import React, { useState, useEffect, useRef } from 'react';

export const StreamingText: React.FC<{ text: string }> = ({ text }) => {
  const [displayed, setDisplayed] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const interval = setInterval(() => {
      setDisplayed(prev => {
        if (prev.length < text.length) {
          const nextChar = text[prev.length];
          return prev + nextChar;
        }
        clearInterval(interval);
        return prev;
      });
    }, 15); // Add 1 char every 15ms

    return () => clearInterval(interval);
  }, [text]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayed]);

  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
      {displayed}
      <div ref={endRef} />
    </div>
  );
};
