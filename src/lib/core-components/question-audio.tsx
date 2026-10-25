/* oxlint-disable jsx-a11y/media-has-caption -- Audio-only content uses the visible transcript as its text alternative. */
import React, { useEffect, useId, useRef } from 'react';
import type { Question } from '../types';

export default function QuestionAudio({ question }: { question: Question }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptId = useId();
  useEffect(() => {
    const audio = audioRef.current;
    return () => { audio?.pause(); };
  }, [question.questionAudio]);

  if (!question.questionAudio) return null;
  return (
    <div className="question-audio">
      <audio ref={audioRef} controls preload="none" src={question.questionAudio}
        aria-label={question.questionAudioLabel || 'Question audio'}
        aria-describedby={question.questionAudioTranscript ? transcriptId : undefined}>
        Your browser does not support audio playback.
      </audio>
      {question.questionAudioTranscript && <p id={transcriptId}>{question.questionAudioTranscript}</p>}
    </div>
  );
}
