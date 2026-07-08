import snarkdown from 'snarkdown';
import dompurify from 'dompurify';
import { CheckAnswerParams, SelectAnswerParams, AnswerSelectionType, ButtonState } from '../types';

const addUnique = (values: number[], value: number): number[] => (
  values.includes(value) ? values : [...values, value]
);

const removeValue = (values: number[], value: number): number[] => (
  values.filter((item) => item !== value)
);

const markCorrect = (
  currentQuestionIndex: number,
  correct: number[],
  incorrect: number[],
): { correct: number[]; incorrect: number[] } => ({
  correct: addUnique(correct, currentQuestionIndex),
  incorrect: removeValue(incorrect, currentQuestionIndex),
});

const markIncorrect = (
  currentQuestionIndex: number,
  correct: number[],
  incorrect: number[],
): { correct: number[]; incorrect: number[] } => ({
  correct: removeValue(correct, currentQuestionIndex),
  incorrect: addUnique(incorrect, currentQuestionIndex),
});

const clearQuestionResult = (
  currentQuestionIndex: number,
  correct: number[],
  incorrect: number[],
): { correct: number[]; incorrect: number[] } => ({
  correct: removeValue(correct, currentQuestionIndex),
  incorrect: removeValue(incorrect, currentQuestionIndex),
});

const isExactMultipleAnswer = (userAnswer: number[], correctAnswer: number[]): boolean => (
  userAnswer.length === correctAnswer.length
  && userAnswer.every((answer) => correctAnswer.includes(answer))
);

const createDisabledButtons = (answers: string[]): ButtonState => (
  answers.reduce<ButtonState>((buttonState, _, answerIndex) => ({
    ...buttonState,
    [answerIndex]: { disabled: true },
  }), {})
);

export const rawMarkup = (data: string): { __html: string } => {
  const sanitizer = dompurify.sanitize;
  return { __html: snarkdown(sanitizer(data)) };
};

export const checkAnswer = (
  index: number,
  correctAnswer: string | number[],
  answerSelectionType: AnswerSelectionType,
  answers: string[],
  params: CheckAnswerParams
): void => {
  const {
    userInput,
    userAttempt,
    currentQuestionIndex,
    continueTillCorrect,
    showNextQuestionButton,
    incorrect,
    correct,
    setButtons,
    setIsCorrect,
    setIncorrectAnswer,
    setCorrect,
    setIncorrect,
    setShowNextQuestionButton,
    setUserInput,
    setUserAttempt,
  } = params;

  const indexStr = `${index}`;
  const disabledAll = createDisabledButtons(answers);
  const userInputCopy = [...userInput];

  if (answerSelectionType === 'single') {
    if (userInputCopy[currentQuestionIndex] === undefined) {
      userInputCopy[currentQuestionIndex] = index;
    }

    if (indexStr === correctAnswer) {
      const shouldCountCorrect = !incorrect.includes(currentQuestionIndex)
        && !correct.includes(currentQuestionIndex);

      setButtons((prevState) => ({
        ...prevState,
        ...disabledAll,
        [index - 1]: {
          className: (indexStr === correctAnswer) ? 'correct' : 'incorrect',
        },
      }));

      setIsCorrect(true);
      setIncorrectAnswer(false);
      setCorrect(shouldCountCorrect ? [...correct, currentQuestionIndex] : [...correct]);
      setShowNextQuestionButton(true);
    } else {
      const shouldCountIncorrect = !correct.includes(currentQuestionIndex)
        && !incorrect.includes(currentQuestionIndex);

      if (continueTillCorrect) {
        setButtons((prevState) => (
          {

            ...prevState,
            [index - 1]: {
              disabled: !prevState[index - 1],
            },
          }
        ));
      } else {
        setButtons((prevState) => (
          {

            ...prevState,
            ...disabledAll,
            [index - 1]: {
              className: (indexStr === correctAnswer) ? 'correct' : 'incorrect',
            },
          }
        ));

        setShowNextQuestionButton(true);
      }

      setIncorrectAnswer(true);
      setIsCorrect(false);
      setIncorrect(shouldCountIncorrect ? [...incorrect, currentQuestionIndex] : [...incorrect]);
    }
  } else {
    const correctAnswerArray = correctAnswer as number[];
    const maxNumberOfMultipleSelection = correctAnswerArray.length;

    if (userInputCopy[currentQuestionIndex] === undefined) {
      userInputCopy[currentQuestionIndex] = [];
    }

    const previousInput = userInputCopy[currentQuestionIndex] as number[];
    let currentInput = [...previousInput];

    if (currentInput.length < maxNumberOfMultipleSelection) {
      currentInput = [...currentInput, index];

      if (currentInput.length <= maxNumberOfMultipleSelection) {
        setButtons((prevState) => ({
          ...prevState,
          [index - 1]: {
            disabled: !prevState[index - 1],
            className: (correctAnswerArray.includes(index)) ? 'correct' : 'incorrect',
          },
        }));
      }
    }
    userInputCopy[currentQuestionIndex] = currentInput;

    if (maxNumberOfMultipleSelection === userAttempt) {
      if (isExactMultipleAnswer(currentInput, correctAnswerArray)) {
        const nextResult = markCorrect(currentQuestionIndex, correct, incorrect);

        setIsCorrect(true);
        setIncorrectAnswer(false);
        setCorrect(nextResult.correct);
        setIncorrect(nextResult.incorrect);
        setShowNextQuestionButton(true);
        setUserAttempt(1);
      } else {
        const nextResult = markIncorrect(currentQuestionIndex, correct, incorrect);

        setIncorrectAnswer(true);
        setIsCorrect(false);
        setCorrect(nextResult.correct);
        setIncorrect(nextResult.incorrect);
        setShowNextQuestionButton(true);
        setUserAttempt(1);
      }
    } else if (!showNextQuestionButton) {
      setUserAttempt(userAttempt + 1);
    }
  }
  setUserInput(userInputCopy);
};

export const selectAnswer = (
  index: number,
  correctAnswer: string | number[],
  answerSelectionType: AnswerSelectionType,
  answers: string[],
  params: SelectAnswerParams
): void => {
  const {
    userInput,
    currentQuestionIndex,
    setButtons,
    setShowNextQuestionButton,
    incorrect,
    correct,
    setCorrect,
    setIncorrect,
    setUserInput,
  } = params;

  const userInputCopy = [...userInput];

  if (answerSelectionType === 'single') {
    const correctAnswerNum = Number(correctAnswer);
    userInputCopy[currentQuestionIndex] = index;

    const nextResult = index === correctAnswerNum
      ? markCorrect(currentQuestionIndex, correct, incorrect)
      : markIncorrect(currentQuestionIndex, correct, incorrect);
    setCorrect(nextResult.correct);
    setIncorrect(nextResult.incorrect);

    const newState = answers.reduce<ButtonState>((buttonState, _, answerIndex) => ({
      ...buttonState,
      [answerIndex]: {},
    }), {});
    newState[index - 1] = { className: 'selected' };

    setButtons(newState);
    setShowNextQuestionButton(true);
  } else {
    const correctAnswerArray = correctAnswer as number[];

    if (userInputCopy[currentQuestionIndex] === undefined) {
      userInputCopy[currentQuestionIndex] = [];
    }

    const previousInput = userInputCopy[currentQuestionIndex] as number[];
    const currentInput = previousInput.includes(index)
      ? previousInput.filter((answer) => answer !== index)
      : [...previousInput, index];
    userInputCopy[currentQuestionIndex] = currentInput;

    let nextResult = clearQuestionResult(currentQuestionIndex, correct, incorrect);
    if (currentInput.length > 0) {
      nextResult = isExactMultipleAnswer(currentInput, correctAnswerArray)
        ? markCorrect(currentQuestionIndex, correct, incorrect)
        : markIncorrect(currentQuestionIndex, correct, incorrect);
    }
    setCorrect(nextResult.correct);
    setIncorrect(nextResult.incorrect);
    setButtons((prevState) => ({
      ...prevState,
      [index - 1]: {
        className: currentInput.includes(index) ? 'selected' : undefined,
      },
    }));

    setShowNextQuestionButton(currentInput.length > 0);
  }
  setUserInput(userInputCopy);
};
