import React, {
  useState, useEffect, useCallback, Fragment,
} from 'react';
import { nanoid } from 'nanoid';
import ProgressBar from './core-components/ProgressBar';
import QuizResultFilter from './core-components/QuizResultFilter';
import { checkAnswer, selectAnswer, rawMarkup } from './core-components/helpers';
import InstantFeedback from './core-components/InstantFeedback';
import Explanation from './core-components/Explanation';
import { CoreProps, Question, ButtonState, QuestionSummary } from './types';

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
  const [unanswered, setUnanswered] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<(number | number[] | undefined)[]>([]);
  const [filteredValue, setFilteredValue] = useState('all');
  const [userAttempt, setUserAttempt] = useState(1);
  const [showDefaultResultState, setShowDefaultResult] = useState(true);
  const [answerSelectionTypeState, setAnswerSelectionType] = useState<'single' | 'multiple' | undefined>(undefined);

  const [totalPoints, setTotalPoints] = useState(0);
  const [correctPoints, setCorrectPoints] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState<Question>(questions[currentQuestionIndex]);
  const [questionSummary, setQuestionSummary] = useState<QuestionSummary | undefined>(undefined);
  const [timeRemaining, setTimeRemaining] = useState(timer);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setShowDefaultResult(showDefaultResult !== undefined ? showDefaultResult : true);
  }, [showDefaultResult]);

  useEffect(() => {
    setActiveQuestion(questions[currentQuestionIndex]);
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    const { answerSelectionType } = activeQuestion;
    // Default single to avoid code breaking due to automatic version upgrade
    setAnswerSelectionType(answerSelectionType || 'single');
  }, [activeQuestion, currentQuestionIndex]);

  useEffect(() => {
    if (endQuiz) {
      setIsRunning(false);
      let totalPointsTemp = 0;
      let correctPointsTemp = 0;
      for (let i = 0; i < questions.length; i += 1) {
        let point = questions[i].point || 0;
        if (typeof point === 'string') {
          point = parseInt(point, 10);
        }

        totalPointsTemp += Number(point);

        if (correct.includes(i)) {
          correctPointsTemp += Number(point);
        }
      }
      setTotalPoints(totalPointsTemp);
      setCorrectPoints(correctPointsTemp);
    }
  }, [endQuiz]);

  useEffect(() => {
    setQuestionSummary({
      numberOfQuestions: questions.length,
      numberOfCorrectAnswers: correct.length,
      numberOfIncorrectAnswers: incorrect.length,
      questions,
      userInput,
      totalPoints,
      correctPoints,
      timeTaken: timer ? timer - (timeRemaining || 0) : 0,
    });
  }, [totalPoints, correctPoints]);

  useEffect(() => {
    if (endQuiz && onComplete !== undefined && questionSummary !== undefined) {
      onComplete(questionSummary);
    }
  }, [questionSummary]);

  const nextQuestion = (currentQuestionIdx: number) => {
    setIncorrectAnswer(false);
    setIsCorrect(false);
    setShowNextQuestionButton(false);
    setButtons({});

    if (currentQuestionIdx + 1 === questions.length) {
      if (userInput.length !== questions.length) {
        alert('Quiz is incomplete');
      } else if (allowNavigation) {
        const submitQuiz = confirm('You have finished all the questions. Submit Quiz now?');
        if (submitQuiz) {
          setEndQuiz(true);
        }
      } else {
        setEndQuiz(true);
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
    let { answerSelectionType } = question;
    let answerBtnCorrectClassName: string;
    let answerBtnIncorrectClassName: string;

    // Default single to avoid code breaking due to automatic version upgrade
    answerSelectionType = answerSelectionType || 'single';

    return answers.map((answer, index) => {
      if (answerSelectionType === 'single') {
        // correctAnswer - is string
        answerBtnCorrectClassName = `${index + 1}` === correctAnswer ? 'correct' : '';
        answerBtnIncorrectClassName = `${userInputIndex}` !== correctAnswer
        && `${index + 1}` === `${userInputIndex}` ? 'incorrect' : '';

        if (userInputIndex === undefined && `${index + 1}` !== correctAnswer) {
          answerBtnIncorrectClassName = 'unanswered';
        }
      } else {
        // correctAnswer - is array of numbers
        const correctAnswerArray = correctAnswer as number[];
        answerBtnCorrectClassName = correctAnswerArray.includes(index + 1)
          ? 'correct'
          : '';
        answerBtnIncorrectClassName = !correctAnswerArray.includes(index + 1)
        && Array.isArray(userInputIndex) && userInputIndex?.includes(index + 1) ? 'incorrect' : '';

        if (userInputIndex === undefined && !correctAnswerArray.includes(index + 1)) {
          answerBtnIncorrectClassName = 'unanswered';
        }
      }

      return (
        <div key={nanoid()}>
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

  const renderTags = (answerSelectionType: 'single' | 'multiple', numberOfSelection: number, segment?: string) => {
    const {
      singleSelectionTagText,
      multipleSelectionTagText,
      pickNumberOfSelection,
    } = appLocale;

    return (
      <div className="tag-container">
        {answerSelectionType === 'single'
          && <span className="single selection-tag">{singleSelectionTagText}</span>}
        {answerSelectionType === 'multiple'
          && <span className="multiple selection-tag">{multipleSelectionTagText}</span>}
        <span className="number-of-selection">
          {pickNumberOfSelection.replace('<numberOfSelection>', String(numberOfSelection))}
        </span>
        {segment && <span className="selection-tag segment">{segment}</span>}
      </div>
    );
  };

  const renderQuizResultQuestions = useCallback(() => {
    let filteredQuestions: Question[];
    let filteredUserInput: (number | number[] | undefined)[];

    if (filteredValue !== 'all') {
      let targetQuestions = unanswered;
      if (filteredValue === 'correct') {
        targetQuestions = correct;
      } else if (filteredValue === 'incorrect') {
        targetQuestions = incorrect;
      }
      filteredQuestions = questions.filter(
        (_, index) => targetQuestions.indexOf(index) !== -1,
      );
      filteredUserInput = userInput.filter(
        (_, index) => targetQuestions.indexOf(index) !== -1,
      );
    } else {
      filteredQuestions = questions;
      filteredUserInput = userInput;
    }

    return filteredQuestions.map((question, index) => {
      const userInputIndex = filteredUserInput[index];

      // Default single to avoid code breaking due to automatic version upgrade
      const answerSelectionType = question.answerSelectionType || 'single';

      return (
        <div className="result-answer-wrapper" key={nanoid()}>
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
            answerSelectionType,
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
  }, [endQuiz, filteredValue]);

  const renderAnswers = (question: Question, answerButtons: ButtonState) => {
    const {
      answers, correctAnswer, questionType, questionIndex,
    } = question;
    let { answerSelectionType } = question;
    const onClickAnswer = (index: number) => checkAnswer(index + 1, correctAnswer, answerSelectionType, answers, {
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

    const onSelectAnswer = (index: number) => selectAnswer(index + 1, correctAnswer, answerSelectionType, answers, {
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
      if (answerSelectionType === 'single') {
        return userInput[questionIndex - 1] === index;
      }
      return Array.isArray(userInput[questionIndex - 1]) && (userInput[questionIndex - 1] as number[]).includes(index);
    };

    // Default single to avoid code breaking due to automatic version upgrade
    answerSelectionType = answerSelectionType || 'single';

    return answers.map((answer, index) => (
      <Fragment key={nanoid()}>
        {(answerButtons[index] !== undefined)
          ? (
            <button
              type="button"
              disabled={answerButtons[index].disabled || false}
              className={`${answerButtons[index].className || ''} answerBtn btn`}
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
      </Fragment>
    ));
  };

  const getUnansweredQuestions = () => {
    questions.forEach((question, index) => {
      if (userInput[index] === undefined) {
        setUnanswered((oldArray) => [...oldArray, index]);
      }
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

  useEffect(() => {
    let countdown: NodeJS.Timeout | undefined;

    if (timer && isRunning && timeRemaining !== undefined && timeRemaining > 0) {
      countdown = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime !== undefined ? prevTime - 1 : 0);
      }, 1000);
    }
    return () => {
      if (timer && countdown) {
        clearInterval(countdown);
      }
    };
  }, [isRunning, timeRemaining, timer]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
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

  const handleTimeUp = () => {
    setIsRunning(false);
    setEndQuiz(true);
    getUnansweredQuestions();
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
      {timer && timeRemaining === 0 && isRunning && (() => { handleTimeUp(); return null; })()}

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
                    String(activeQuestion.point),
                  )}`,
                )}
              />
              {activeQuestion && activeQuestion.questionPic && (
                <img src={activeQuestion.questionPic} alt="question" />
              )}
              {activeQuestion
                && renderTags(
                  answerSelectionTypeState || 'single',
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
                  userAnswer={[...userInput].pop()}
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
          && customResultPage(questionSummary!)}
    </div>
  );
}

export default Core;
