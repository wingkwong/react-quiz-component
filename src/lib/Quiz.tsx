import React, { useEffect, useMemo, useState } from 'react';
import Core from './Core';
import defaultLocale from './Locale';
import './styles.css';
import { QuizProps, Question, AppLocale } from './types';

const shuffleArray = <T,>(items: T[]): T[] => {
  const shuffledItems = [...items];

  for (let i = shuffledItems.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledItems[i], shuffledItems[j]] = [shuffledItems[j], shuffledItems[i]];
  }

  return shuffledItems;
};

const shuffleAnswerSequence = (oldQuestions: Question[] = []): Question[] => (
  oldQuestions.map((question) => {
    const answerWithIndex = question.answers?.map((answer, index) => [answer, index] as [string, number]);
    const shuffledAnswersWithIndex = shuffleArray(answerWithIndex);
    const shuffledAnswers = shuffledAnswersWithIndex.map(([answer]) => answer);
    const answerSelectionType = question.answerSelectionType || 'single';

    if (answerSelectionType === 'single') {
      const oldCorrectAnswer = question.correctAnswer as string;
      const newCorrectAnswer = shuffledAnswersWithIndex.findIndex(
        ([, oldIndex]) => `${oldIndex + 1}` === `${oldCorrectAnswer}`,
      ) + 1;
      return {
        ...question,
        correctAnswer: `${newCorrectAnswer}`,
        answers: shuffledAnswers,
      };
    }

    const oldCorrectAnswer = question.correctAnswer as number[];
    const newCorrectAnswer = oldCorrectAnswer.map(
      (correctAnswer) => shuffledAnswersWithIndex.findIndex(
        ([, oldIndex]) => `${oldIndex + 1}` === `${correctAnswer}`,
      ) + 1,
    );
    return {
      ...question,
      correctAnswer: newCorrectAnswer,
      answers: shuffledAnswers,
    };
  })
);

const prepareQuestions = (
  questions: Question[],
  nrOfQuestions: number,
  shuffle?: boolean,
  shuffleAnswer?: boolean,
): Question[] => {
  let preparedQuestions = shuffle ? shuffleArray(questions) : [...questions];

  if (shuffleAnswer) {
    preparedQuestions = shuffleAnswerSequence(preparedQuestions);
  }

  return preparedQuestions.slice(0, nrOfQuestions).map((question, index) => ({
    ...question,
    questionIndex: index + 1,
  }));
};

const validateProgressBarColor = (inputColor: string): boolean => {
  const hexaPattern = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
  return hexaPattern.test(inputColor);
};

function Quiz({
  quiz,
  shuffle,
  shuffleAnswer,
  showDefaultResult,
  onComplete,
  customResultPage,
  showInstantFeedback,
  continueTillCorrect,
  revealAnswerOnSubmit,
  allowNavigation,
  onQuestionSubmit,
  disableSynopsis,
  timer,
  allowPauseTimer,
  enableProgressBar,
}: QuizProps) {
  const [start, setStart] = useState(false);
  const nrOfQuestions = quiz.nrOfQuestions && quiz.nrOfQuestions < quiz.questions.length
    ? quiz.nrOfQuestions
    : quiz.questions.length;
  const questions = useMemo(
    () => prepareQuestions(quiz.questions, nrOfQuestions, shuffle, shuffleAnswer),
    [nrOfQuestions, quiz.questions, shuffle, shuffleAnswer],
  );

  useEffect(() => {
    if (disableSynopsis) setStart(true);
  }, [disableSynopsis]);

  const validateQuiz = (q: QuizProps['quiz']): boolean => {
    if (!q) {
      console.error('Quiz object is required.');
      return false;
    }

    if ((timer && typeof timer !== 'number') || (timer !== undefined && timer < 1)) {
      console.error(timer && typeof timer !== 'number' ? 'timer must be a number' : 'timer must be a number greater than 0');
      return false;
    }

    if (allowPauseTimer && typeof allowPauseTimer !== 'boolean') {
      console.error('allowPauseTimer must be a Boolean');
      return false;
    }

    if (enableProgressBar && typeof enableProgressBar !== 'boolean') {
      console.error('enableProgressBar must be a Boolean');
      return false;
    }

    if ('progressBarColor' in q) {
      if (typeof q.progressBarColor !== 'string') {
        console.error('progressBarColor must be a String');
        return false;
      }

      if (!validateProgressBarColor(q.progressBarColor)) {
        console.error('progressBarColor must be a valid hex colour');
        return false;
      }
    }

    for (let i = 0; i < q.questions.length; i += 1) {
      const {
        question,
        questionType,
        answerSelectionType,
        answers,
        correctAnswer,
      } = q.questions[i];
      if (!question) {
        console.error("Field 'question' is required.");
        return false;
      }

      if (!questionType) {
        console.error("Field 'questionType' is required.");
        return false;
      }
      if (questionType !== 'text' && questionType !== 'photo') {
        console.error(
          "The value of 'questionType' is either 'text' or 'photo'.",
        );
        return false;
      }

      if (!answers) {
        console.error("Field 'answers' is required.");
        return false;
      }
      if (!Array.isArray(answers)) {
        console.error("Field 'answers' has to be an Array");
        return false;
      }

      if (!correctAnswer) {
        console.error("Field 'correctAnswer' is required.");
        return false;
      }

      let selectType = answerSelectionType;

      if (!answerSelectionType) {
        // Default single to avoid code breaking due to automatic version upgrade
        console.warn(
          'Field answerSelectionType should be defined since v0.3.0. Use single by default.',
        );
        selectType = answerSelectionType || 'single';
      }

      if (
        selectType === 'single'
        && !(typeof correctAnswer === 'string' || correctAnswer instanceof String)
      ) {
        console.error(
          'answerSelectionType is single but expecting String in the field correctAnswer',
        );
        return false;
      }

      if (selectType === 'multiple' && !Array.isArray(correctAnswer)) {
        console.error(
          'answerSelectionType is multiple but expecting Array in the field correctAnswer',
        );
        return false;
      }
    }

    return true;
  };

  if (!validateQuiz(quiz)) {
    return null;
  }

  const appLocale: AppLocale = {
    ...defaultLocale,
    ...quiz.appLocale,
  };

  return (
    <div className="react-quiz-container">
      {!start && (
        <div>
          <h2>{quiz.quizTitle}</h2>
          <div>
            {appLocale.landingHeaderText.replace(
              '<questionLength>',
              String(nrOfQuestions),
            )}
          </div>
          {quiz.quizSynopsis && (
            <div className="quiz-synopsis">{quiz.quizSynopsis}</div>
          )}
          <div className="startQuizWrapper">
            <button type="button" onClick={() => setStart(true)} className="startQuizBtn btn">
              {appLocale.startQuizBtn}
            </button>
          </div>
        </div>
      )}

      {start && (
        <Core
          questions={questions}
          showDefaultResult={showDefaultResult}
          onComplete={onComplete}
          customResultPage={customResultPage}
          showInstantFeedback={showInstantFeedback}
          continueTillCorrect={continueTillCorrect}
          revealAnswerOnSubmit={revealAnswerOnSubmit}
          allowNavigation={allowNavigation}
          appLocale={appLocale}
          onQuestionSubmit={onQuestionSubmit}
          timer={timer}
          allowPauseTimer={allowPauseTimer}
          enableProgressBar={enableProgressBar}
          progressBarColor={quiz.progressBarColor}
        />
      )}
    </div>
  );
}

export default Quiz;
