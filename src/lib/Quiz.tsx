import React, { useState, useEffect, useCallback } from 'react';
import Core from './Core';
import defaultLocale from './Locale';
import './styles.css';
import { QuizProps, Question, AppLocale } from './types';

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
  const [questions, setQuestions] = useState<Question[]>(quiz.questions);
  const nrOfQuestions = quiz.nrOfQuestions && quiz.nrOfQuestions < quiz.questions.length
    ? quiz.nrOfQuestions
    : quiz.questions.length;

  // Shuffle answers function here
  const shuffleAnswerSequence = (oldQuestions: Question[] = []): Question[] => {
    const newQuestions = oldQuestions.map((question) => {
      const answerWithIndex = question.answers?.map((ans, i) => [ans, i] as [string, number]);
      const shuffledAnswersWithIndex = answerWithIndex.sort(
        () => Math.random() - 0.5,
      );
      const shuffledAnswers = shuffledAnswersWithIndex.map((ans) => ans[0]);
      if (question.answerSelectionType === 'single') {
        const oldCorrectAnswer = question.correctAnswer as string;
        const newCorrectAnswer = shuffledAnswersWithIndex.findIndex(
          (ans) => `${ans[1] + 1}` === `${oldCorrectAnswer}`,
        ) + 1;
        return {
          ...question,
          correctAnswer: `${newCorrectAnswer}`,
          answers: shuffledAnswers,
        };
      }
      if (question.answerSelectionType === 'multiple') {
        const oldCorrectAnswer = question.correctAnswer as number[];
        const newCorrectAnswer = oldCorrectAnswer.map(
          (cans) => shuffledAnswersWithIndex.findIndex(
            (ans) => `${ans[1] + 1}` === `${cans}`,
          ) + 1,
        );
        return {
          ...question,
          correctAnswer: newCorrectAnswer,
          answers: shuffledAnswers,
        };
      }
      return question;
    });
    return newQuestions;
  };

  const shuffleQuestions = useCallback((q: Question[]): Question[] => {
    for (let i = q.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [q[i], q[j]] = [q[j], q[i]];
    }
    return q;
  }, []);

  useEffect(() => {
    if (disableSynopsis) setStart(true);
  }, []);

  useEffect(() => {
    let newQuestions = quiz.questions;

    if (shuffle) {
      newQuestions = shuffleQuestions([...newQuestions]);
    }

    if (shuffleAnswer) {
      newQuestions = shuffleAnswerSequence([...newQuestions]);
    }

    newQuestions = newQuestions.slice(0, nrOfQuestions);
    newQuestions = newQuestions.map((question, index) => ({
      ...question,
      questionIndex: index + 1,
    }));
    setQuestions(newQuestions);
  }, [start]);

  const validateProgressBarColor = (inputColor: string): boolean => {
    const hexaPattern = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
    return hexaPattern.test(inputColor);
  };

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

    if ('progressBarColor' in quiz) {
      if (typeof quiz.progressBarColor !== 'string') {
        console.error('progressBarColor must be a String');
        return false;
      }

      if (!validateProgressBarColor(quiz.progressBarColor)) {
        console.error('progressBarColor must be a valid hex colour');
        return false;
      }
    }

    for (let i = 0; i < questions.length; i += 1) {
      const {
        question,
        questionType,
        answerSelectionType,
        answers,
        correctAnswer,
      } = questions[i];
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
