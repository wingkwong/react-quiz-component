import React from "react";
import Explanation from "./Explanation";

const InstantFeedback = ({showInstantFeedback, incorrectAnswer, correctAnswer, question}) => {

    const renderMessageForCorrectAnswer = (question) => {
        const defaultMessage = 'You are correct. Please click Next to continue.';
        return question.messageForCorrectAnswer || defaultMessage;
    };

    const renderMessageForIncorrectAnswer = (question) => {
        const defaultMessage = 'Incorrect answer. Please try again.';
        return question.messageForIncorrectAnswer || defaultMessage;
    };


    return (
        <>
            {incorrectAnswer && showInstantFeedback &&
            <div className="alert incorrect">{renderMessageForIncorrectAnswer(question)}</div>
            }
            {correctAnswer && showInstantFeedback &&
            <div className="alert correct">
                {renderMessageForCorrectAnswer(question)}
                <Explanation question={question} isResultPage={false}/>
            </div>
            }
        </>)
}

export default InstantFeedback;
