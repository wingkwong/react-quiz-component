import React, { useEffect } from 'react';
import Explanation from './Explanation';
import { InstantFeedbackProps } from '../types';

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
  onQuestionSubmit,
  userAnswer,
}: InstantFeedbackProps) {
  useEffect(() => {
    if (onQuestionSubmit && (correctAnswer || incorrectAnswer)) {
      onQuestionSubmit({ question, userAnswer, isCorrect: correctAnswer });
    }
  }, [correctAnswer, incorrectAnswer]);

  return (
    <>
      {incorrectAnswer && showInstantFeedback
            && <div className="alert incorrect">{renderMessageForIncorrectAnswer(question)}</div>}
      {correctAnswer && showInstantFeedback
            && (
            <div className="alert correct">
              {renderMessageForCorrectAnswer(question)}
              <Explanation question={question} isResultPage={false} />
            </div>
            )}
    </>
  );
}

export default InstantFeedback;
