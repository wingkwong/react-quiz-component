import React, { Component } from 'react';
import PropTypes from 'prop-types';

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


Question.propTypes = {
  currentQuestion: PropTypes.object,
};

export default Question;
