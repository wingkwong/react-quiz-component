import React, { Component } from 'react';

class Answer extends Component {
  constructor(props){
    super(props);
    this.state = {

    }
  }


  render() {
    const {answers, questionType} = this.props;
    const renderAnswer = 
      answers.map((answer, index)=>{
        return (
          questionType=='text' && (<li key={index} data-value={answer} onClick={() => this.props.handleClick(index)}>{answer}</li>) ||
          questionType=='photo' && (<img className="img-answer" src={answer} onClick={() => this.props.handleClick(index)}/>)
        )
      })

    return (
      <div className="answer-container">
          <ul>
            {renderAnswer}
          </ul>
      </div>
    );
  }
}

export default Answer;
