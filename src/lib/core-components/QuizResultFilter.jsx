import React from 'react';

function QuizResultFilter({ filteredValue, handleChange, appLocale }) {
  return (
    <div className="quiz-result-filter">
      <select value={filteredValue} onChange={handleChange}>
        <option value="all">{appLocale.resultFilterAll}</option>
        <option value="correct">{appLocale.resultFilterCorrect}</option>
        <option value="incorrect">{appLocale.resultFilterIncorrect}</option>
      </select>
    </div>
  );
}

export default QuizResultFilter;
