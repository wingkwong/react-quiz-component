import React from "react";

const InstantFeedback = ({showInstantFeedback, incorrectAnswer, correctAnswer, question}) => {

    const renderMessageForCorrectAnswer = (question) => {
        const defaultMessage = 'You are correct. Please click Next to continue.';
        return question.messageForCorrectAnswer || defaultMessage;
    };

    const renderMessageForIncorrectAnswer = (question) => {
        const defaultMessage = 'Incorrect answer. Please try again.';
        return question.messageForIncorrectAnswer || defaultMessage;
    };

    const renderExplanation = (question, isResultPage) => {
        const explanation = question.explanation;
        if (!explanation) {
            return null;
        }

        if (isResultPage) {
            return (
                <div className="explanation">
                    {explanation}
                </div>
            )
        }

        return (
            <div>
                <br/>
                {explanation}
            </div>
        )
    };

    return (
        <>
            {incorrectAnswer && showInstantFeedback &&
            <div className="alert incorrect">{renderMessageForIncorrectAnswer(question)}</div>
            }
            {correctAnswer && showInstantFeedback &&
            <div className="alert correct">
                {renderMessageForCorrectAnswer(question)}
                {renderExplanation(question, false)}
            </div>
            }
        </>)
}

export default InstantFeedback;
