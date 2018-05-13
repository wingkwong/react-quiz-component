import React, { Component } from 'react';

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
          questionType=='text' && (<li key={index} data-value={answer} onClick={() => this.props.handleClick(index)}>{answerKey[(index)]}. {answer}</li>) ||
          questionType=='photo' && (<img key={index} className="img-answer" src={answer} onClick={() => this.props.handleClick(index)}/>)
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
          questionType=='text' && (<li key={index} data-value={answer} className={c}>{answerKey[(index)]}. {answer}</li>) ||
          questionType=='photo' && (<img key={index} className={`${c} img-answer`} src={answer}/>)
        )
      })

    return (
      <div className="answer-container">
          <ul>
            {renderInResult == true? (<div className="result-answer">{renderAnswerInResult}</div>) : (<div>{renderAnswer}</div>) }
          </ul>
      </div>
    );
  }
}

export default Answer;
