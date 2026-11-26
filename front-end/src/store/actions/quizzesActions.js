import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { linkQuizToCurriculumItem } from './curriculumActions';

let nextQuestionId = 100;
let nextOptionId = 1000;

export function createEmptyOption(label = '') {
  return {
    id: `opt_${nextOptionId++}`,
    text: label,
    isCorrect: false,
  };
}

export function createEmptyQuestion() {
  return {
    id: nextQuestionId++,
    text: '',
    options: [
      createEmptyOption(),
      createEmptyOption(),
      createEmptyOption(),
      createEmptyOption(),
    ],
    points: 10,
    explanation: '',
    collapsed: false,
  };
}

export const initNewQuiz = createAction('quizzes/initNewQuiz');
export const setQuizCourseId = createAction('quizzes/setQuizCourseId');
export const setQuizTitle = createAction('quizzes/setQuizTitle');
export const setShowExplanations = createAction('quizzes/setShowExplanations');
export const setPassingScore = createAction('quizzes/setPassingScore');
export const addQuestion = createAction('quizzes/addQuestion');
export const updateQuestion = createAction('quizzes/updateQuestion');
export const deleteQuestion = createAction('quizzes/deleteQuestion');
export const moveQuestion = createAction('quizzes/moveQuestion');
export const expandInvalidQuestions = createAction(
  'quizzes/expandInvalidQuestions'
);
export const setStudentAnswer = createAction('quizzes/setStudentAnswer');
export const resetStudentAttempt = createAction('quizzes/resetStudentAttempt');

export const fetchQuizById = createAsyncThunk(
  'quizzes/fetchById',
  async (quizId, { rejectWithValue }) => {
    try {
      return await api.get(
        `/quizzes/${encodeURIComponent(quizId)}`,
        'instructor'
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load quiz.');
    }
  }
);

export const saveQuiz = createAsyncThunk(
  'quizzes/save',
  async (
    { editingQuizId, courseId, moduleId, itemId, quizPayload },
    { dispatch, rejectWithValue }
  ) => {
    try {
      let saved;
      if (editingQuizId) {
        saved = await api.patch(
          `/quizzes/${encodeURIComponent(editingQuizId)}`,
          quizPayload,
          'instructor'
        );
      } else {
        const created = await api.post(
          '/quizzes',
          { courseId, ...quizPayload },
          'instructor'
        );
        saved = await api.patch(
          `/quizzes/${encodeURIComponent(created.id)}`,
          quizPayload,
          'instructor'
        );
      }
      await dispatch(
        linkQuizToCurriculumItem({
          courseId,
          moduleId,
          itemId,
          quizId: saved.id,
        })
      ).unwrap();
      return saved;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to save assessment.');
    }
  }
);

export const fetchStudentAssessment = createAsyncThunk(
  'quizzes/fetchStudentAssessment',
  async (courseId, { rejectWithValue }) => {
    try {
      return await api.get(
        `/student/assessments/${encodeURIComponent(courseId)}`
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load assessment.');
    }
  }
);

export const submitStudentAssessment = createAsyncThunk(
  'quizzes/submitStudentAssessment',
  async ({ courseId, quizId, answers }, { rejectWithValue }) => {
    try {
      return await api.post(
        `/student/assessments/${encodeURIComponent(courseId)}/submit`,
        { quizId, answers }
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to submit assessment.');
    }
  }
);
