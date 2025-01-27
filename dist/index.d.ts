declare module 'react-quiz-component' {
  import { ReactNode, ReactElement } from 'react';

  export interface QuizComponentProps {
    quiz: Quiz;
    timer?: number;
    enableProgressBar?: boolean;
    shuffle?: boolean;
    shuffleAnswer?: boolean;
    showDefaultResult?: boolean;
    appLocale?: AppLocale;
    showInstantFeedback?: boolean;
    continueTillCorrect?: boolean;
    allowPauseTimer?: boolean;
    disableSynopsis?: boolean;
    onComplete?: (obj: CompletionQuizObject) => void;
    customResultPage?: (obj: Quiz) => ReactNode;
    allowNavigation?: boolean;
    onQuestionSubmit?: (obj: Question) => void;
  }

  export enum QuestionSegment {
    basic = 'Basic',
    medium = 'Medium',
    advanced = 'Advanced',
  }

  export interface Question {
    question: string;
    questionType: 'text' | 'photo'; // can expand with more types if needed
    questionPic?: string; // can expand with more types if needed
    imageUrl?: string; // Optional image for the question
    answerSelectionType: 'single' | 'multiple'; // can expand with more types if needed
    answers: string[];
    correctAnswer: string | string[] | number[]; // can be single index or array of indices
    messageForCorrectAnswer?: string;
    messageForIncorrectAnswer?: string;
    explanation?: string;
    point?: number | string; // Optional points for this specific question
    segment?: QuestionSegment;
  }

  export interface Quiz {
    quizTitle?: string;
    quizSynopsis?: string;
    progressBarColor?: string;
    nrOfQuestions?: number | string;
    questions: Question[];
  }

  export interface AppLocale {
    landingHeaderText?: string; // "<questionLength> Questions",
    question?: string; // "Question",
    startQuizBtn?: string; // "Start Quiz",
    resultFilterAll?: string; // "All",
    resultFilterCorrect?: string; // "Correct",
    resultFilterIncorrect?: string; // "Incorrect",
    resultFilterUnanswered?: string; // "Unanswered",
    prevQuestionBtn?: string; // "Prev",
    nextQuestionBtn?: string; // "Next",
    resultPageHeaderText?: string; // "You have completed the quiz. You got <correctIndexLength> out of <questionLength> questions."
    resultPagePoint?: string; // "You scored <correctPoints> out of <totalPoints>."
    pauseScreenDisplay?: string; // "Test is paused. Clicked the Resume button to continue",
    timerTimeRemaining?: string; // "Time Remaining",
    timerTimeTaken?: string; // "Time Taken",
    pauseScreenPause?: string; // "Pause",
    pauseScreenResume?: string; // "Resume",
    singleSelectionTagText?: string; // "Single Selection",
    multipleSelectionTagText?: string; // "Multiple Selection",
    pickNumberOfSelection?: string; // "Pick <numberOfSelection>",
    marksOfQuestion?: string; // "(<marks> marks)",
  }

  export interface CompletionQuizObject {
    numberOfCorrectAnswers: number;
    numberOfIncorrectAnswers: number;
    numberOfQuestions: number;
    totalPoints: number;
    correctPoints: number;
    userInput: number[];
    questions: Question[];
  }

  const Quiz: (props: QuizComponentProps) => ReactElement;

  export default Quiz;
}
