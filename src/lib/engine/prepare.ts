import type { Question } from '../types';
import type { UseQuizOptions } from './types';

export function validateOptions({ quiz, timer }: UseQuizOptions): string[] {
  const errors: string[] = [];
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return ['Quiz must contain at least one question.'];
  }
  if (timer !== undefined && (!Number.isFinite(timer) || timer < 1)) {
    errors.push('timer must be a finite number greater than or equal to 1.');
  }
  if (quiz.nrOfQuestions !== undefined
    && (!Number.isInteger(quiz.nrOfQuestions) || quiz.nrOfQuestions < 1)) {
    errors.push('nrOfQuestions must be a positive integer.');
  }
  quiz.questions.forEach((question, index) => {
    const prefix = `Question ${index + 1}: `;
    if (!question || typeof question.question !== 'string' || !question.question) {
      errors.push(`${prefix}question text is required.`);
      return;
    }
    if (!['text', 'photo'].includes(question.questionType)) {
      errors.push(`${prefix}questionType must be text or photo.`);
    }
    if (!Array.isArray(question.answers) || !question.answers.length
      || question.answers.some((answer) => typeof answer !== 'string')) {
      errors.push(`${prefix}answers must be a nonempty array of strings.`);
      return;
    }
    const selection = question.answerSelectionType ?? 'single';
    if (question.questionAudio !== undefined
      && (typeof question.questionAudio !== 'string' || !question.questionAudio.trim())) {
      errors.push(`${prefix}questionAudio must be a nonempty audio source string.`);
    }
    for (const field of ['questionAudioLabel', 'questionAudioTranscript'] as const) {
      if (question[field] !== undefined && typeof question[field] !== 'string') {
        errors.push(`${prefix}${field} must be a string.`);
      }
    }
    if (question.answerAltTexts !== undefined && (!Array.isArray(question.answerAltTexts)
      || question.answerAltTexts.length !== question.answers.length
      || question.answerAltTexts.some((alt) => typeof alt !== 'string' || !alt.trim()))) {
      errors.push(`${prefix}answerAltTexts must contain a nonempty description for every answer.`);
    }
    const validNumber = (answer: number) => Number.isInteger(answer)
      && answer >= 1 && answer <= question.answers.length;
    if (selection === 'single') {
      if (typeof question.correctAnswer !== 'string' || !validNumber(Number(question.correctAnswer))) {
        errors.push(`${prefix}correctAnswer must be a valid 1-based answer number string.`);
      }
    } else if (selection === 'multiple') {
      if (!Array.isArray(question.correctAnswer) || !question.correctAnswer.length
        || !question.correctAnswer.every(validNumber)
        || new Set(question.correctAnswer).size !== question.correctAnswer.length) {
        errors.push(`${prefix}correctAnswer must contain unique valid 1-based answer numbers.`);
      }
    } else {
      errors.push(`${prefix}answerSelectionType must be single or multiple.`);
    }
    if (question.point !== undefined && !Number.isFinite(typeof question.point === 'string'
      ? parseInt(question.point || '0', 10) : question.point)) {
      errors.push(`${prefix}point must be numeric.`);
    }
  });
  return errors;
}

function shuffle<T>(values: T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function prepareQuestions(options: UseQuizOptions): Question[] {
  const { quiz } = options;
  const questions = options.shuffle ? shuffle(quiz.questions) : quiz.questions;
  return questions.slice(0, quiz.nrOfQuestions ?? questions.length).map((source, index) => {
    const order = source.answers.map((_, answerIndex) => answerIndex + 1);
    const answerOrder = options.shuffleAnswer ? shuffle(order) : order;
    return {
      ...source,
      answerSelectionType: source.answerSelectionType ?? 'single',
      questionIndex: index + 1,
      answers: answerOrder.map((answerNumber) => source.answers[answerNumber - 1]),
      answerAltTexts: source.answerAltTexts
        ? answerOrder.map((answerNumber) => source.answerAltTexts![answerNumber - 1]) : undefined,
      correctAnswer: Array.isArray(source.correctAnswer)
        ? source.correctAnswer.map((answerNumber) => answerOrder.indexOf(answerNumber) + 1)
        : String(answerOrder.indexOf(Number(source.correctAnswer)) + 1),
    };
  });
}
