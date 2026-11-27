import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { extractItems } from '../utils';

function formatBytes(bytes) {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const resetEditor = createAction('curriculum/resetEditor');
export const addModule = createAction('curriculum/addModule');
export const updateModule = createAction('curriculum/updateModule');
export const deleteModule = createAction('curriculum/deleteModule');
export const applyUploadedItem = createAction('curriculum/applyUploadedItem');
export const clearCurriculumNotices = createAction(
  'curriculum/clearCurriculumNotices'
);

export const fetchCourseEditor = createAsyncThunk(
  'curriculum/fetchEditor',
  async (courseId, { rejectWithValue }) => {
    try {
      return await api.get(
        `/courses/${encodeURIComponent(courseId)}/editor`,
        'instructor'
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load this course.');
    }
  }
);

export const uploadLessonMedia = createAsyncThunk(
  'curriculum/uploadMedia',
  async ({ courseId, file }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append('file', file);
      const uploaded = await api.post(
        `/courses/${encodeURIComponent(courseId)}/upload`,
        form
      );
      const path = (uploaded?.data || uploaded)?.path;
      if (!path) throw new Error('The server did not return an uploaded file.');
      return { path, fileName: file.name, fileSize: formatBytes(file.size) };
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to upload file.');
    }
  }
);

export const saveCurriculumDraft = createAsyncThunk(
  'curriculum/saveDraft',
  async ({ courseId, modules }, { rejectWithValue }) => {
    try {
      await api.put(
        `/courses/${encodeURIComponent(courseId)}/curriculum-draft`,
        { modules },
        'instructor'
      );
      return modules;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to save draft.');
    }
  }
);

export const submitModuleRequest = createAsyncThunk(
  'curriculum/submitModuleRequest',
  async ({ courseId, modules }, { rejectWithValue }) => {
    try {
      const created = await api.post(
        `/courses/${encodeURIComponent(courseId)}/module-requests`,
        { modules },
        'instructor'
      );
      return created || { status: 'Pending' };
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to submit curriculum changes.'
      );
    }
  }
);

export const createModuleAndSaveDraft = createAsyncThunk(
  'curriculum/createModuleAndSaveDraft',
  async ({ courseId, title, description, objectives }, { rejectWithValue }) => {
    try {
      const course = await api.get(
        `/courses/${encodeURIComponent(courseId)}/editor`,
        'instructor'
      );
      const currentModules = course?.modules || [];
      const newMod = {
        id: Date.now(),
        title,
        description,
        objectives: String(objectives || '')
          .split('\n')
          .filter(Boolean),
        items: [],
      };
      const nextModules = [...currentModules, newMod];
      await api.put(
        `/courses/${encodeURIComponent(courseId)}/curriculum-draft`,
        { modules: nextModules },
        'instructor'
      );
      return nextModules;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to save module draft.');
    }
  }
);

export const createLessonAndSaveDraft = createAsyncThunk(
  'curriculum/createLessonAndSaveDraft',
  async (
    {
      courseId,
      targetModuleId,
      lessonType,
      title,
      duration,
      readingContent,
      uploadedFile,
    },
    { rejectWithValue }
  ) => {
    try {
      const course = await api.get(
        `/courses/${encodeURIComponent(courseId)}/editor`,
        'instructor'
      );
      let uploadedUrl = '';
      if (uploadedFile) {
        const form = new FormData();
        form.append('file', uploadedFile);
        const result = await api.post(
          `/courses/${encodeURIComponent(courseId)}/upload`,
          form
        );
        uploadedUrl = (result?.data || result)?.path;
        if (!uploadedUrl) {
          throw new Error('The upload did not return a file URL.');
        }
      }
      const currentModules = Array.isArray(course?.modules)
        ? course.modules.map((m) => ({
            ...m,
            items: Array.isArray(m.items) ? [...m.items] : [],
          }))
        : [];
      if (currentModules.length > 0) {
        const targetMod = targetModuleId
          ? currentModules.find(
              (m) => String(m.id) === String(targetModuleId)
            ) || currentModules[0]
          : currentModules[0];
        const newItem = {
          id: Date.now(),
          type: lessonType === 'video' ? 'Video' : 'Reading',
          title,
          duration: Number(duration) || 10,
          videoUrl: lessonType === 'video' ? uploadedUrl : null,
          resourceUrl: lessonType === 'video' ? null : uploadedUrl,
          fileName: uploadedFile ? uploadedFile.name : '',
          fileSize: uploadedFile ? formatBytes(uploadedFile.size) : '',
          url: '',
          description: readingContent,
          content: readingContent,
        };
        targetMod.items = [...(targetMod.items || []), newItem];
      }
      await api.put(
        `/courses/${encodeURIComponent(courseId)}/curriculum-draft`,
        { modules: currentModules },
        'instructor'
      );
      return currentModules;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to save lesson draft.');
    }
  }
);

export const linkQuizToCurriculumItem = createAsyncThunk(
  'curriculum/linkQuizToItem',
  async ({ courseId, moduleId, itemId, quizId }, { rejectWithValue }) => {
    try {
      if (!moduleId || !itemId) return null;
      const course = await api.get(
        `/courses/${encodeURIComponent(courseId)}/editor`,
        'instructor'
      );
      const modules = (course?.modules || []).map((module) =>
        String(module.id) !== String(moduleId)
          ? module
          : {
              ...module,
              items: (Array.isArray(module.items)
                ? module.items
                : Array.isArray(module.lessons)
                  ? module.lessons
                  : []
              ).map((item) =>
                String(item.id) === String(itemId) ? { ...item, quizId } : item
              ),
            }
      );
      await api.put(
        `/courses/${encodeURIComponent(courseId)}/curriculum-draft`,
        { modules },
        'instructor'
      );
      return modules;
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to link quiz to curriculum.'
      );
    }
  }
);

export const fetchModuleRequests = createAsyncThunk(
  'curriculum/fetchModuleRequests',
  async (courseId = '', { rejectWithValue }) => {
    try {
      const suffix = courseId ? `?${new URLSearchParams({ courseId })}` : '';
      return extractItems(
        await api.get(`/courses/module-requests/mine${suffix}`)
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load module requests.');
    }
  }
);

export const decideModuleRequest = createAsyncThunk(
  'curriculum/decideModuleRequest',
  async ({ requestId, decision, note }, { rejectWithValue }) => {
    try {
      const updated = await api.post(
        `/courses/module-requests/${encodeURIComponent(requestId)}/decision`,
        { decision, note }
      );
      return { requestId, decision, note, updated };
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to save decision.');
    }
  }
);

export const fetchLoggedModuleRequest = createAsyncThunk(
  'curriculum/fetchLoggedModuleRequest',
  async (id, { rejectWithValue }) => {
    try {
      return await api.get(
        `/workspace/logs/requests/${encodeURIComponent(id)}`
      );
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to load curriculum request.'
      );
    }
  }
);
