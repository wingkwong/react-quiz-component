import React from 'react';
import type { ExplanationProps } from '../types';

function Explanation({ question, isResultPage }: ExplanationProps) {
  const { explanation } = question;

  if (!explanation) {
    return null;
  }

  if (isResultPage) {
    return (
      <div className="explanation">
        {explanation}
      </div>
    );
  }

  return (
    <div className="explanation">
      {explanation}
    </div>
  );
}

export default Explanation;
