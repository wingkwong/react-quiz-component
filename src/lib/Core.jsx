import React, {useState, useEffect, useCallback, Fragment} from 'react';
import PropTypes from 'prop-types';
import QuizResultFilter from "./core-components/QuizResultFilter";
import {checkAnswer, rawMarkup} from "./core-components/helpers";
import InstantFeedback from "./core-components/InstantFeedback";
import Explanation from "./core-components/Explanation";

const Core = ({questions, appLocale, showDefaultResult, onComplete, customResultPage, showInstantFeedback, continueTillCorrect}) => {
  const [incorrectAnswer, setIncorrectAnswer] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(false);
  const [showNextQuestionButton, setShowNextQuestionButton] = useState(false);
  const [endQuiz, setEndQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [buttons, setButtons] = useState({});
  const [buttonClasses, setButtonClasses] = useState({});
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
    let {answerSelectionType} = question;
    // Default single to avoid code breaking due to automatic version upgrade
    setAnswerSelectionType(answerSelectionType || 'single');
  }, [question, currentQuestionIndex]);

  useEffect(() => {
    if (endQuiz) {
      let totalPointsTemp = 0;
      let correctPointsTemp = 0;
      for (let i = 0; i < questions.length; i++) {
        let point = questions[i].point || 0;
        if (typeof point === 'string' || point instanceof String) {
          point = parseInt(point)
        }

        totalPointsTemp = totalPointsTemp + point;

        if (correct.includes(i)) {
          correctPointsTemp = correctPointsTemp + point
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
      questions: questions,
      userInput: userInput,
      totalPoints: totalPoints,
      correctPoints: correctPoints
    })
  }, [totalPoints, correctPoints]);

  useEffect(() => {
    if (endQuiz && onComplete !== undefined && questionSummary !== undefined) {
      onComplete(questionSummary)
    }
  }, [endQuiz, questionSummary]);

  const nextQuestion = (currentQuestionIndex) => {
    setIncorrectAnswer(false);
    setCorrectAnswer(false);
    setShowNextQuestionButton(false);
    setButtons({});

    if (currentQuestionIndex + 1 === questions.length) {
      setEndQuiz(true)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  };

  const handleChange = (event) => {
    setFilteredValue(event.target.value)
  };

  const renderAnswerInResult = (question, userInputIndex) => {
    const {answers, correctAnswer, questionType} = question;
    let {answerSelectionType} = question;
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
        answerBtnIncorrectClassName = (!correctAnswer.includes(index + 1) && userInputIndex.includes(index + 1) ? 'incorrect' : '')
      }

      return (
          <div key={index}>
            <button disabled={true}
                    className={"answerBtn btn " + answerBtnCorrectClassName + answerBtnIncorrectClassName}>
              {questionType === 'text' && <span>{answer}</span>}
              {questionType === 'photo' && <img src={answer} alt="image"/>}
            </button>
          </div>
      )
    });
  };

  const renderQuizResultQuestions = useCallback(() => {
    let filteredQuestions;
    let filteredUserInput;

    if (filteredValue !== 'all') {
      if (filteredValue === 'correct') {
        filteredQuestions = questions.filter((question, index) => correct.indexOf(index) !== -1);
        filteredUserInput = userInput.filter((input, index) => correct.indexOf(index) !== -1)
      } else {
        filteredQuestions = questions.filter((question, index) => incorrect.indexOf(index) !== -1);
        filteredUserInput = userInput.filter((input, index) => incorrect.indexOf(index) !== -1)
      }
    }

    return (filteredQuestions ? filteredQuestions : questions).map((question, index) => {
      const userInputIndex = filteredUserInput ? filteredUserInput[index] : userInput[index];

      // Default single to avoid code breaking due to automatic version upgrade
      let answerSelectionType = question.answerSelectionType || 'single';

      return (
          <div className="result-answer-wrapper" key={index + 1}>
            <h3 dangerouslySetInnerHTML={rawMarkup(`Q${question.questionIndex}: ${question.question}`)}/>
            {question.questionPic && <img src={question.questionPic} alt="image"/>}
            {renderTags(answerSelectionType, question.correctAnswer.length, question.segment)}
            <div className="result-answer">
              {renderAnswerInResult(question, userInputIndex)}
            </div>
            <Explanation question={question} isResultPage={true}/>
          </div>
      )
    })
  }, [endQuiz, filteredValue]);

  const renderAnswers = (question, buttons) => {
    const {answers, correctAnswer, questionType} = question;
    let {answerSelectionType} = question;
    const onClickAnswer = index => checkAnswer(index + 1, correctAnswer, answerSelectionType, {
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
      setUserAttempt
    });

    // Default single to avoid code breaking due to automatic version upgrade
    answerSelectionType = answerSelectionType || 'single';

    return answers.map((answer, index) =>
      <Fragment key={index}>
            {(buttons[index] !== undefined)
                ? (<button
                    disabled={buttons[index].disabled || false}
                    className={`${buttons[index].className} answerBtn btn`}
                    onClick={() => onClickAnswer(index)}
                >
                  {questionType === 'text' && <span>{answer}</span>}
                  {questionType === 'photo' && <img src={answer} alt="image"/>}
                </button>)
                : <button
                    onClick={() => onClickAnswer(index)}
                    className="answerBtn btn"
                >
                  {questionType === 'text' && answer}
                  {questionType === 'photo' && <img src={answer} alt="image"/>}
                </button>
            }
          </Fragment>
    )
  };

  const renderTags = (answerSelectionType, numberOfSelection, segment) => {
    const {
      singleSelectionTagText,
      multipleSelectionTagText,
      pickNumberOfSelection
    } = appLocale;

    return (
        <div className="tag-container">
          {answerSelectionType === 'single' &&
          <span className="single selection-tag">{singleSelectionTagText}</span>
          }
          {answerSelectionType === 'multiple' &&
          <span className="multiple selection-tag">{multipleSelectionTagText}</span>}
          <span className="number-of-selection">
            {pickNumberOfSelection.replace("<numberOfSelection>", numberOfSelection)}
          </span>
          {segment && <span className="selection-tag segment">{segment}</span>}
        </div>
    )
  };

  const renderResult = () => (
      <div className="card-body">
        <h2>
          {appLocale.resultPageHeaderText.replace("<correctIndexLength>", correct.length).replace("<questionLength>", questions.length)}
        </h2>
        <h2>
          {appLocale.resultPagePoint.replace("<correctPoints>", correctPoints).replace("<totalPoints>", totalPoints)}
        </h2>
        <br/>
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
        {!endQuiz &&
        <div className="questionWrapperBody">
          <div className="questionModal">
            <InstantFeedback
                question={question}
                showInstantFeedback={showInstantFeedback}
                correctAnswer={correctAnswer}
                incorrectAnswer={incorrectAnswer}
            />
          </div>
          <div>{appLocale.question} {currentQuestionIndex + 1}:</div>
          <h3 dangerouslySetInnerHTML={rawMarkup(question && question.question)}/>
          {question && question.questionPic && <img src={question.questionPic} alt="image"/>}
          {question && renderTags(answerSelectionTypeState, question.correctAnswer.length, question.segment)}
          {question && renderAnswers(question, buttons)}
          {showNextQuestionButton &&
          <div>
            <button onClick={() => nextQuestion(currentQuestionIndex)} className="nextQuestionBtn btn">
              {appLocale.nextQuestionBtn}
            </button>
          </div>
          }
        </div>
        }
        {endQuiz && showDefaultResultState && customResultPage === undefined &&
          renderResult()
        }
        {endQuiz && !showDefaultResultState && customResultPage !== undefined &&
          customResultPage(questionSummary)
        }
      </div>
  );
};

Core.propTypes = {
  questions: PropTypes.array,
  showDefaultResult: PropTypes.bool,
  onComplete: PropTypes.func,
  customResultPage: PropTypes.func,
  showInstantFeedback: PropTypes.bool,
  continueTillCorrect: PropTypes.bool,
  appLocale: PropTypes.object
};

export default Core;
