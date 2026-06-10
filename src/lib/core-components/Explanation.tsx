import React from 'react';
import { ExplanationProps } from '../types';

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
    <div>
      <br />
      {explanation}
    </div>
  );
}

export default Explanation;
