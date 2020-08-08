import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import marked from 'marked';
import dompurify from 'dompurify';

const Core = ({ questions, appLocale, showDefaultResult, onComplete, customResultPage, showInstantFeedback, continueTillCorrect }) => {
  const [incorrectAnswer, setIncorrectAnswer] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState(false)
  const [showNextQuestionButton, setShowNextQuestionButton] = useState(false)
  const [endQuiz, setEndQuiz] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [buttons, setButtons] = useState({})
  const [buttonClasses, setButtonClasses] = useState({})
  const [correct, setCorrect] = useState([])
  const [incorrect, setIncorrect] = useState([])
  const [userInput, setUserInput] = useState([])
  const [filteredValue, setFilteredValue] = useState('all')
  const [userAttempt, setUserAttempt] = useState(1)
  const [showDefaultResultState, setShowDefaultResult] = useState(true)
  const [answerSelectionTypeState, setAnswerSelectionType] = useState(undefined)

  const [totalPoints, setTotalPoints] = useState(0)
  const [correctPoints, setCorrectPoints] = useState(0)
  const [question, setQuestion] = useState(questions[currentQuestionIndex])
  const [questionSummary, setQuestionSummary] = useState(undefined)
  
  useEffect(() => {
    setShowDefaultResult(showDefaultResult !== undefined ? showDefaultResult : true);
  }, [showDefaultResult])
  
  useEffect(() => {
    setQuestion(questions[currentQuestionIndex]);
  }, [currentQuestionIndex])

  useEffect(() => {
    let { answerSelectionType } = question;
    // Default single to avoid code breaking due to automatic version upgrade
    setAnswerSelectionType(answerSelectionType || 'single');
  }, [question, currentQuestionIndex])

  useEffect(() => {
    if (endQuiz) { 
      let totalPointsTemp = 0;
      let correctPointsTemp = 0;
      for (var i = 0; i < questions.length; i++) {
        let point = questions[i].point || 0;
        if(typeof point === 'string' || point instanceof String) {
          point = parseInt(point)
        }
        
        totalPointsTemp = totalPointsTemp + point
        
        if(correct.includes(i)) {
          correctPointsTemp = correctPointsTemp + point
        }
      }
      setTotalPoints(totalPointsTemp);
      setCorrectPoints(correctPointsTemp);
    }
  }, [endQuiz])
  
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
  }, [totalPoints, correctPoints])

  useEffect(() => {
    if (endQuiz && onComplete !== undefined && questionSummary !== undefined) {
      onComplete(questionSummary)
    }
  }, [endQuiz, questionSummary])

  useEffect(() => {
    if(endQuiz && !showDefaultResultState && customResultPage !== undefined && questionSummary !== undefined) {
      customResultPage(questionSummary)
    }
  }, [endQuiz, questionSummary])

  const checkAnswer = (index, correctAnswer, answerSelectionType) => {
    if(answerSelectionType == 'single') {
      if(userInput[currentQuestionIndex] == undefined) {
        userInput.push(index)
      }
  
      if(index == correctAnswer) {
        if( incorrect.indexOf(currentQuestionIndex) < 0 && correct.indexOf(currentQuestionIndex) < 0) {
          correct.push(currentQuestionIndex);
        }

        let disabledAll = {
          0: {disabled: true},
          1: {disabled: true},
          2: {disabled: true},
          3: {disabled: true}
        }
  
        setButtons((prevState) => ({ ...prevState,
            ...disabledAll,
            [index-1]: {
              className: (index == correctAnswer) ? "correct" : "incorrect"
            },
          })
        )

        setCorrectAnswer(true)
        setIncorrectAnswer(false)
        setCorrect(correct)
        setShowNextQuestionButton(true)

      } else {
        if( correct.indexOf(currentQuestionIndex) < 0 && incorrect.indexOf(currentQuestionIndex) < 0 ) {
          incorrect.push(currentQuestionIndex)
        }
  
        if(continueTillCorrect) {
          setButtons((prevState) => (
            Object.assign(
              {},
              prevState,
              {
                [index-1]: {
                  disabled: !prevState[index-1]
                }
              }
            )
          ))
        } else {
          let disabledAll = {
            0: {disabled: true},
            1: {disabled: true},
            2: {disabled: true},
            3: {disabled: true}
          }
  
          setButtons((prevState) => (
            Object.assign(
              {},
              prevState,
              {
                ...disabledAll,
                [index-1]: {
                  className: (index == correctAnswer) ? "correct" : "incorrect"
                },
              }
            )
          ))

          setShowNextQuestionButton(true)
        }
  
        setIncorrectAnswer(true)
        setCorrectAnswer(false)
        setIncorrect(incorrect)
      }
    } else {
      
      let maxNumberOfMultipleSelection = correctAnswer.length;

      if(userInput[currentQuestionIndex] == undefined) {
        userInput[currentQuestionIndex] = []
      }
      
      if(userInput[currentQuestionIndex].length < maxNumberOfMultipleSelection) {
        userInput[currentQuestionIndex].push(index)

        if(correctAnswer.includes(index)) {
          if(userInput[currentQuestionIndex].length <= maxNumberOfMultipleSelection)  {
          
            setButtons((prevState) => ({ ...prevState,
                [index-1]: {
                  disabled: !prevState[index-1],
                  className: (correctAnswer.includes(index)) ? "correct" : "incorrect"
                },
              })
            )
          }
        } else {
          if(userInput[currentQuestionIndex].length <= maxNumberOfMultipleSelection)  { 
            setButtons((prevState) => ({ ...prevState, 
                [index-1]: {
                  className: (correctAnswer.includes(index)) ? "correct" : "incorrect"
                },
              })
            )
          }
        }
      }

      if(maxNumberOfMultipleSelection == userAttempt) {
        let cnt = 0;
        for(var i = 0; i < correctAnswer.length; i++) {
          if(userInput[currentQuestionIndex].includes(correctAnswer[i])) {
            cnt++;
          }
        }

        if(cnt === maxNumberOfMultipleSelection) {
          correct.push(currentQuestionIndex);
          
          setCorrectAnswer(true)
          setIncorrectAnswer(false)
          setCorrect(correct)
          setShowNextQuestionButton(true)
          setUserAttempt(1)
        } else {
          incorrect.push(currentQuestionIndex)
          
          setIncorrectAnswer(true)
          setCorrectAnswer(false)
          setIncorrect(incorrect)
          setShowNextQuestionButton(true)
          setUserAttempt(1)
        }
      } else {
        if(!showNextQuestionButton) {
          setUserInput(userInput)
          setUserAttempt(userAttempt + 1)
        }
      }
    }
  }

  const nextQuestion = (currentQuestionIndex) => {

    setIncorrectAnswer(false)
    setCorrectAnswer(false)
    setShowNextQuestionButton(false)
    setButtons({})

    if(currentQuestionIndex + 1 == questions.length) {
      setEndQuiz(true)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const renderMessageforCorrectAnswer = (question) => {
    const defaultMessage = 'You are correct. Please click Next to continue.';
    return question.messageForCorrectAnswer || defaultMessage;
  }

  const renderMessageforIncorrectAnswer = (question) => {
    const defaultMessage = 'Incorrect answer. Please try again.';
    return question.messageForIncorrectAnswer || defaultMessage;
  }

  const renderExplanation = (question, isResultPage) => {
    const explanation = question.explanation;
    if(!explanation) {
      return (null);
    }
    
    if(isResultPage) {
      return (
        <div className="explanation">
          {explanation}
        </div>
      )
    }

    return (
      <div>
        <br/>
        {explanation}
      </div>
    )
  }

  const handleChange = (event) => {
    setFilteredValue(event.target.value)
  }

  const renderQuizResultFilter = () => (
    <div className="quiz-result-filter">
      <select value={filteredValue} onChange={handleChange}>
        <option value="all">{appLocale.resultFilterAll}</option>
        <option value="correct">{appLocale.resultFilterCorrect}</option>
        <option value="incorrect">{appLocale.resultFilterIncorrect}</option>
      </select>
    </div>
  );

  const renderAnswerInResult = (question, userInputIndex) => {
    const { answers, correctAnswer, questionType } = question;
    let { answerSelectionType } = question;
    let answerBtnCorrectClassName;
    let answerBtnIncorrectClassName;
    
    // Default single to avoid code breaking due to automatic version upgrade
    answerSelectionType = answerSelectionType || 'single';
    
    return answers.map((answer, index) => {
      if(answerSelectionType == 'single') {
        answerBtnCorrectClassName = ( index+1 == correctAnswer ? 'correct': '' )
        answerBtnIncorrectClassName = (userInputIndex != correctAnswer && index + 1 == userInputIndex ? 'incorrect' : '')
      } else {
        answerBtnCorrectClassName = ( correctAnswer.includes(index + 1)  ? 'correct': '' )
        answerBtnIncorrectClassName = ( !correctAnswer.includes(index + 1) && userInputIndex.includes(index + 1) ? 'incorrect' : '')
      }

      return(
        <div key={index}>
           <button disabled={true} className={"answerBtn btn " + answerBtnCorrectClassName + answerBtnIncorrectClassName}>
            { questionType == 'text' && <span>{ answer }</span> }
            { questionType == 'photo' && <img src={ answer } /> }
          </button>
        </div>
      )
    });
  }

  const renderQuizResultQuestions = useCallback(() => {
    let filteredQuestions;
    let filteredUserInput;

    if(filteredValue !== 'all') {
      if (filteredValue === 'correct') {
        filteredQuestions = questions.filter((question, index) => correct.indexOf(index) != -1)
        filteredUserInput = userInput.filter((input, index) => correct.indexOf(index) != -1)
      } else {
        filteredQuestions = questions.filter((question, index) => incorrect.indexOf(index) != -1)
        filteredUserInput = userInput.filter((input, index) => incorrect.indexOf(index) != -1)
      }
    }

    return (filteredQuestions ? filteredQuestions : questions).map((question, index) => {
      const userInputIndex = filteredUserInput ? filteredUserInput[index] : userInput[index];

      // Default single to avoid code breaking due to automatic version upgrade
      let answerSelectionType = question.answerSelectionType || 'single';
      
      return (
        <div className="result-answer-wrapper" key={index+1}>
          <h3 dangerouslySetInnerHTML={ rawMarkup(`Q${question.questionIndex}: ${question.question}`) }/> 
          {question.questionPic && <img src={question.questionPic}/>}
          {renderTags(answerSelectionType, question.correctAnswer.length)}
          <div className="result-answer">
            {renderAnswerInResult(question, userInputIndex)}
          </div>
          {renderExplanation(question, true)}
        </div>
      )
    })
  }, [endQuiz, filteredValue])

  const rawMarkup = (data) => {
    const sanitizer = dompurify.sanitize;
    let rawMarkup = marked(sanitizer(data));
    return { __html: rawMarkup };
  }

  const renderAnswers = (question, buttons) => {
    const { answers, correctAnswer, questionType } = question;
    let { answerSelectionType } = question;
    
    // Default single to avoid code breaking due to automatic version upgrade
    answerSelectionType = answerSelectionType || 'single';

    return answers.map( (answer, index) => {
      if(buttons[index] != undefined) {
        return (
          <button 
            key={index} 
            disabled={buttons[index].disabled || false} 
            className={`${buttons[index].className} answerBtn btn`} 
            onClick={() => checkAnswer(index+1, correctAnswer, answerSelectionType)}
          >
            {questionType == 'text' && <span>{answer}</span>}
            {questionType == 'photo' && <img src={answer} />}
          </button>
        )
      } else {
        return (
          <button 
            key={index} 
            onClick={() => checkAnswer(index+1, correctAnswer, answerSelectionType)} 
            className="answerBtn btn"
          >
          {questionType == 'text' && answer}
          {questionType == 'photo' && <img src={answer}/>}
          </button>
        )
      }
    })
  }

  const renderTags = (answerSelectionType, numberOfSelection) => {
    const { 
      singleSelectionTagText,
      multipleSelectionTagText,
      pickNumberOfSelection
    } = appLocale;

    return (
      <div className="tag-container">
        {answerSelectionType === 'single' && <span className="single selection-tag">{singleSelectionTagText}</span>}
        {answerSelectionType === 'multiple' && <span className="multiple selection-tag">{multipleSelectionTagText}</span>}
        <span className="number-of-selection">{pickNumberOfSelection.replace("<numberOfSelection>", numberOfSelection)}</span>
      </div>
    )
  }
    
  const renderResult = () => (
    <div className="card-body">
      <h2>
        {appLocale.resultPageHeaderText.replace("<correctIndexLength>", correct.length).replace("<questionLength>", questions.length)}
      </h2>
      <h2>
        {appLocale.resultPagePoint.replace("<correctPoints>", correctPoints).replace("<totalPoints>", totalPoints)}
      </h2>
      <br />
      {renderQuizResultFilter()}
      {renderQuizResultQuestions()}
    </div>
  )

  return (
    <div className="questionWrapper">
      {!endQuiz &&
        <div className="questionWrapperBody">
          <div className="questionModal">
            {incorrectAnswer && showInstantFeedback && 
              <div className="alert incorrect">{renderMessageforIncorrectAnswer(question)}</div>
            }
            {correctAnswer && showInstantFeedback && 
              <div className="alert correct">
                { renderMessageforCorrectAnswer(question) } 
                { renderExplanation(question, false) }
              </div>
            }
          </div>
          <div>{appLocale.question} {currentQuestionIndex + 1}:</div>
          <h3 dangerouslySetInnerHTML={rawMarkup(question && question.question)}/> 
          {question && question.questionPic && <img src={question.questionPic}/>}
          {question && renderTags(answerSelectionTypeState, question.correctAnswer.length)}
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
    </div>
  );
}

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
