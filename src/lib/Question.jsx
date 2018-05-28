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
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">{currentQuestion.question}</h3>
          </div>
        </div>
    );
  }
}


Question.propTypes = {
  currentQuestion: PropTypes.object,
};

export default Question;
