import React from "react";

const Explanation = ({question, isResultPage}) => {
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

export default Explanation;
