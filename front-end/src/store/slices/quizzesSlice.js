import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  addQuestion,
  createEmptyQuestion,
  deleteQuestion,
  expandInvalidQuestions,
  fetchQuizById,
  fetchStudentAssessment,
  initNewQuiz,
  moveQuestion,
  resetStudentAttempt,
  saveQuiz,
  setPassingScore,
  setQuizCourseId,
  setQuizTitle,
  setShowExplanations,
  setStudentAnswer,
  submitStudentAssessment,
  updateQuestion,
} from '../actions/quizzesActions';

const initialState = {
  builder: {
    editingQuizId: null,
    courseId: null,
    quizTitle: '',
    passingScore: 80,
    showExplanations: true,
    questions: [createEmptyQuestion()],
    loading: false,
    saving: false,
    error: '',
  },
  assessment: {
    data: null,
    loading: false,
    error: '',
  },
  attempt: {
    answers: {},
    result: null,
    submitting: false,
    error: '',
  },
};

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initNewQuiz, (state, action) => {
        state.builder = {
          editingQuizId: null,
          courseId: action.payload || null,
          quizTitle: '',
          passingScore: 80,
          showExplanations: true,
          questions: [createEmptyQuestion()],
          loading: false,
          saving: false,
          error: '',
        };
      })
      .addCase(setQuizCourseId, (state, action) => {
        state.builder.courseId = action.payload;
      })
      .addCase(setQuizTitle, (state, action) => {
        state.builder.quizTitle = action.payload;
      })
      .addCase(setShowExplanations, (state, action) => {
        state.builder.showExplanations = action.payload;
      })
      .addCase(setPassingScore, (state, action) => {
        state.builder.passingScore = action.payload;
      })
      .addCase(addQuestion, (state) => {
        state.builder.questions.push(createEmptyQuestion());
      })
      .addCase(updateQuestion, (state, action) => {
        const updated = action.payload;
        state.builder.questions = state.builder.questions.map((q) =>
          q.id === updated.id ? updated : q
        );
      })
      .addCase(deleteQuestion, (state, action) => {
        if (state.builder.questions.length <= 1) return;
        state.builder.questions = state.builder.questions.filter(
          (q) => q.id !== action.payload
        );
      })
      .addCase(moveQuestion, (state, action) => {
        const { fromIndex, direction } = action.payload;
        const toIndex = fromIndex + direction;
        const list = state.builder.questions;
        if (toIndex < 0 || toIndex >= list.length) return;
        [list[fromIndex], list[toIndex]] = [list[toIndex], list[fromIndex]];
      })
      .addCase(expandInvalidQuestions, (state) => {
        state.builder.questions = state.builder.questions.map((q) => {
          const hasError =
            !q.text.trim() ||
            !q.options.some((o) => o.isCorrect) ||
            q.options.some((o) => !o.text.trim()) ||
            Number.isNaN(q.points) ||
            q.points <= 0;
          return hasError ? { ...q, collapsed: false } : q;
        });
      })
      .addCase(setStudentAnswer, (state, action) => {
        const { questionId, optionIndex } = action.payload;
        state.attempt.answers[questionId] = optionIndex;
      })
      .addCase(resetStudentAttempt, (state) => {
        state.attempt = {
          answers: {},
          result: null,
          submitting: false,
          error: '',
        };
      })

      .addCase(fetchQuizById.pending, (state, action) => {
        state.builder.loading = true;
        state.builder.error = '';
        state.builder.editingQuizId = action.meta.arg;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.builder.loading = false;
        const data = action.payload;
        if (!data) return;
        state.builder.courseId = data.courseId;
        state.builder.quizTitle = data.title || '';
        state.builder.passingScore = data.passingScore || 80;
        state.builder.showExplanations = data.showExplanations ?? true;
        state.builder.questions = (data.questions || []).map((question) => ({
          id: question.id,
          text: question.questionText || question.text || '',
          options: question.options || [
            {
              id: `${question.id}-a`,
              text: question.optionA || '',
              isCorrect: question.correctOption === 'A',
            },
            {
              id: `${question.id}-b`,
              text: question.optionB || '',
              isCorrect: question.correctOption === 'B',
            },
            {
              id: `${question.id}-c`,
              text: question.optionC || '',
              isCorrect: question.correctOption === 'C',
            },
            {
              id: `${question.id}-d`,
              text: question.optionD || '',
              isCorrect: question.correctOption === 'D',
            },
          ],
          points: question.points || 10,
          explanation: question.explanation || '',
          collapsed: false,
        }));
      })
      .addCase(fetchQuizById.rejected, (state) => {
        state.builder.loading = false;
        state.builder.editingQuizId = null;
        state.builder.questions = [createEmptyQuestion()];
      })

      .addCase(saveQuiz.pending, (state) => {
        state.builder.saving = true;
        state.builder.error = '';
      })
      .addCase(saveQuiz.fulfilled, (state, action) => {
        state.builder.saving = false;
        if (action.payload?.id) {
          state.builder.editingQuizId = action.payload.id;
        }
      })
      .addCase(saveQuiz.rejected, (state, action) => {
        state.builder.saving = false;
        state.builder.error =
          action.payload ||
          action.error?.message ||
          'Unable to save assessment.';
      })

      .addCase(fetchStudentAssessment.pending, (state) => {
        state.assessment.loading = true;
        state.assessment.error = '';
      })
      .addCase(fetchStudentAssessment.fulfilled, (state, action) => {
        state.assessment.loading = false;
        state.assessment.data = action.payload;
        state.attempt = {
          answers: {},
          result: null,
          submitting: false,
          error: '',
        };
      })
      .addCase(fetchStudentAssessment.rejected, (state, action) => {
        state.assessment.loading = false;
        state.assessment.error =
          action.payload ||
          action.error?.message ||
          'Unable to load assessment.';
      })

      .addCase(submitStudentAssessment.pending, (state) => {
        state.attempt.submitting = true;
        state.attempt.error = '';
      })
      .addCase(submitStudentAssessment.fulfilled, (state, action) => {
        state.attempt.submitting = false;
        state.attempt.result = action.payload;
      })
      .addCase(submitStudentAssessment.rejected, (state, action) => {
        state.attempt.submitting = false;
        state.attempt.error =
          action.payload || action.error?.message || 'Submission failed.';
      })

      .addCase(clearSession, () => initialState);
  },
});

export default quizzesSlice.reducer;
