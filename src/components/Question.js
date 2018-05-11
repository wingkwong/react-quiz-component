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
      <div>
        {currentQuestion.question}
      </div>
    );
  }
}

export default Question;
