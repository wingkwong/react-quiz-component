import React from 'react';
import ProgressBar from './core-components/progress-bar';
import QuizResultFilter from './core-components/quiz-result-filter';
import { rawMarkup } from './core-components/helpers';
import { isAnswered } from './engine/engine';
import InstantFeedback from './core-components/instant-feedback';
import Explanation from './core-components/explanation';
import defaultLocale from './locale';
import QuestionAudio from './core-components/question-audio';
import type { QuizProps, Question } from './types';
import type { QuizController, ResultFilter } from './engine';

function Core({
  controller, showDefaultResult, customResultPage, showInstantFeedback,
  enableProgressBar, allowQuit,
}: QuizProps & { controller: QuizController }) {
  const { state, actions } = controller;
  const {
    questions, currentQuestionIndex, currentQuestion: activeQuestion,
    appLocale, correct, timer, timeRemaining,
    resultFilter: filteredValue, summary: questionSummary, allowNavigation,
  } = state;
  const { totalPoints, correctPoints } = questionSummary;
  const endQuiz = state.status === 'completed';
  const isRunning = state.status === 'active';
  const isCorrect = state.feedback === 'correct';
  const incorrectAnswer = state.feedback === 'incorrect';
  const allowPauseTimer = state.canPause || state.canResume;
  const progressBarColor = state.quiz.progressBarColor;
  const answerSelectionType = activeQuestion?.answerSelectionType ?? 'single';
  const showDefaultResultState = showDefaultResult ?? true;
  const handleChange = (event: { target: { value: string } }) => {
    actions.setResultFilter(event.target.value as ResultFilter);
  };
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      actions.nextQuestion();
    } else if (!state.canSubmit) {
      alert('Quiz is incomplete');
    } else if (!allowNavigation || confirm('You have finished all the questions. Submit Quiz now?')) {
      actions.submitQuiz();
    }
  };

  const renderAnswerInResult = (question: Question, userInputIndex: number | number[] | undefined) => {
    const { answers, correctAnswer, questionType } = question;
    const questionAnswerSelectionType = question.answerSelectionType || 'single';
    const didAnswerQuestion = isAnswered(userInputIndex);

    return answers.map((answer, index) => {
      let answerBtnCorrectClassName = '';
      let answerBtnIncorrectClassName = '';

      if (questionAnswerSelectionType === 'single') {
        answerBtnCorrectClassName = `${index + 1}` === correctAnswer ? 'correct' : '';
        answerBtnIncorrectClassName = `${userInputIndex}` !== correctAnswer
        && `${index + 1}` === `${userInputIndex}` ? 'incorrect' : '';

        if (!didAnswerQuestion && `${index + 1}` !== correctAnswer) {
          answerBtnIncorrectClassName = 'unanswered';
        }
      } else {
        const correctAnswerArray = correctAnswer as number[];
        answerBtnCorrectClassName = correctAnswerArray.includes(index + 1)
          ? 'correct'
          : '';
        answerBtnIncorrectClassName = !correctAnswerArray.includes(index + 1)
        && Array.isArray(userInputIndex) && userInputIndex.includes(index + 1) ? 'incorrect' : '';

        if (!didAnswerQuestion && !correctAnswerArray.includes(index + 1)) {
          answerBtnIncorrectClassName = 'unanswered';
        }
      }

      return (
        <div key={`result-answer-${question.questionIndex ?? 0}-${index}`}>
          <button
            type="button"
            disabled
            className={`answer-btn btn ${answerBtnCorrectClassName}${answerBtnIncorrectClassName}`}
          >
            <span className={`answer-indicator answer-indicator-${questionAnswerSelectionType}`} aria-hidden="true" />
            {questionType === 'text' && <span className="answer-content">{answer}</span>}
            {questionType === 'photo' && <img src={answer} alt={question.answerAltTexts?.[index] ?? `Answer ${index + 1}`} />}
          </button>
        </div>
      );
    });
  };

  const renderTags = (selectionType: 'single' | 'multiple', numberOfSelection: number, segment?: string) => {
    const {
      singleSelectionTagText,
      multipleSelectionTagText,
      pickNumberOfSelection,
    } = appLocale;

    return (
      <div className="tag-container">
        {selectionType === 'single'
          && <span className="single selection-tag">{singleSelectionTagText}</span>}
        {selectionType === 'multiple'
          && <span className="multiple selection-tag">{multipleSelectionTagText}</span>}
        <span className="number-of-selection">
          {pickNumberOfSelection.replace('<numberOfSelection>', String(numberOfSelection))}
        </span>
        {segment && <span className="selection-tag segment">{segment}</span>}
      </div>
    );
  };

  const renderQuizResultQuestions = () => {
    return state.filteredResults
      .map(({ question, userAnswer: userInputIndex, index }) => {
        const questionAnswerSelectionType = question.answerSelectionType || 'single';

        return (
          <div className="result-answer-wrapper" key={`result-question-${question.questionIndex ?? index}`}>
            <h3>
              <span dangerouslySetInnerHTML={rawMarkup(`Q${question.questionIndex}: ${question.question}`)} />
              {' '}
              <span className="question-marks">{appLocale.marksOfQuestion.replace('<marks>', String(question.point))}</span>
            </h3>
            {question.questionPic && (
              <img src={question.questionPic} alt={question.questionPicAlt ?? 'Question illustration'} />
            )}
            {renderTags(
              questionAnswerSelectionType,
              Array.isArray(question.correctAnswer) ? question.correctAnswer.length : 1,
              question.segment,
            )}
            <QuestionAudio question={question} />
            <div className="result-answer">
              {renderAnswerInResult(question, userInputIndex)}
            </div>
            <Explanation question={question} isResultPage />
          </div>
        );
      });
  };

  const renderAnswers = () => state.answers.map((answer) => (
    <button
      key={answer.answerNumber}
      type="button"
      disabled={answer.disabled}
      aria-pressed={answer.selected}
      className={`answer-btn btn ${answer.feedback ?? (answer.selected ? 'selected' : '')}`}
      onClick={() => actions.selectAnswer(answer.answerNumber)}
    >
      <span className={`answer-indicator answer-indicator-${answerSelectionType}`} aria-hidden="true" />
      {activeQuestion?.questionType === 'photo'
        ? <img src={answer.value} alt={answer.altText} /> : <span className="answer-content">{answer.value}</span>}
    </button>
  ));

  const renderResult = () => (
    <div className="card-body">
      <div className="result-overview">
        <div className="result-score-value" aria-hidden="true">
          {correctPoints}<span> / {totalPoints}</span>
        </div>
        <h2 className="result-score">
          {appLocale.resultPagePoint
            .replace('<correctPoints>', String(correctPoints))
            .replace('<totalPoints>', String(totalPoints))}
        </h2>
        <p className="result-summary">
          {appLocale.resultPageHeaderText
            .replace('<correctIndexLength>', String(correct.length))
            .replace('<questionLength>', String(questions.length))}
        </p>
      </div>
      <QuizResultFilter
        filteredValue={filteredValue}
        handleChange={handleChange}
        appLocale={appLocale}
      />
      {renderQuizResultQuestions()}
    </div>
  );

  const formatTime = (time: number): string => (time < 10 ? '0' : '');
  const displayTime = (time: number): string => {
    time = Math.ceil(time);
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${formatTime(hours)}${hours}:${formatTime(minutes)}${minutes}:${
      formatTime(seconds)
    }${seconds}`;
  };

  return (
    <div className="question-wrapper">
      {enableProgressBar && (
        <ProgressBar
          progress={state.progress}
          progressBarColor={progressBarColor}
        />
      )}
      <div className="quiz-header">
        {!endQuiz && <span className="question-count">{`${appLocale.question} ${currentQuestionIndex + 1} / ${questions.length}`}</span>}
        {timer && (
          <span className="quiz-timer">
            {isRunning ? appLocale.timerTimeRemaining : appLocale.timerTimeTaken}: <b>{displayTime(isRunning ? timeRemaining || 0 : timer - (timeRemaining || 0))}</b>
          </span>
        )}
        {!endQuiz && timer && allowPauseTimer && (
          <button type="button" className="timer-btn" onClick={isRunning ? actions.pauseTimer : actions.resumeTimer}>
            {isRunning ? appLocale.pauseScreenPause : appLocale.pauseScreenResume}
          </button>
        )}
      </div>
      {!endQuiz && (
        <div className="question-wrapper-body">
          {isRunning ? (
            <>
              <h3>
                <span dangerouslySetInnerHTML={rawMarkup(activeQuestion?.question ?? '')} />
                {' '}
                <span className="question-marks">{appLocale.marksOfQuestion.replace('<marks>', String(activeQuestion?.point))}</span>
              </h3>
              {activeQuestion && activeQuestion.questionPic && (
                <img src={activeQuestion.questionPic} alt={activeQuestion.questionPicAlt ?? 'Question illustration'} />
              )}
              {activeQuestion
                && renderTags(
                  answerSelectionType,
                  Array.isArray(activeQuestion.correctAnswer) ? activeQuestion.correctAnswer.length : 1,
                  activeQuestion.segment,
                )}
              {activeQuestion && <QuestionAudio key={activeQuestion.questionIndex} question={activeQuestion} />}
              <div className="question-modal">
                <InstantFeedback
                  question={activeQuestion!}
                  showInstantFeedback={showInstantFeedback}
                  correctAnswer={isCorrect}
                  incorrectAnswer={incorrectAnswer}
                />
              </div>
              {activeQuestion && renderAnswers()}
              {(state.canGoNext || state.canSubmit || allowNavigation) && (
                <div className="question-btn-container">
                  {allowNavigation && currentQuestionIndex > 0 && (
                    <button
                      onClick={actions.previousQuestion}
                      className="prev-question-btn btn"
                      type="button"
                    >
                      {appLocale.prevQuestionBtn}
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className="next-question-btn btn"
                    type="button"
                  >
                    {appLocale.nextQuestionBtn}
                  </button>
                </div>
              )}
            </>
          ) : (
            <span className="timer-pause-screen">
              {appLocale.pauseScreenDisplay}
            </span>
          )}
        </div>
      )}
      {allowQuit && state.canQuit && (
        <div className="question-btn-container">
          <button type="button" className="quit-quiz-btn btn" onClick={() => {
            if (confirm(appLocale.quitQuizConfirm ?? defaultLocale.quitQuizConfirm)) actions.quitQuiz();
          }}>
            {appLocale.quitQuizBtn ?? defaultLocale.quitQuizBtn}
          </button>
        </div>
      )}
      {endQuiz && showDefaultResultState && customResultPage === undefined
          && renderResult()}
      {endQuiz && !showDefaultResultState && customResultPage !== undefined
          && customResultPage(questionSummary)}
    </div>
  );
}

export default Core;
