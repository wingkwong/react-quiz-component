import React from "react";

// core components
import InstantFeedback from "./InstantFeedback";

export default function Question(props) {
  return (
    <div>
      <div className="questionWrapper">
        {!props.endQuiz && (
          <div className="questionWrapperBody">
            <div className="questionModal">
              <InstantFeedback
                question={props.question}
                showInstantFeedback={props.showInstantFeedback}
                correctAnswer={props.correctAnswer}
                incorrectAnswer={props.incorrectAnswer}
                onQuestionSubmit={props.onQuestionSubmit}
                userAnswer={props.userAnswer}
              />
            </div>
            <div>
              {props.appLocale.question} {props.currentQuestionIndex + 1}:
            </div>
            <h3
              dangerouslySetInnerHTML={props.rawMarkup(
                `${
                  props.question && props.question.question
                } ${props.appLocale.marksOfQuestion.replace(
                  "<marks>",
                  props.question.point
                )}`
              )}
            />

            {props.question && props.question.questionPic && (
              <img src={props.question.questionPic} alt="image" />
            )}
            {props.question &&
              props.renderTags(
                props.answerSelectionTypeState,
                props.question.correctAnswer.length,
                props.question.segment
              )}
            {props.question &&
              props.renderAnswers(props.question, props.buttons)}
          </div>
        )}
        {props.endQuiz &&
          showDefaultResultState &&
          customResultPage === undefined &&
          renderResult()}
        {props.endQuiz &&
          !showDefaultResultState &&
          customResultPage !== undefined &&
          customResultPage(questionSummary)}
      </div>
    </div>
  );
}
