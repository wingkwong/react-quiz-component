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
  quitQuizBtn?: string;
  quitQuizConfirm?: string;
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
  questionPicAlt?: string;
  answerSelectionType: AnswerSelectionType;
  answers: string[];
  answerAltTexts?: string[];
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
  showCorrectAnswer?: boolean;
  allowNavigation?: boolean;
  onQuestionSubmit?: (data: { question: Question; userAnswer: number | number[] | undefined; isCorrect: boolean }) => void;
  disableSynopsis?: boolean;
  timer?: number;
  allowPauseTimer?: boolean;
  enableProgressBar?: boolean;
  allowQuit?: boolean;
}

export interface InstantFeedbackProps {
  showInstantFeedback?: boolean;
  incorrectAnswer: boolean;
  correctAnswer: boolean;
  question: Question;
}

export interface ExplanationProps {
  question: Question;
  isResultPage: boolean;
}

export interface ProgressBarProps {
  progressBarColor?: string;
  progress: number;
  height?: string;
}

export interface QuizResultFilterProps {
  filteredValue: string;
  handleChange: (event: { target: { value: string } }) => void;
  appLocale: AppLocale;
}
