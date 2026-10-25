import type { AppLocale } from './types';

const defaultLocale = {
  landingHeaderText: '<questionLength> Questions',
  question: 'Question',
  startQuizBtn: 'Start Quiz',
  resultFilterAll: 'All',
  resultFilterCorrect: 'Correct',
  resultFilterIncorrect: 'Incorrect',
  resultFilterUnanswered: 'Unanswered',
  nextQuestionBtn: 'Next',
  prevQuestionBtn: 'Prev',
  quitQuizBtn: 'Submit and quit',
  quitQuizConfirm: 'Submit your answers and quit the quiz?',
  resultPageHeaderText: 'You have completed the quiz. You got <correctIndexLength> out of <questionLength> questions.',
  resultPagePoint: 'You scored <correctPoints> out of <totalPoints>.',
  resultPageExplanation: 'Explanation',
  pauseScreenDisplay: 'Test is paused. Clicked the Resume button to continue',
  timerTimeRemaining: 'Time Remaining',
  timerTimeTaken: 'Time Taken',
  pauseScreenPause: 'Pause',
  pauseScreenResume: 'Resume',
  singleSelectionTagText: 'Single Selection',
  multipleSelectionTagText: 'Multiple Selection',
  pickNumberOfSelection: 'Pick <numberOfSelection>',
  marksOfQuestion: '(<marks> marks)',
} satisfies AppLocale;

export default defaultLocale;
