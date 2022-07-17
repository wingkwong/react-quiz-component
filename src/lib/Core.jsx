import React, {
  useState, useEffect, useCallback, Fragment,
} from 'react';
import QuizResultFilter from './core-components/QuizResultFilter';
import { checkAnswer, selectAnswer, rawMarkup } from './core-components/helpers';
import InstantFeedback from './core-components/InstantFeedback';
import Explanation from './core-components/Explanation';

function Core({
  questions, appLocale, showDefaultResult, onComplete, customResultPage,
  showInstantFeedback, continueTillCorrect, revealAnswerOnSubmit, allowNavigation,
  onQuestionSubmit,
}) {
  const [incorrectAnswer, setIncorrectAnswer] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(false);
  const [showNextQuestionButton, setShowNextQuestionButton] = useState(false);
  const [endQuiz, setEndQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [buttons, setButtons] = useState({});
  const [correct, setCorrect] = useState([]);
  const [incorrect, setIncorrect] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [filteredValue, setFilteredValue] = useState('all');
  const [userAttempt, setUserAttempt] = useState(1);
  const [showDefaultResultState, setShowDefaultResult] = useState(true);
  const [answerSelectionTypeState, setAnswerSelectionType] = useState(undefined);

  const [totalPoints, setTotalPoints] = useState(0);
  const [correctPoints, setCorrectPoints] = useState(0);
  const [question, setQuestion] = useState(questions[currentQuestionIndex]);
  const [questionSummary, setQuestionSummary] = useState(undefined);

  useEffect(() => {
    setShowDefaultResult(showDefaultResult !== undefined ? showDefaultResult : true);
  }, [showDefaultResult]);

  useEffect(() => {
    setQuestion(questions[currentQuestionIndex]);
  }, [currentQuestionIndex]);

  useEffect(() => {
    const { answerSelectionType } = question;
    // Default single to avoid code breaking due to automatic version upgrade
    setAnswerSelectionType(answerSelectionType || 'single');
  }, [question, currentQuestionIndex]);

  useEffect(() => {
    if (endQuiz) {
      let totalPointsTemp = 0;
      let correctPointsTemp = 0;
      for (let i = 0; i < questions.length; i += 1) {
        let point = questions[i].point || 0;
        if (typeof point === 'string' || point instanceof String) {
          point = parseInt(point);
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
    });
  }, [totalPoints, correctPoints]);

  useEffect(() => {
    if (endQuiz && onComplete !== undefined && questionSummary !== undefined) {
      onComplete(questionSummary);
    }
  }, [endQuiz, questionSummary]);

  const nextQuestion = (currentQuestionIdx) => {
    setIncorrectAnswer(false);
    setCorrectAnswer(false);
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
    window.scrollTo(0, 0);
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
        answerBtnCorrectClassName = (`${index + 1}` === correctAnswer ? 'correct' : '');
        answerBtnIncorrectClassName = (`${userInputIndex}` !== correctAnswer && `${index + 1}` === `${userInputIndex}` ? 'incorrect' : '');
      } else {
        // correctAnswer - is array of numbers
        answerBtnCorrectClassName = (correctAnswer.includes(index + 1) ? 'correct' : '');
        answerBtnIncorrectClassName = (!correctAnswer.includes(index + 1) && userInputIndex.includes(index + 1) ? 'incorrect' : '');
      }

      return (
        <div key={index}>
          <button
            disabled
            className={`answerBtn btn ${answerBtnCorrectClassName}${answerBtnIncorrectClassName}`}
          >
            {questionType === 'text' && <span>{answer}</span>}
            {questionType === 'photo' && <img src={answer} alt="image" />}
          </button>
        </div>
      );
    });
  };

  const renderQuizResultQuestions = useCallback(() => {
    let filteredQuestions;
    let filteredUserInput;

    if (filteredValue !== 'all') {
      if (filteredValue === 'correct') {
        filteredQuestions = questions.filter((question, index) => correct.indexOf(index) !== -1);
        filteredUserInput = userInput.filter((input, index) => correct.indexOf(index) !== -1);
      } else {
        filteredQuestions = questions.filter((question, index) => incorrect.indexOf(index) !== -1);
        filteredUserInput = userInput.filter((input, index) => incorrect.indexOf(index) !== -1);
      }
    }

    return (filteredQuestions || questions).map((question, index) => {
      const userInputIndex = filteredUserInput ? filteredUserInput[index] : userInput[index];

      // Default single to avoid code breaking due to automatic version upgrade
      const answerSelectionType = question.answerSelectionType || 'single';

      return (
        <div className="result-answer-wrapper" key={index + 1}>
          <h3 dangerouslySetInnerHTML={rawMarkup(`Q${question.questionIndex}: ${question.question}`)} />
          {question.questionPic && <img src={question.questionPic} alt="image" />}
          {renderTags(answerSelectionType, question.correctAnswer.length, question.segment)}
          <div className="result-answer">
            {renderAnswerInResult(question, userInputIndex)}
          </div>
          <Explanation question={question} isResultPage />
        </div>
      );
    });
  }, [endQuiz, filteredValue]);

  const renderAnswers = (question, buttons) => {
    const {
      answers, correctAnswer, questionType, questionIndex,
    } = question;
    let { answerSelectionType } = question;
    const onClickAnswer = (index) => checkAnswer(index + 1, correctAnswer, answerSelectionType, {
      userInput,
      userAttempt,
      currentQuestionIndex,
      continueTillCorrect,
      showNextQuestionButton,
      incorrect,
      correct,
      setButtons,
      setCorrectAnswer,
      setIncorrectAnswer,
      setCorrect,
      setIncorrect,
      setShowNextQuestionButton,
      setUserInput,
      setUserAttempt,
    });

    const onSelectAnswer = (index) => selectAnswer(index + 1, correctAnswer, answerSelectionType, {
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
      <Fragment key={index}>
        {(buttons[index] !== undefined)
          ? (
            <button
              type="button"
              disabled={buttons[index].disabled || false}
              className={`${buttons[index].className} answerBtn btn`}
              onClick={() => (revealAnswerOnSubmit ? onSelectAnswer(index) : onClickAnswer(index))}
            >
              {questionType === 'text' && <span>{answer}</span>}
              {questionType === 'photo' && <img src={answer} alt="image" />}
            </button>
          )
          : (
            <button
              type="button"
              onClick={() => (revealAnswerOnSubmit ? onSelectAnswer(index) : onClickAnswer(index))}
              className={`answerBtn btn ${(allowNavigation && checkSelectedAnswer(index + 1)) ? 'selected' : null}`}
            >
              {questionType === 'text' && answer}
              {questionType === 'photo' && <img src={answer} alt="image" />}
            </button>
          )}
      </Fragment>
    ));
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
  return (
    <div className="questionWrapper">
      {!endQuiz
        && (
        <div className="questionWrapperBody">
          <div className="questionModal">
            <InstantFeedback
              question={question}
              showInstantFeedback={showInstantFeedback}
              correctAnswer={correctAnswer}
              incorrectAnswer={incorrectAnswer}
              onQuestionSubmit={onQuestionSubmit}
              userAnswer={[...userInput].pop()}
            />
          </div>
          <div>
            {appLocale.question}
            {' '}
            {currentQuestionIndex + 1}
            :
          </div>
          <h3 dangerouslySetInnerHTML={rawMarkup(question && question.question)} />
          {question && question.questionPic && <img src={question.questionPic} alt="image" />}
          {question && renderTags(answerSelectionTypeState, question.correctAnswer.length, question.segment)}
          {question && renderAnswers(question, buttons)}
          {(showNextQuestionButton || allowNavigation)
          && (
          <div className="questionBtnContainer">
            {(allowNavigation && currentQuestionIndex > 0) && (
              <button
                onClick={() => nextQuestion(currentQuestionIndex - 2)}
                className="prevQuestionBtn btn"
                type="button"
              >
                {appLocale.prevQuestionBtn}
              </button>
            )}
            <button onClick={() => nextQuestion(currentQuestionIndex)} className="nextQuestionBtn btn" type="button">
              {appLocale.nextQuestionBtn}
            </button>
          </div>
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
