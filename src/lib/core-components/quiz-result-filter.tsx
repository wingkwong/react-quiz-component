import React, { useEffect, useId, useRef, useState } from 'react';
import type { AppLocale, QuizResultFilterProps } from '../types';

const FILTER_OPTIONS = [
  { value: 'all', localeKey: 'resultFilterAll' },
  { value: 'correct', localeKey: 'resultFilterCorrect' },
  { value: 'incorrect', localeKey: 'resultFilterIncorrect' },
  { value: 'unanswered', localeKey: 'resultFilterUnanswered' },
] satisfies { value: string; localeKey: keyof AppLocale }[];

function QuizResultFilter({ filteredValue, handleChange, appLocale }: QuizResultFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const triggerId = useId();
  const menuId = useId();
  const [focusedIndex, setFocusedIndex] = useState(0);

  const openMenu = (index: number) => {
    setFocusedIndex(index);
    setIsOpen(true);
  };

  const toggleDropdown = () => {
    if (isOpen) setIsOpen(false);
    else openMenu(Math.max(0, FILTER_OPTIONS.findIndex(({ value }) => value === filteredValue)));
  };

  const handleOptionClick = (value: string) => {
    handleChange({ target: { value } });
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const selectedOptionClass = isOpen ? 'selected-open' : '';
  const selectedOption = FILTER_OPTIONS.find(({ value }) => value === filteredValue) ?? FILTER_OPTIONS[0];

  useEffect(() => {
    if (isOpen) optionRefs.current[focusedIndex]?.focus();
  }, [isOpen, focusedIndex]);

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
    <div className="quiz-result-filter" ref={dropdownRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false);
      }}>
      <button
        id={triggerId}
        ref={triggerRef}
        type="button"
        className={`filter-dropdown-select ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            openMenu(event.key === 'ArrowDown' ? 0 : FILTER_OPTIONS.length - 1);
          }
        }}
      >
        <span className={`selected-option ${selectedOptionClass}`}>
          {appLocale[selectedOption.localeKey]}
        </span>
      </button>
      {isOpen && (
        <div
          className="dropdown-options"
          role="menu"
          tabIndex={-1}
          id={menuId}
          aria-labelledby={triggerId}
          onKeyDown={(event) => {
            const last = FILTER_OPTIONS.length - 1;
            if (event.key === 'Tab') {
              // Start native tab traversal at the trigger after dismissing.
              // Shift+Tab moves to the previous control; Tab moves past this menu.
              triggerRef.current?.focus();
              setIsOpen(false);
            } else if (event.key === 'Escape') {
              event.preventDefault();
              setIsOpen(false);
              triggerRef.current?.focus();
            } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
              event.preventDefault();
              setFocusedIndex(event.key === 'Home' ? 0 : event.key === 'End' ? last
                : (focusedIndex + (event.key === 'ArrowDown' ? 1 : last)) % FILTER_OPTIONS.length);
            } else if (event.key.length === 1 && event.key !== ' ') {
              const match = FILTER_OPTIONS.findIndex((_, offset) => {
                const index = (focusedIndex + offset + 1) % FILTER_OPTIONS.length;
                return appLocale[FILTER_OPTIONS[index].localeKey].toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase());
              });
              if (match >= 0) setFocusedIndex((focusedIndex + match + 1) % FILTER_OPTIONS.length);
            }
          }}
        >
          {FILTER_OPTIONS.map(({ value, localeKey }, index) => (
            <button
              key={value}
              type="button"
              ref={(element) => { optionRefs.current[index] = element; }}
              tabIndex={focusedIndex === index ? 0 : -1}
              onFocus={() => setFocusedIndex(index)}
              className={`dropdown-options-item ${
                filteredValue === value ? 'selected' : ''
              }`}
              onClick={() => handleOptionClick(value)}
              role="menuitemradio"
              aria-checked={filteredValue === value}
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
