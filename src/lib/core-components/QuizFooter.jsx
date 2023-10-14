import React from "react";

export default function QuizFooter(props) {
  return (
    <>
      {(props.showNextQuestionButton || props.allowNavigation) && (
        <div className="questionBtnContainer">
          {props.allowNavigation && props.currentQuestionIndex > 0 && (
            <button
              onClick={() => nextQuestion(props.currentQuestionIndex - 2)}
              className="prevQuestionBtn btn"
              type="button"
            >
              {props.appLocale.prevQuestionBtn}
            </button>
          )}
          <button
            onClick={() => nextQuestion(props.currentQuestionIndex)}
            className="nextQuestionBtn btn"
            type="button"
          >
            {props.appLocale.nextQuestionBtn}
          </button>
        </div>
      )}
    </>
  );
}
