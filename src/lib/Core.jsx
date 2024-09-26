import React, {
  useState, useEffect, useCallback, Fragment,
} from 'react';
import { nanoid } from 'nanoid';
import ProgressBar from './core-components/ProgressBar';
import QuizResultFilter from './core-components/QuizResultFilter';
import { checkAnswer, selectAnswer, rawMarkup } from './core-components/helpers';
import InstantFeedback from './core-components/InstantFeedback';
import Explanation from './core-components/Explanation';

function Core({
  questions, appLocale, showDefaultResult, onComplete, customResultPage,
  showInstantFeedback, continueTillCorrect, revealAnswerOnSubmit, allowNavigation,
  onQuestionSubmit, timer, allowPauseTimer, enableProgressBar, progressBarColor,
}) {
  const [incorrectAnswer, setIncorrectAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showNextQuestionButton, setShowNextQuestionButton] = useState(false);
  const [endQuiz, setEndQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [buttons, setButtons] = useState({});
  const [correct, setCorrect] = useState([]);
  const [incorrect, setIncorrect] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [filteredValue, setFilteredValue] = useState('all');
  const [userAttempt, setUserAttempt] = useState(1);
  const [showDefaultResultState, setShowDefaultResult] = useState(true);
  const [answerSelectionTypeState, setAnswerSelectionType] = useState(undefined);

  const [totalPoints, setTotalPoints] = useState(0);
  const [correctPoints, setCorrectPoints] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(questions[currentQuestionIndex]);
  const [questionSummary, setQuestionSummary] = useState(undefined);
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
        if (typeof point === 'string' || point instanceof String) {
          point = parseInt(point, 10);
        }

        totalPointsTemp += point;

        if (correct.includes(i)) {
          correctPointsTemp += point;
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
      timeTaken: timer - timeRemaining,
    });
  }, [totalPoints, correctPoints]);

  useEffect(() => {
    if (endQuiz && onComplete !== undefined && questionSummary !== undefined) {
      onComplete(questionSummary);
    }
  }, [questionSummary]);

  const nextQuestion = (currentQuestionIdx) => {
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

  const handleChange = (event) => {
    setFilteredValue(event.target.value);
  };

  const renderAnswerInResult = (question, userInputIndex) => {
    const { answers, correctAnswer, questionType } = question;
    let { answerSelectionType } = question;
    let answerBtnCorrectClassName;
    let answerBtnIncorrectClassName;

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
        answerBtnCorrectClassName = correctAnswer.includes(index + 1)
          ? 'correct'
          : '';
        answerBtnIncorrectClassName = !correctAnswer.includes(index + 1)
        && userInputIndex?.includes(index + 1) ? 'incorrect' : '';

        if (userInputIndex === undefined && !correctAnswer.includes(index + 1)) {
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

  const renderTags = (answerSelectionType, numberOfSelection, segment) => {
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
          {pickNumberOfSelection.replace('<numberOfSelection>', numberOfSelection)}
        </span>
        {segment && <span className="selection-tag segment">{segment}</span>}
      </div>
    );
  };

  const renderQuizResultQuestions = useCallback(() => {
    let filteredQuestions;
    let filteredUserInput;

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
    }

    return (filteredQuestions || questions).map((question, index) => {
      const userInputIndex = filteredUserInput
        ? filteredUserInput[index]
        : userInput[index];

      // Default single to avoid code breaking due to automatic version upgrade
      const answerSelectionType = question.answerSelectionType || 'single';

      return (
        <div className="result-answer-wrapper" key={nanoid()}>
          <h3
            dangerouslySetInnerHTML={rawMarkup(
              `Q${question.questionIndex}: ${
                question.question
              } ${appLocale.marksOfQuestion.replace('<marks>', question.point)}`,
            )}
          />
          {question.questionPic && (
            <img src={question.questionPic} alt="question" />
          )}
          {renderTags(
            answerSelectionType,
            question.correctAnswer.length,
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

  const renderAnswers = (question, answerButtons) => {
    const {
      answers, correctAnswer, questionType, questionIndex,
    } = question;
    let { answerSelectionType } = question;
    const onClickAnswer = (index) => checkAnswer(index + 1, correctAnswer, answerSelectionType, answers, {
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

    const onSelectAnswer = (index) => selectAnswer(index + 1, correctAnswer, answerSelectionType, answers, {
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

    const checkSelectedAnswer = (index) => {
      if (userInput[questionIndex - 1] === undefined) {
        return false;
      }
      if (answerSelectionType === 'single') {
        return userInput[questionIndex - 1] === index;
      }
      return Array.isArray(userInput[questionIndex - 1]) && userInput[questionIndex - 1].includes(index);
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
          .replace('<correctIndexLength>', correct.length)
          .replace('<questionLength>', questions.length)}
      </h2>
      <h2>
        {appLocale.resultPagePoint
          .replace('<correctPoints>', correctPoints)
          .replace('<totalPoints>', totalPoints)}
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
    let countdown;

    if (timer && isRunning && timeRemaining > 0) {
      countdown = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => timer && clearInterval(countdown);
  }, [isRunning, timeRemaining, timer]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const formatTime = (time) => (time < 10 ? '0' : '');
  const displayTime = (time) => {
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
          <b>{displayTime(timer - timeRemaining)}</b>
        </div>
      )}

      {timer && isRunning && (
        <div>
          {appLocale.timerTimeRemaining}
          :
          {' '}
          <b>
            {displayTime(timeRemaining)}
          </b>
        </div>
      )}
      {timer && timeRemaining === 0 && isRunning && handleTimeUp()}

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
                    activeQuestion.point,
                  )}`,
                )}
              />
              {activeQuestion && activeQuestion.questionPic && (
                <img src={activeQuestion.questionPic} alt="question" />
              )}
              {activeQuestion
                && renderTags(
                  answerSelectionTypeState,
                  activeQuestion.correctAnswer.length,
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
          && customResultPage(questionSummary)}
    </div>
  );
}

export default Core;
