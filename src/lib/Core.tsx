import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import ProgressBar from './core-components/ProgressBar';
import QuizResultFilter from './core-components/QuizResultFilter';
import { checkAnswer, selectAnswer, rawMarkup } from './core-components/helpers';
import InstantFeedback from './core-components/InstantFeedback';
import Explanation from './core-components/Explanation';
import { CoreProps, Question, ButtonState, QuestionSummary } from './types';

const isAnswered = (answer: number | number[] | undefined): boolean => (
  answer !== undefined && (!Array.isArray(answer) || answer.length > 0)
);

const getPoint = (question: Question): number => {
  const point = question.point || 0;
  return Number(typeof point === 'string' ? parseInt(point, 10) : point);
};

function Core({
  questions, appLocale, showDefaultResult, onComplete, customResultPage,
  showInstantFeedback, continueTillCorrect, revealAnswerOnSubmit, allowNavigation,
  onQuestionSubmit, timer, allowPauseTimer, enableProgressBar, progressBarColor,
}: CoreProps) {
  const [incorrectAnswer, setIncorrectAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showNextQuestionButton, setShowNextQuestionButton] = useState(false);
  const [endQuiz, setEndQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [buttons, setButtons] = useState<ButtonState>({});
  const [correct, setCorrect] = useState<number[]>([]);
  const [incorrect, setIncorrect] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<(number | number[] | undefined)[]>([]);
  const [filteredValue, setFilteredValue] = useState('all');
  const [userAttempt, setUserAttempt] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(timer);
  const [isRunning, setIsRunning] = useState(true);
  const hasCompletedRef = useRef(false);

  const showDefaultResultState = showDefaultResult ?? true;
  const activeQuestion = questions[currentQuestionIndex];
  const answerSelectionType = activeQuestion?.answerSelectionType || 'single';
  const activeUserAnswer = userInput[currentQuestionIndex];

  const unanswered = useMemo(
    () => questions.reduce<number[]>((acc, _, index) => (
      isAnswered(userInput[index]) ? acc : [...acc, index]
    ), []),
    [questions, userInput],
  );

  const { totalPoints, correctPoints } = useMemo(
    () => questions.reduce(
      (points, question, index) => {
        const point = getPoint(question);
        return {
          totalPoints: points.totalPoints + point,
          correctPoints: correct.includes(index)
            ? points.correctPoints + point
            : points.correctPoints,
        };
      },
      { totalPoints: 0, correctPoints: 0 },
    ),
    [correct, questions],
  );

  const questionSummary: QuestionSummary = useMemo(
    () => ({
      numberOfQuestions: questions.length,
      numberOfCorrectAnswers: correct.length,
      numberOfIncorrectAnswers: incorrect.length,
      questions,
      userInput,
      totalPoints,
      correctPoints,
      timeTaken: timer ? timer - (timeRemaining || 0) : 0,
    }),
    [correct.length, correctPoints, incorrect.length, questions, timeRemaining, timer, totalPoints, userInput],
  );

  const completeQuiz = useCallback(() => {
    setIsRunning(false);
    setEndQuiz(true);
  }, []);

  useEffect(() => {
    if (!endQuiz) {
      hasCompletedRef.current = false;
      return;
    }

    if (onComplete !== undefined && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete(questionSummary);
    }
  }, [endQuiz, onComplete, questionSummary]);

  useEffect(() => {
    setTimeRemaining(timer);
  }, [timer]);

  useEffect(() => {
    let countdown: NodeJS.Timeout | undefined;

    if (timer && isRunning && !endQuiz && timeRemaining !== undefined && timeRemaining > 0) {
      countdown = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime !== undefined ? prevTime - 1 : 0);
      }, 1000);
    }

    return () => {
      if (timer && countdown) {
        clearInterval(countdown);
      }
    };
  }, [endQuiz, isRunning, timeRemaining, timer]);

  useEffect(() => {
    if (timer && timeRemaining === 0 && isRunning && !endQuiz) {
      completeQuiz();
    }
  }, [completeQuiz, endQuiz, isRunning, timeRemaining, timer]);

  const nextQuestion = (currentQuestionIdx: number) => {
    setIncorrectAnswer(false);
    setIsCorrect(false);
    setShowNextQuestionButton(false);
    setButtons({});

    if (currentQuestionIdx + 1 === questions.length) {
      if (!questions.every((_, index) => isAnswered(userInput[index]))) {
        alert('Quiz is incomplete');
      } else if (allowNavigation) {
        const submitQuiz = confirm('You have finished all the questions. Submit Quiz now?');
        if (submitQuiz) {
          completeQuiz();
        }
      } else {
        completeQuiz();
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIdx + 1);
    }
  };

  const handleChange = (event: { target: { value: string } }) => {
    setFilteredValue(event.target.value);
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
            className={`answerBtn btn ${answerBtnCorrectClassName}${answerBtnIncorrectClassName}`}
          >
            {questionType === 'text' && <span>{answer}</span>}
            {questionType === 'photo' && <img src={answer} alt="answer" />}
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
    let targetQuestions: number[] | undefined;

    if (filteredValue !== 'all') {
      targetQuestions = unanswered;
      if (filteredValue === 'correct') {
        targetQuestions = correct;
      } else if (filteredValue === 'incorrect') {
        targetQuestions = incorrect;
      }
    }

    return questions
      .map((question, index) => ({ question, userInputIndex: userInput[index], index }))
      .filter(({ index }) => targetQuestions === undefined || targetQuestions.includes(index))
      .map(({ question, userInputIndex, index }) => {
        const questionAnswerSelectionType = question.answerSelectionType || 'single';

        return (
          <div className="result-answer-wrapper" key={`result-question-${question.questionIndex ?? index}`}>
            <h3
              dangerouslySetInnerHTML={rawMarkup(
                `Q${question.questionIndex}: ${
                  question.question
                } ${appLocale.marksOfQuestion.replace('<marks>', String(question.point))}`,
              )}
            />
            {question.questionPic && (
              <img src={question.questionPic} alt="question" />
            )}
            {renderTags(
              questionAnswerSelectionType,
              Array.isArray(question.correctAnswer) ? question.correctAnswer.length : 1,
              question.segment,
            )}
            <div className="result-answer">
              {renderAnswerInResult(question, userInputIndex)}
            </div>
            <Explanation question={question} isResultPage />
          </div>
        );
      });
  };

  const renderAnswers = (question: Question, answerButtons: ButtonState) => {
    const {
      answers, correctAnswer, questionType, questionIndex,
    } = question;
    const questionAnswerSelectionType = question.answerSelectionType || 'single';
    const onClickAnswer = (index: number) => checkAnswer(index + 1, correctAnswer, questionAnswerSelectionType, answers, {
      userInput,
      userAttempt,
      currentQuestionIndex,
      continueTillCorrect,
      showNextQuestionButton,
      incorrect,
      correct,
      setButtons,
      setIsCorrect,
      setIncorrectAnswer,
      setCorrect,
      setIncorrect,
      setShowNextQuestionButton,
      setUserInput,
      setUserAttempt,
    });

    const onSelectAnswer = (index: number) => selectAnswer(index + 1, correctAnswer, questionAnswerSelectionType, answers, {
      userInput,
      currentQuestionIndex,
      setButtons,
      setShowNextQuestionButton,
      incorrect,
      correct,
      setCorrect,
      setIncorrect,
      setUserInput,
    });

    const checkSelectedAnswer = (index: number): boolean => {
      if (questionIndex === undefined || userInput[questionIndex - 1] === undefined) {
        return false;
      }
      if (questionAnswerSelectionType === 'single') {
        return userInput[questionIndex - 1] === index;
      }
      return Array.isArray(userInput[questionIndex - 1])
        && (userInput[questionIndex - 1] as number[]).includes(index);
    };

    return answers.map((answer, index) => {
      const answerButton = answerButtons[index];

      return (
        <React.Fragment key={`answer-${question.questionIndex ?? currentQuestionIndex}-${index}`}>
          {answerButton !== undefined
            ? (
              <button
                type="button"
                disabled={answerButton.disabled || false}
                className={`${answerButton.className || ''} answerBtn btn`}
                onClick={() => (revealAnswerOnSubmit ? onSelectAnswer(index) : onClickAnswer(index))}
              >
                {questionType === 'text' && <span>{answer}</span>}
                {questionType === 'photo' && <img src={answer} alt="answer" />}
              </button>
            )
            : (
              <button
                type="button"
                onClick={() => (revealAnswerOnSubmit ? onSelectAnswer(index) : onClickAnswer(index))}
                className={`answerBtn btn ${(allowNavigation && checkSelectedAnswer(index + 1)) ? 'selected' : ''}`}
              >
                {questionType === 'text' && answer}
                {questionType === 'photo' && <img src={answer} alt="answer" />}
              </button>
            )}
        </React.Fragment>
      );
    });
  };

  const renderResult = () => (
    <div className="card-body">
      <h2>
        {appLocale.resultPageHeaderText
          .replace('<correctIndexLength>', String(correct.length))
          .replace('<questionLength>', String(questions.length))}
      </h2>
      <h2>
        {appLocale.resultPagePoint
          .replace('<correctPoints>', String(correctPoints))
          .replace('<totalPoints>', String(totalPoints))}
      </h2>
      <br />
      <QuizResultFilter
        filteredValue={filteredValue}
        handleChange={handleChange}
        appLocale={appLocale}
      />
      {renderQuizResultQuestions()}
    </div>
  );

  const toggleTimer = () => {
    setIsRunning((running) => !running);
  };

  const formatTime = (time: number): string => (time < 10 ? '0' : '');
  const displayTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${formatTime(hours)}${hours}:${formatTime(minutes)}${minutes}:${
      formatTime(seconds)
    }${seconds}`;
  };

  return (
    <div className="questionWrapper">
      {enableProgressBar && (
        <>
          <div style={{ display: 'flex', width: '100%' }}>
            <ProgressBar
              progress={currentQuestionIndex + 1}
              quizLength={questions.length}
              isEndQuiz={endQuiz}
              progressBarColor={progressBarColor}
            />
          </div>
          <br />
        </>
      )}
      {timer && !isRunning && (
        <div>
          {appLocale.timerTimeTaken}
          :
          {' '}
          <b>{displayTime(timer - (timeRemaining || 0))}</b>
        </div>
      )}

      {timer && isRunning && (
        <div>
          {appLocale.timerTimeRemaining}
          :
          {' '}
          <b>
            {displayTime(timeRemaining || 0)}
          </b>
        </div>
      )}

      {!endQuiz && (
        <div className="questionWrapperBody">
          <div>
            {`${appLocale.question} ${currentQuestionIndex + 1} / ${
              questions.length
            }:`}
            <br />
            {timer && allowPauseTimer && (
              <button type="button" className="timerBtn" onClick={toggleTimer}>
                {isRunning ? appLocale.pauseScreenPause : appLocale.pauseScreenResume}
              </button>
            )}
          </div>
          {isRunning ? (
            <>
              <h3
                dangerouslySetInnerHTML={rawMarkup(
                  `${
                    activeQuestion && activeQuestion.question
                  } ${appLocale.marksOfQuestion.replace(
                    '<marks>',
                    String(activeQuestion?.point),
                  )}`,
                )}
              />
              {activeQuestion && activeQuestion.questionPic && (
                <img src={activeQuestion.questionPic} alt="question" />
              )}
              {activeQuestion
                && renderTags(
                  answerSelectionType,
                  Array.isArray(activeQuestion.correctAnswer) ? activeQuestion.correctAnswer.length : 1,
                  activeQuestion.segment,
                )}
              <div className="questionModal">
                <InstantFeedback
                  question={activeQuestion}
                  showInstantFeedback={showInstantFeedback}
                  correctAnswer={isCorrect}
                  incorrectAnswer={incorrectAnswer}
                  onQuestionSubmit={onQuestionSubmit}
                  userAnswer={activeUserAnswer}
                />
              </div>
              {activeQuestion && renderAnswers(activeQuestion, buttons)}
              {(showNextQuestionButton || allowNavigation) && (
                <div className="questionBtnContainer">
                  {allowNavigation && currentQuestionIndex > 0 && (
                    <button
                      onClick={() => nextQuestion(currentQuestionIndex - 2)}
                      className="prevQuestionBtn btn"
                      type="button"
                    >
                      {appLocale.prevQuestionBtn}
                    </button>
                  )}

                  <button
                    onClick={() => nextQuestion(currentQuestionIndex)}
                    className="nextQuestionBtn btn"
                    type="button"
                  >
                    {appLocale.nextQuestionBtn}
                  </button>
                </div>
              )}
            </>
          ) : (
            <span className="timerPauseScreen dark:text-white text-black">
              <br />
              <br />
              {appLocale.pauseScreenDisplay}
            </span>
          )}
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
