import type * as library from './index.js';

declare const Quiz: typeof library.default & typeof library;

// Preserve public type imports for CommonJS TypeScript consumers too.
declare namespace Quiz {
  type QuizProps = library.QuizProps;
  type AppLocale = library.AppLocale;
  type Question = library.Question;
  type Quiz = library.Quiz;
  type QuestionSummary = library.QuestionSummary;
  type QuestionType = library.QuestionType;
  type AnswerSelectionType = library.AnswerSelectionType;
  type UserAnswer = library.UserAnswer;
  type QuizStatus = library.QuizStatus;
  type AnswerFeedback = library.AnswerFeedback;
  type ResultFilter = library.ResultFilter;
  type QuestionSubmitData = library.QuestionSubmitData;
  type UseQuizOptions = library.UseQuizOptions;
  type QuizProviderProps = library.QuizProviderProps;
  type AnswerState = library.AnswerState;
  type QuestionAttempt = library.QuestionAttempt;
  type QuestionState = library.QuestionState;
  type QuizState = library.QuizState;
  type BlockedReason = library.BlockedReason;
  type ActionResult = library.ActionResult;
  type QuizActions = library.QuizActions;
  type QuizController = library.QuizController;
}

export = Quiz;
