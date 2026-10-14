import React, { useEffect } from 'react';
import Core from './core';
import { useQuiz } from './engine';
import type { QuizProps } from './types';

function Quiz(props: QuizProps) {
  // Keep hook/provider imports free of default UI styles. Bundlers load this chunk on mount.
  useEffect(() => { void import('./styles.css'); }, []);
  const controller = useQuiz({
    quiz: props.quiz,
    shuffle: props.shuffle,
    shuffleAnswer: props.shuffleAnswer,
    continueTillCorrect: props.continueTillCorrect,
    revealAnswerOnSubmit: props.revealAnswerOnSubmit,
    allowNavigation: props.allowNavigation,
    timer: props.timer,
    allowPauseTimer: props.allowPauseTimer,
    onComplete: props.onComplete,
    onQuestionSubmit: props.onQuestionSubmit,
    autoStart: props.disableSynopsis,
  });
  const { state, actions } = controller;
  const { quiz, appLocale, questions } = state;
  if (state.status === 'invalid') return null;
  if (quiz.progressBarColor !== undefined && (typeof quiz.progressBarColor !== 'string'
    || !/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(quiz.progressBarColor))) return null;

  return (
    <div className="react-quiz-container">
      {state.status === 'idle' ? (
        <div className="quiz-introduction">
          <h2>{quiz.quizTitle}</h2>
          <div className="quiz-question-count">{appLocale.landingHeaderText.replace('<questionLength>', String(questions.length))}</div>
          {quiz.quizSynopsis && <div className="quiz-synopsis">{quiz.quizSynopsis}</div>}
          <div className="start-quiz-wrapper">
            <button type="button" onClick={actions.start} className="start-quiz-btn btn">
              {appLocale.startQuizBtn}
            </button>
          </div>
        </div>
      ) : <Core {...props} controller={controller} />}
    </div>
  );
}

export default Quiz;
