import React, { Component } from 'react';

class Answer extends Component {
  constructor(props){
    super(props);
    this.state = {

    }
  }


  render() {
    const renderAnswer = 
      this.props.answers.map((answer, index)=>{
        return (
          <li key={index} data-value={answer} onClick={() => this.props.handleClick(index)}>
            {answer}
          </li>
        )
      })

    return (
      <div>
          <ul>
            {renderAnswer}
          </ul>
      </div>
    );
  }
}

export default Answer;
