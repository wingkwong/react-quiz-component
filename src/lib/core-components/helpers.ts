import snarkdown from 'snarkdown';
import dompurify from 'dompurify';
import { CheckAnswerParams, SelectAnswerParams, AnswerSelectionType, ButtonState } from '../types';

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
  const disabledAll = Object.keys(answers).map(() => ({ disabled: true }));
  const userInputCopy = [...userInput];

  if (answerSelectionType === 'single') {
    if (userInputCopy[currentQuestionIndex] === undefined) {
      userInputCopy[currentQuestionIndex] = index;
    }

    if (indexStr === correctAnswer) {
      if (incorrect.indexOf(currentQuestionIndex) < 0 && correct.indexOf(currentQuestionIndex) < 0) {
        correct.push(currentQuestionIndex);
      }

      setButtons((prevState) => ({
        ...prevState,
        ...disabledAll,
        [index - 1]: {
          className: (indexStr === correctAnswer) ? 'correct' : 'incorrect',
        },
      }));

      setIsCorrect(true);
      setIncorrectAnswer(false);
      setCorrect(correct);
      setShowNextQuestionButton(true);
    } else {
      if (correct.indexOf(currentQuestionIndex) < 0 && incorrect.indexOf(currentQuestionIndex) < 0) {
        incorrect.push(currentQuestionIndex);
      }

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
      setIncorrect(incorrect);
    }
  } else {
    const correctAnswerArray = correctAnswer as number[];
    const maxNumberOfMultipleSelection = correctAnswerArray.length;

    if (userInputCopy[currentQuestionIndex] === undefined) {
      userInputCopy[currentQuestionIndex] = [];
    }

    const currentInput = userInputCopy[currentQuestionIndex] as number[];

    if (currentInput.length < maxNumberOfMultipleSelection) {
      currentInput.push(index);

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

    if (maxNumberOfMultipleSelection === userAttempt) {
      let cnt = 0;
      for (let i = 0; i < correctAnswerArray.length; i += 1) {
        if (currentInput.includes(correctAnswerArray[i])) {
          cnt += 1;
        }
      }

      if (cnt === maxNumberOfMultipleSelection) {
        correct.push(currentQuestionIndex);

        setIsCorrect(true);
        setIncorrectAnswer(false);
        setCorrect(correct);
        setShowNextQuestionButton(true);
        setUserAttempt(1);
      } else {
        incorrect.push(currentQuestionIndex);

        setIncorrectAnswer(true);
        setIsCorrect(false);
        setIncorrect(incorrect);
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

    if (index === correctAnswerNum) {
      if (correct.indexOf(currentQuestionIndex) < 0) {
        correct.push(currentQuestionIndex);
      }
      if (incorrect.indexOf(currentQuestionIndex) >= 0) {
        incorrect.splice(incorrect.indexOf(currentQuestionIndex), 1);
      }
    } else {
      if (incorrect.indexOf(currentQuestionIndex) < 0) {
        incorrect.push(currentQuestionIndex);
      }
      if (correct.indexOf(currentQuestionIndex) >= 0) {
        correct.splice(correct.indexOf(currentQuestionIndex), 1);
      }
    }
    setCorrect(correct);
    setIncorrect(incorrect);

    setButtons((prevState) => {
      const newState: ButtonState = {};
      // Reset all buttons
      Object.keys(answers).forEach((_, idx) => {
        newState[idx] = {};
      });
      // Set the selected button
      newState[index - 1] = { className: 'selected' };
      return newState;
    });

    setShowNextQuestionButton(true);
  } else {
    const correctAnswerArray = correctAnswer as number[];

    if (userInputCopy[currentQuestionIndex] === undefined) {
      userInputCopy[currentQuestionIndex] = [];
    }

    const currentInput = userInputCopy[currentQuestionIndex] as number[];

    if (currentInput.includes(index)) {
      currentInput.splice(currentInput.indexOf(index), 1);
    } else {
      currentInput.push(index);
    }

    if (currentInput.length === correctAnswerArray.length) {
      let exactMatch = true;
      for (const input of currentInput) {
        if (!correctAnswerArray.includes(input)) {
          exactMatch = false;
          if (incorrect.indexOf(currentQuestionIndex) < 0) {
            incorrect.push(currentQuestionIndex);
          }
          if (correct.indexOf(currentQuestionIndex) >= 0) {
            correct.splice(correct.indexOf(currentQuestionIndex), 1);
          }
          break;
        }
      }
      if (exactMatch) {
        if (correct.indexOf(currentQuestionIndex) < 0) {
          correct.push(currentQuestionIndex);
        }
        if (incorrect.indexOf(currentQuestionIndex) >= 0) {
          incorrect.splice(incorrect.indexOf(currentQuestionIndex), 1);
        }
      }
    } else {
      if (incorrect.indexOf(currentQuestionIndex) < 0) {
        incorrect.push(currentQuestionIndex);
      }
      if (correct.indexOf(currentQuestionIndex) >= 0) {
        correct.splice(correct.indexOf(currentQuestionIndex), 1);
      }
    }
    setCorrect(correct);
    setIncorrect(incorrect);
    setButtons((prevState) => ({
      ...prevState,
      [index - 1]: {
        className: currentInput.includes(index) ? 'selected' : undefined,
      },
    }));

    if (currentInput.length > 0) {
      setShowNextQuestionButton(true);
    }
  }
  setUserInput(userInputCopy);
};
