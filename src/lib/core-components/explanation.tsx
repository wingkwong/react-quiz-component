import React from 'react';
import defaultLocale from '../locale';
import type { ExplanationProps } from '../types';

function Explanation({ question, isResultPage, label = defaultLocale.resultPageExplanation }: ExplanationProps) {
  const { explanation } = question;

  if (!explanation) {
    return null;
  }

  if (isResultPage) {
    return (
      <div className="explanation">
        <div className="explanation-title">{label}</div>
        <div className="explanation-content">{explanation}</div>
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
