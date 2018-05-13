import React, { Component } from 'react';
import Question from '../components/Question';
import Answer from '../components/Answer';
import Result from '../components/Result';

class Quiz extends Component {
  constructor(props){
  	super(props);
  	let quiz = this.props.quiz;
  	this.state = {
	  step: 0,
	  title: quiz.quizTitle,
      questions: quiz.questions,
      currentQuestion: quiz.questions[0],
      answers: [],
      correctAns: [],
      totalQuestions: quiz.questions.length,
      showResult: false
  	};
  	this.parseCorrectAnswer();
  }

  parseCorrectAnswer(){
  	const {correctAns, questions} = this.state;
   	questions.map(question=>{
   		correctAns.push(question.correctAnswer);
   	})
  }


   handleClick = (index) =>{
	    const { step, currentQuestion, questions, answers, totalQuestions } = this.state;
	    answers.push((index+1));
	    let updatedStep = step;

	    if(step < totalQuestions - 1){
	       updatedStep = step + 1;
	        this.setState({
	        step: updatedStep,
	        currentQuestion: questions[updatedStep],
	      })
	    }else{
	      this.setState({
	        showResult: true
	      })
	    } 
	 }

  render() {
  	const {title, questions, currentQuestion, answers, correctAns,totalQuestions, step, showResult} = this.state;
    return (
      <div>
    		<h2 className="quiz-title">{title}</h2>
    		{ showResult==true? (
    			<Result questions={questions} answers={answers} correctAns={correctAns}/>
    		): (
    			<div>
    				<Question currentQuestion={currentQuestion} />
    				<Answer questionType={currentQuestion.questionType} answers={currentQuestion.answers} handleClick={this.handleClick} renderInResult={false}/>
    			</div>
    		)}
      </div>
    );
  }
}

export default Quiz;
