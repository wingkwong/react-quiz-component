import React, { useState } from 'react';

function QuizResultFilter({ filteredValue, handleChange, appLocale }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (value) => {
    handleChange({ target: { value } });
    setIsOpen(false);
  };

  return (
    <div className="quiz-result-filter">
      <div
        className="custom-select"
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            toggleDropdown();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {filteredValue === 'all' ? appLocale.resultFilterAll : filteredValue}
        <span className={`arrow ${isOpen ? 'up' : 'down'}`} />
      </div>
      {isOpen && (
        <div className="custom-options" role="menu">
          <div
            className="custom-options-item"
            onClick={() => handleOptionClick('All')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOptionClick('All');
              }
            }}
            role="menuitem"
            tabIndex={0}
          >
            {appLocale.resultFilterAll}
          </div>
          <div
            className="custom-options-item"
            onClick={() => handleOptionClick('Correct')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOptionClick('Correct');
              }
            }}
            role="menuitem"
            tabIndex={0}
          >
            {appLocale.resultFilterCorrect}
          </div>
          <div
            className="custom-options-item"
            onClick={() => handleOptionClick('Incorrect')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOptionClick('Incorrect');
              }
            }}
            role="menuitem"
            tabIndex={0}
          >
            {appLocale.resultFilterIncorrect}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizResultFilter;
