import React, { useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, InputLabel, LinearProgress,
  MenuItem, Select, Stack, Typography,
} from '@mui/material';
import { QuizProvider, useQuizContext } from 'react-quiz-component';

import exampleQuiz from '../quiz';

function AnswerContent({ question, value }) {
  return question.questionType === 'photo'
    ? <Box component="img" src={value} alt="Answer option" sx={{ maxWidth: '100%', maxHeight: 160 }} />
    : <Typography component="span">{value}</Typography>;
}

function QuizTimer() {
  const { state, actions } = useQuizContext();
  if (state.timer === undefined || state.status === 'idle') return null;
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Typography>
        {state.status === 'completed'
          ? `${state.appLocale.timerTimeTaken}: ${state.timeTaken}s`
          : `${state.appLocale.timerTimeRemaining}: ${state.timeRemaining}s`}
      </Typography>
      {state.canPause && <Button onClick={actions.pauseTimer}>{state.appLocale.pauseScreenPause}</Button>}
      {state.canResume && <Button onClick={actions.resumeTimer}>{state.appLocale.pauseScreenResume}</Button>}
    </Stack>
  );
}

function Results() {
  const { state, actions } = useQuizContext();
  return (
    <Stack spacing={2}>
      <Typography variant="h5" component="h2">
        Score: {state.summary.correctPoints} / {state.summary.totalPoints}
      </Typography>
      <Typography>
        Correct: {state.correct.length} · Incorrect: {state.incorrect.length} · Unanswered: {state.unanswered.length}
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="mui-quiz-results-label">Results</InputLabel>
        <Select labelId="mui-quiz-results-label" label="Results" value={state.resultFilter}
          onChange={(event) => actions.setResultFilter(event.target.value)}>
          <MenuItem value="all">{state.appLocale.resultFilterAll}</MenuItem>
          <MenuItem value="correct">{state.appLocale.resultFilterCorrect}</MenuItem>
          <MenuItem value="incorrect">{state.appLocale.resultFilterIncorrect}</MenuItem>
          <MenuItem value="unanswered">{state.appLocale.resultFilterUnanswered}</MenuItem>
        </Select>
      </FormControl>
      {state.filteredResults.map((result) => (
        <Card variant="outlined" key={result.index}>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6" component="h3">{result.question.question}</Typography>
              {result.question.questionPic && <Box component="img" src={result.question.questionPic} alt="Question" sx={{ maxWidth: '100%' }} />}
              <Chip label={result.outcome ?? (result.answered ? 'Not evaluated' : 'Unanswered')} />
              {result.answers.map((answer) => {
                const chosen = Array.isArray(result.userAnswer)
                  ? result.userAnswer.includes(answer.answerNumber) : result.userAnswer === answer.answerNumber;
                return (
                  <Alert key={answer.answerNumber} icon={false}
                    severity={answer.feedback === 'correct' ? 'success' : chosen ? 'error' : 'info'}>
                    <AnswerContent question={result.question} value={answer.value} />
                    {chosen && <Typography component="span"> — Your answer</Typography>}
                  </Alert>
                );
              })}
              {result.question.explanation && <Typography>{result.question.explanation}</Typography>}
            </Stack>
          </CardContent>
        </Card>
      ))}
      <Button onClick={actions.reset}>Try again</Button>
    </Stack>
  );
}

function QuizContent() {
  const { state, actions } = useQuizContext();
  if (state.status === 'invalid') return <Alert severity="error">{state.errors.join(' ')}</Alert>;
  if (state.status === 'idle') return (
    <Stack spacing={2}>
      <Typography>{state.quiz.quizSynopsis}</Typography>
      <Typography>{state.questions.length} questions</Typography>
      <Button variant="contained" onClick={actions.start}>{state.appLocale.startQuizBtn}</Button>
    </Stack>
  );
  if (state.status === 'completed') return <Results />;
  if (state.status === 'paused') return <Alert severity="info">{state.appLocale.pauseScreenDisplay}</Alert>;
  return <ActiveQuestion />;
}

function ActiveQuestion() {
  const { state, actions } = useQuizContext();
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState('');
  const question = state.currentQuestion;
  return (
    <Stack spacing={2}>
      <LinearProgress variant="determinate" value={state.progress} aria-label="Quiz progress" />
      <Typography>{state.appLocale.question} {state.currentQuestionIndex + 1} / {state.questions.length}</Typography>
      <Typography variant="h5" component="h2">{question.question}</Typography>
      {question.questionPic && <Box component="img" src={question.questionPic} alt="Question" sx={{ maxWidth: '100%' }} />}
      <Stack direction="row" spacing={1}>
        <Chip label={question.answerSelectionType === 'multiple' ? 'Multiple selections' : 'Single selection'} />
        <Chip label={`${question.point ?? 0} points`} />
        {question.segment && <Chip label={question.segment} />}
      </Stack>
      {state.feedback && <Alert severity={state.feedback === 'correct' ? 'success' : 'error'}>
        {state.feedback === 'correct'
          ? question.messageForCorrectAnswer ?? 'Correct answer.'
          : question.messageForIncorrectAnswer ?? 'Incorrect answer.'}
        {state.feedback === 'correct' && question.explanation && <Typography>{question.explanation}</Typography>}
      </Alert>}
      {state.answers.map((answer) => (
        <Button key={answer.answerNumber} disabled={answer.disabled}
          aria-pressed={answer.selected}
          variant={answer.selected ? 'contained' : 'outlined'}
          color={answer.feedback === 'correct' ? 'success' : answer.feedback === 'incorrect' ? 'error' : 'primary'}
          onClick={() => actions.selectAnswer(answer.answerNumber)}>
          <AnswerContent question={question} value={answer.value} />
        </Button>
      ))}
      <Stack direction="row" spacing={1}>
        <Button disabled={!state.canGoPrevious} onClick={actions.previousQuestion}>{state.appLocale.prevQuestionBtn}</Button>
        <Button disabled={!state.canGoNext} onClick={actions.nextQuestion}>{state.appLocale.nextQuestionBtn}</Button>
        <Button variant="contained" disabled={!state.canSubmit} onClick={() => setConfirming(true)}>Submit quiz</Button>
      </Stack>
      {actionError && <Alert severity="error">{actionError}</Alert>}
      <Dialog open={confirming} onClose={() => setConfirming(false)} aria-labelledby="mui-quiz-submit-title">
        <DialogTitle id="mui-quiz-submit-title">Submit your answers?</DialogTitle>
        <DialogContent><Typography>You can review your answers before submitting.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirming(false)}>Review</Button>
          <Button onClick={() => {
            const result = actions.submitQuiz();
            setConfirming(false);
            setActionError(result.ok ? '' : `Cannot submit: ${result.reason}`);
          }}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function QuizLayout() {
  const { state } = useQuizContext();
  return (
    <Card sx={{ maxWidth: 720, mx: 'auto' }}>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1">{state.quiz.quizTitle}</Typography>
          <QuizTimer />
          <QuizContent />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function MuiQuiz({ quiz = exampleQuiz, onComplete, revealAnswerOnSubmit = true }) {
  return (
    <QuizProvider quiz={quiz} revealAnswerOnSubmit={revealAnswerOnSubmit}
      allowNavigation timer={120} allowPauseTimer onComplete={onComplete}>
      <QuizLayout />
    </QuizProvider>
  );
}
