import React from 'react';

const Explanation = function ({ question, isResultPage }) {
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
};

export default Explanation;
