import React, { Component } from 'react';

class Question extends Component {
  constructor(props){
    super(props);
    this.state = {

    }
  }



  render() {
    const {currentQuestion} = this.props;
    return (
      <div className="question-title">
        {currentQuestion.question}
      </div>
    );
  }
}

export default Question;
