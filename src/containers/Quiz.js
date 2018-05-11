import React, { Component } from 'react';
import Question from '../components/Question';
import Answer from '../components/Answer';

class Quiz extends Component {
  constructor(props){
  	super(props);
  	let quiz = this.props.quiz;
  	this.state = {
	  step: 0,
      questions: quiz.questions,
      currentQuestion: quiz.questions[0],
      answers: [],
      totalQuestions: quiz.questions.length,
      showResult: false
  	};
  }

   handleClick = (e) =>{
	    const { step, currentQuestion, questions, answers, totalQuestions } = this.state;

	    answers.push(e.target.dataset.value);

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
  	const {title, currentQuestion, answers, totalQuestions, step, showResult} = this.state;


	const renderResult =
		answers.map((answer,index)=>{
			return (
				<div key={index+1}>
					{index+1} : {answer}
				</div>
			)
		})

    return (
      <div>
    		{title}
    		{ showResult==true? (
    			<div>{renderResult}</div>
    		): (
    			<div>
    				<Question currentQuestion={currentQuestion} />
    				<Answer answers={currentQuestion.answers} handleClick={this.handleClick}/>
    			</div>
    		)}

    		
    		
      </div>
    );
  }
}

export default Quiz;
