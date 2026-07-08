import React, { useEffect, useRef, useState } from 'react';
import { AppLocale, QuizResultFilterProps } from '../types';

const FILTER_OPTIONS: { value: string; localeKey: keyof AppLocale }[] = [
  { value: 'all', localeKey: 'resultFilterAll' },
  { value: 'correct', localeKey: 'resultFilterCorrect' },
  { value: 'incorrect', localeKey: 'resultFilterIncorrect' },
  { value: 'unanswered', localeKey: 'resultFilterUnanswered' },
];

function QuizResultFilter({ filteredValue, handleChange, appLocale }: QuizResultFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen((open) => !open);
  };

  const handleOptionClick = (value: string) => {
    handleChange({ target: { value } });
    setIsOpen(false);
  };

  const selectedOptionClass = isOpen ? 'selected-open' : '';
  const selectedOption = FILTER_OPTIONS.find(({ value }) => value === filteredValue) ?? FILTER_OPTIONS[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isOpen
        && dropdownRef.current
        && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="quiz-result-filter" ref={dropdownRef}>
      <button
        id="quiz-filter"
        type="button"
        className={`filter-dropdown-select ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className={`selected-option ${selectedOptionClass}`}>
          {appLocale[selectedOption.localeKey]}
        </span>
      </button>
      {isOpen && (
        <div
          className="dropdown-options"
          role="menu"
          aria-labelledby="quiz-filter"
        >
          {FILTER_OPTIONS.map(({ value, localeKey }) => (
            <button
              key={value}
              type="button"
              className={`dropdown-options-item ${
                filteredValue === value ? 'selected' : ''
              }`}
              onClick={() => handleOptionClick(value)}
              role="menuitem"
            >
              {appLocale[localeKey]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizResultFilter;
