import React from 'react';
import Explanation from './explanation';
import type { InstantFeedbackProps } from '../types';

const renderMessageForCorrectAnswer = (question: InstantFeedbackProps['question']): string => {
  const defaultMessage = 'You are correct. Please click Next to continue.';
  return question.messageForCorrectAnswer || defaultMessage;
};

const renderMessageForIncorrectAnswer = (question: InstantFeedbackProps['question']): string => {
  const defaultMessage = 'Incorrect answer. Please try again.';
  return question.messageForIncorrectAnswer || defaultMessage;
};

function InstantFeedback({
  showInstantFeedback,
  incorrectAnswer,
  correctAnswer,
  question,
}: InstantFeedbackProps) {
  return (
    <>
      {incorrectAnswer && showInstantFeedback
            && (
            <div className="alert incorrect">
              <div className="feedback-message">
                <svg className="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m9 9 6 6m0-6-6 6" />
                </svg>
                <span>{renderMessageForIncorrectAnswer(question)}</span>
              </div>
            </div>
            )}
      {correctAnswer && showInstantFeedback
            && (
            <div className="alert correct">
              <div className="feedback-message">
                <svg className="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8 12 3 3 5-6" />
                </svg>
                <span>{renderMessageForCorrectAnswer(question)}</span>
              </div>
              <Explanation question={question} isResultPage={false} />
            </div>
            )}
    </>
  );
}

export default InstantFeedback;
