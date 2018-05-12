import React, { Component } from 'react';

class Result extends Component {
  constructor(props){
    super(props);
    this.state = {
      score : 0
    }
  }

  componentDidMount(){
    const {score} = this.state;
    const {correctAns, answers} = this.props;
    let tmpScore = score;
    answers.map((answer,index)=>{
        let score = this
        if(answer == correctAns[index]){
          tmpScore = tmpScore + 1;
        }
    })
    this.setState({
      score: tmpScore
    })
  }

  render() {
    const {score} = this.state;

    const renderResult =
          <div>
            Your score: {score}
          </div>
        

    return (
      <div className="">
          {renderResult}
      </div>
    );
  }
}

export default Result;
