import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Core from './Core';
import { defaultLocale } from './Locale';
import "./styles.css";

class Quiz extends Component {
  constructor(props){
    super(props);
    this.state = {
      start: false,
    }
    this.start = this.start.bind(this);
  }

  start = () => {
    this.setState({start: true})
  }

  shuffleQuestions = (questions) => {
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    return questions;
  }

  validateQuiz = (quiz) => {
    if(!quiz) {
      console.error("Quiz object is required.");
      return false;
    } 

    const { questions } = quiz;
    if(!questions ) {
      console.error("Field 'questions' is required.");
      return false;
    }

    for(var i=0; i<questions.length; i++) {
      const { question, questionType, answerSelectionType, answers, correctAnswer } = questions[i];
      if(!question) {
        console.error("Field 'question' is required.");
        return false;
      }
  
      if(!questionType) {
        console.error("Field 'questionType' is required.");
        return false;
      } else {
        if(questionType != 'text' && questionType != 'photo') {
          console.error("The value of 'questionType' is either 'text' or 'photo'.");
          return false;
        }
      }
  
      if(!answers) {
        console.error("Field 'answers' is required.");
        return false;
      } else {
        if(!Array.isArray(answers)) {
          console.error("Field 'answers' has to be an Array");
          return false;
        } 
      }
  
      if(!correctAnswer) {
        console.error("Field 'correctAnswer' is required.");
        return false;
      }
  
      if(!answerSelectionType) {
        // Default single to avoid code breaking due to automatic version upgrade
        console.warn("Field answerSelectionType should be defined since v0.3.0. Use single by default.")
        answerSelectionType = answerSelectionType || 'single'; 
      }
  
      if(answerSelectionType == 'single' && !(typeof answerSelectionType === 'string' || answerSelectionType   instanceof String) ) {
        console.error("answerSelectionType is single but expecting String in the field correctAnswer");
        return false;
      }
  
      if(answerSelectionType == 'multiple' && !Array.isArray(correctAnswer)) {
        console.error("answerSelectionType is multiple but expecting Array in the field correctAnswer");
        return false;
      }
    }

    return  true;
  }

  render() {
    const { quiz, shuffle, showDefaultResult, onComplete, customResultPage, showInstantFeedback, continueTillCorrect } = this.props;


    if(!this.validateQuiz(quiz)) {
      return (null)
    }

    const appLocale = {
      ...defaultLocale,
      ...quiz.appLocale
    };
    
    let questions = quiz.questions;
      if(shuffle) {
        questions = this.shuffleQuestions(questions);
      }

      questions = questions.map((question, index) => ({
        ...question, 
        questionIndex : index + 1
      }));

      return (
        <div className="react-quiz-container">
          {!this.state.start &&
            <div>
              <h2>{quiz.quizTitle}</h2>
              <div> {appLocale.landingHeaderText.replace("<questionLength>" , quiz.questions.length )}</div>
              { quiz.quizSynopsis && 
                  <div className="quiz-synopsis">
                      {quiz.quizSynopsis}
                  </div> 
              }
              <div className="startQuizWrapper">
                <button onClick={() => this.start()} className="startQuizBtn btn">{appLocale.startQuizBtn}</button>
              </div>
            </div>
          }

          {
            this.state.start && <Core questions={questions} showDefaultResult={showDefaultResult} onComplete={onComplete} customResultPage={customResultPage} showInstantFeedback={showInstantFeedback} continueTillCorrect={continueTillCorrect} appLocale={appLocale}/>
          }
        </div>
      );
    }
}

Quiz.propTypes = {
  quiz: PropTypes.object,
  shuffle: PropTypes.bool,
  showDefaultResult: PropTypes.bool,
  onComplete: PropTypes.func,
  customResultPage: PropTypes.func,
  showInstantFeedback: PropTypes.bool,
  continueTillCorrect: PropTypes.bool
};

export default Quiz;
