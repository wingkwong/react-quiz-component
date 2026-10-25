import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Core from './core';
import { useQuiz } from './engine';
import type { QuizProps } from './types';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function Quiz(props: QuizProps) {
  // Random orders differ between server and client. Keep their initial markup
  // identical when skipping the landing screen, then reveal the prepared quiz.
  const [waitForHydration] = useState(
    () => !!(props.disableSynopsis && (props.shuffle || props.shuffleAnswer)),
  );
  const hydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  // Keep hook/provider imports free of default UI styles. Bundlers load this chunk on mount.
  useEffect(() => { void import('./styles.css'); }, []);
  const controller = useQuiz({
    quiz: props.quiz,
    shuffle: props.shuffle,
    shuffleAnswer: props.shuffleAnswer,
    continueTillCorrect: props.continueTillCorrect,
    revealAnswerOnSubmit: props.revealAnswerOnSubmit,
    showCorrectAnswer: props.showCorrectAnswer,
    allowNavigation: props.allowNavigation,
    timer: props.timer,
    questionTimer: props.questionTimer,
    allowPauseTimer: props.allowPauseTimer,
    onComplete: props.onComplete,
    onQuestionSubmit: props.onQuestionSubmit,
    autoStart: props.disableSynopsis,
  });
  const { state, actions } = controller;
  const { quiz, appLocale, questions } = state;
  if ((waitForHydration && !hydrated) || state.status === 'invalid') return null;
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
