import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Answer extends Component {
  constructor(props){
    super(props);
    this.state = {

    }
  }

  render() {
    const {userAnswers, answers, questionType, renderInResult, correctAns, qIdx } = this.props;
    const answerKey = ["A", "B", "C", "D"];
    const renderAnswer = 
      answers.map((answer, index)=>{
        return (
          ( questionType=='text' && (<div className="answer-option" key={index} data-value={answer} onClick={() => this.props.handleClick(index)}>{answerKey[(index)]}. {answer}</div>) ) ||
          ( questionType=='photo' && (<img key={index} className="img-answer" alt="" src={answer} onClick={() => this.props.handleClick(index)}/>) )
        )
      })
    const renderAnswerInResult = 
    renderInResult &&
      answers.map((answer, index)=>{
        let c = ""
        if( ((index+1) == correctAns[qIdx]) ){
          c = "correct"
        }else if( ((index+1) == userAnswers[qIdx]) && (correctAns[qIdx] != userAnswers[qIdx]) ){
          c = "user-incorrect"
        }
        return (
          ( questionType=='text' && (<div key={index} data-value={answer} className={`${c} answer-option`}>{answerKey[(index)]}. {answer}</div>) ) ||
          ( questionType=='photo' && (<img key={index} className={`${c} img-answer`} alt="" src={answer}/>) )
        )
      })

    return (
      <div className="answer-container">
         
            {renderInResult == true? (<div className="result-answer">{renderAnswerInResult}</div>) : (<div>{renderAnswer}</div>) }
     
      </div>
    );
  }
}

Answer.propTypes = {
  userAnswers: PropTypes.array,
  answers: PropTypes.array,
  questionType: PropTypes.string,
  renderInResult: PropTypes.bool,
  correctAns: PropTypes.array,
  qIdx: PropTypes.number,
  handleClick: PropTypes.func
};

export default Answer;
