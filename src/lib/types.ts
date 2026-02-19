export interface AppLocale {
  landingHeaderText: string;
  question: string;
  startQuizBtn: string;
  resultFilterAll: string;
  resultFilterCorrect: string;
  resultFilterIncorrect: string;
  resultFilterUnanswered: string;
  nextQuestionBtn: string;
  prevQuestionBtn: string;
  resultPageHeaderText: string;
  resultPagePoint: string;
  pauseScreenDisplay: string;
  timerTimeRemaining: string;
  timerTimeTaken: string;
  pauseScreenPause: string;
  pauseScreenResume: string;
  singleSelectionTagText: string;
  multipleSelectionTagText: string;
  pickNumberOfSelection: string;
  marksOfQuestion: string;
}

export type QuestionType = 'text' | 'photo';
export type AnswerSelectionType = 'single' | 'multiple';

export interface Question {
  question: string;
  questionType: QuestionType;
  questionPic?: string;
  answerSelectionType: AnswerSelectionType;
  answers: string[];
  correctAnswer: string | number[];
  messageForCorrectAnswer?: string;
  messageForIncorrectAnswer?: string;
  explanation?: string;
  point?: string | number;
  segment?: string;
  questionIndex?: number;
}

export interface Quiz {
  quizTitle: string;
  quizSynopsis?: string;
  nrOfQuestions?: number;
  questions: Question[];
  appLocale?: Partial<AppLocale>;
  progressBarColor?: string;
}

export interface QuestionSummary {
  numberOfQuestions: number;
  numberOfCorrectAnswers: number;
  numberOfIncorrectAnswers: number;
  questions: Question[];
  userInput: (number | number[] | undefined)[];
  totalPoints: number;
  correctPoints: number;
  timeTaken: number;
}

export interface QuizProps {
  quiz: Quiz;
  shuffle?: boolean;
  shuffleAnswer?: boolean;
  showDefaultResult?: boolean;
  onComplete?: (summary: QuestionSummary) => void;
  customResultPage?: (summary: QuestionSummary) => React.ReactElement;
  showInstantFeedback?: boolean;
  continueTillCorrect?: boolean;
  revealAnswerOnSubmit?: boolean;
  allowNavigation?: boolean;
  onQuestionSubmit?: (data: { question: Question; userAnswer: number | number[] | undefined; isCorrect: boolean }) => void;
  disableSynopsis?: boolean;
  timer?: number;
  allowPauseTimer?: boolean;
  enableProgressBar?: boolean;
}

export interface CoreProps {
  questions: Question[];
  appLocale: AppLocale;
  showDefaultResult?: boolean;
  onComplete?: (summary: QuestionSummary) => void;
  customResultPage?: (summary: QuestionSummary) => React.ReactElement;
  showInstantFeedback?: boolean;
  continueTillCorrect?: boolean;
  revealAnswerOnSubmit?: boolean;
  allowNavigation?: boolean;
  onQuestionSubmit?: (data: { question: Question; userAnswer: number | number[] | undefined; isCorrect: boolean }) => void;
  timer?: number;
  allowPauseTimer?: boolean;
  enableProgressBar?: boolean;
  progressBarColor?: string;
}

export interface ButtonState {
  [key: number]: {
    disabled?: boolean;
    className?: string;
  };
}

export interface CheckAnswerParams {
  userInput: (number | number[] | undefined)[];
  userAttempt: number;
  currentQuestionIndex: number;
  continueTillCorrect?: boolean;
  showNextQuestionButton: boolean;
  incorrect: number[];
  correct: number[];
  setButtons: React.Dispatch<React.SetStateAction<ButtonState>>;
  setIsCorrect: React.Dispatch<React.SetStateAction<boolean>>;
  setIncorrectAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  setCorrect: React.Dispatch<React.SetStateAction<number[]>>;
  setIncorrect: React.Dispatch<React.SetStateAction<number[]>>;
  setShowNextQuestionButton: React.Dispatch<React.SetStateAction<boolean>>;
  setUserInput: React.Dispatch<React.SetStateAction<(number | number[] | undefined)[]>>;
  setUserAttempt: React.Dispatch<React.SetStateAction<number>>;
}

export interface SelectAnswerParams {
  userInput: (number | number[] | undefined)[];
  currentQuestionIndex: number;
  setButtons: React.Dispatch<React.SetStateAction<ButtonState>>;
  setShowNextQuestionButton: React.Dispatch<React.SetStateAction<boolean>>;
  incorrect: number[];
  correct: number[];
  setCorrect: React.Dispatch<React.SetStateAction<number[]>>;
  setIncorrect: React.Dispatch<React.SetStateAction<number[]>>;
  setUserInput: React.Dispatch<React.SetStateAction<(number | number[] | undefined)[]>>;
}

export interface InstantFeedbackProps {
  showInstantFeedback?: boolean;
  incorrectAnswer: boolean;
  correctAnswer: boolean;
  question: Question;
  onQuestionSubmit?: (data: { question: Question; userAnswer: number | number[] | undefined; isCorrect: boolean }) => void;
  userAnswer: number | number[] | undefined;
}

export interface ExplanationProps {
  question: Question;
  isResultPage: boolean;
}

export interface ProgressBarProps {
  progressBarColor?: string;
  progress: number;
  height?: string;
  quizLength: number;
  isEndQuiz: boolean;
}

export interface QuizResultFilterProps {
  filteredValue: string;
  handleChange: (event: { target: { value: string } }) => void;
  appLocale: AppLocale;
}
