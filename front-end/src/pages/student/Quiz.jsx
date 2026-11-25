import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock3, CheckCircle2, Send, RotateCcw } from 'lucide-react';
import StudentPage from '../../components/student/StudentPage';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchStudentAssessment,
  setStudentAnswer,
  submitStudentAssessment,
} from '../../store/actions/quizzesActions';
import {
  AdminHeader,
  AdminDataState,
  AdminEmpty,
} from '../../components/admin/AdminUI';
export default function Quiz() {
  const [params] = useSearchParams();
  const courseId = params.get('courseId');
  return courseId ? (
    <Assessment courseId={courseId} />
  ) : (
    <StudentPage>
      <AdminEmpty
        title="Choose a course assessment"
        description="Open a course from My learning to take its published assessment."
      />
      <Link className="admin-button" to="/student/my-learning">
        My learning
      </Link>
    </StudentPage>
  );
}
function Assessment({ courseId }) {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.quizzes.assessment);
  const {
    answers,
    result,
    submitting: busy,
    error,
  } = useAppSelector((s) => s.quizzes.attempt);
  const q = state.data;
  const [remaining, setRemaining] = useState(null);
  const submitting = useRef(false);

  useEffect(() => {
    dispatch(fetchStudentAssessment(courseId));
  }, [dispatch, courseId]);

  useEffect(() => {
    setRemaining(
      q && Number(q.durationMinutes) > 0 ? Number(q.durationMinutes) * 60 : null
    );
  }, [q]);

  const submit = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!q || submitting.current || result) return;
      submitting.current = true;
      try {
        await dispatch(
          submitStudentAssessment({ courseId, quizId: q.id, answers })
        ).unwrap();
      } catch {
        // handled by quizzesSlice
      } finally {
        submitting.current = false;
      }
    },
    [dispatch, courseId, q, result, answers]
  );

  useEffect(() => {
    if (remaining === null || result || !q) return;
    if (remaining <= 0) {
      submit();
      return;
    }
    const tick = setTimeout(
      () => setRemaining((t) => Math.max(0, t - 1)),
      1000
    );
    return () => clearTimeout(tick);
  }, [remaining, result, q, submit]);
  return (
    <StudentPage>
      <Link className="admin-count-label" to={`/student/learn/${courseId}`}>
        <ArrowLeft size={14} />
        Back to course
      </Link>
      <AdminDataState
        loading={state.loading}
        error={state.error}
        refresh={() => dispatch(fetchStudentAssessment(courseId))}
      />
      {q && !state.error && (
        <>
          <AdminHeader title={q.title}>
            {remaining !== null && !result && (
              <span className="learner-assessment-timer">
                <Clock3 size={15} />
                {Math.floor(remaining / 60)}:
                {String(remaining % 60).padStart(2, '0')}
              </span>
            )}
          </AdminHeader>
          <section className="admin-card learner-assessment-intro">
            <div>
              <p className="learner-kicker">{q.courseTitle}</p>
              {q.description && (
                <p className="learner-body-copy mt-3">{q.description}</p>
              )}
            </div>
            <div className="flex gap-6 admin-muted">
              <span>{q.questions.length} questions</span>
              <span>Pass mark {q.passingScore}%</span>
            </div>
          </section>
          {result ? (
            <>
              <section className="admin-card learner-assessment-result">
                <span className="learner-confirmation-icon">
                  <CheckCircle2 size={32} />
                </span>
                <p className="learner-kicker mt-5">
                  {result.passed ? 'Assessment passed' : 'Assessment completed'}
                </p>
                <h2>{result.score}%</h2>
                <p className="admin-muted mt-3">
                  {result.correctCount} of {result.totalQuestions} correct ·
                  Pass mark {result.passingScore}%
                </p>
                <p className="admin-muted mt-3">
                  Your assessment result has been recorded.
                </p>
                <button
                  className="admin-button mt-5"
                  onClick={() => dispatch(fetchStudentAssessment(courseId))}
                >
                  <RotateCcw size={14} />
                  Retake assessment
                </button>
              </section>
              <section className="grid gap-4">
                {result.feedback.map((f, i) => (
                  <article className="admin-card" key={f.questionId}>
                    <div className="flex justify-between gap-4">
                      <h3 className="text-sm font-semibold">
                        {i + 1}.{' '}
                        {
                          q.questions.find((item) => item.id === f.questionId)
                            ?.text
                        }
                      </h3>
                      <span
                        className={
                          f.isCorrect
                            ? 'text-emerald-700 text-xs'
                            : 'text-rose-700 text-xs'
                        }
                      >
                        {f.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    {f.explanation && (
                      <p className="learner-body-copy mt-4">{f.explanation}</p>
                    )}
                  </article>
                ))}
              </section>
            </>
          ) : (
            <form className="grid gap-5" onSubmit={submit}>
              {q.questions.map((question, i) => (
                <fieldset
                  className="admin-card learner-question"
                  key={question.id}
                >
                  <legend className="sr-only">Question {i + 1}</legend>
                  <h2>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {question.text}
                  </h2>
                  <div className="learner-answer-options">
                    {question.options.map((option, index) => (
                      <label
                        key={index}
                        className={
                          answers[question.id] === index ? 'is-selected' : ''
                        }
                      >
                        <input
                          type="radio"
                          name={question.id}
                          checked={answers[question.id] === index}
                          disabled={busy}
                          onChange={() =>
                            dispatch(
                              setStudentAnswer({
                                questionId: question.id,
                                optionIndex: index,
                              })
                            )
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              {error && (
                <p className="workspace-error" role="alert">
                  {error}
                  <button
                    type="button"
                    className="admin-button ml-3"
                    onClick={submit}
                  >
                    Retry submission
                  </button>
                </p>
              )}
              <div className="learner-assessment-submit">
                <p className="admin-muted">
                  {Object.keys(answers).length} of {q.questions.length} answered
                </p>
                <button
                  disabled={busy}
                  className="admin-button admin-button-primary"
                >
                  <Send size={14} />
                  {busy ? 'Submitting…' : 'Submit assessment'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </StudentPage>
  );
}
