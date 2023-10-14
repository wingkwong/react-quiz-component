import React from "react";

export default function QuestionHeader({ questionName, questionNumber }) {
  return (
    <div>
      {questionName} {questionNumber}:
    </div>
  );
}
