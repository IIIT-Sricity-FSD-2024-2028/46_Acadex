import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  addModule,
  applyUploadedItem,
  clearCurriculumNotices,
  createLessonAndSaveDraft,
  createModuleAndSaveDraft,
  decideModuleRequest,
  deleteModule,
  fetchCourseEditor,
  fetchLoggedModuleRequest,
  fetchModuleRequests,
  linkQuizToCurriculumItem,
  resetEditor,
  saveCurriculumDraft,
  submitModuleRequest,
  updateModule,
  uploadLessonMedia,
} from '../actions/curriculumActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

function normalizeEditorModules(rawModules) {
  return (Array.isArray(rawModules) ? rawModules : []).map((mod, idx) => ({
    ...mod,
    id: mod.id || idx + 1,
    title: mod.title || `Module ${idx + 1}`,
    description: mod.description || '',
    objectives: Array.isArray(mod.objectives) ? mod.objectives : [],
    items: Array.isArray(mod.items)
      ? mod.items
      : Array.isArray(mod.lessons)
        ? mod.lessons
        : [],
  }));
}

const initialState = {
  course: null,
  modules: [],
  pendingRequest: null,
  dirty: false,
  loading: false,
  saving: false,
  uploading: false,
  error: '',
  saveError: '',
  saveSuccessMessage: '',
  moduleRequests: createResourceState([]),
  loggedRequest: createResourceState(null),
  decisionBusy: false,
  decisionError: '',
};

const curriculumSlice = createSlice({
  name: 'curriculum',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(
      builder,
      fetchModuleRequests,
      (s) => s.moduleRequests
    );
    bindResourceLifecycle(
      builder,
      fetchLoggedModuleRequest,
      (s) => s.loggedRequest,
      { resetOnPending: true }
    );

    builder
      .addCase(resetEditor, (state) => {
        state.course = null;
        state.modules = [];
        state.pendingRequest = null;
        state.dirty = false;
        state.loading = true;
        state.error = '';
        state.saveError = '';
        state.saveSuccessMessage = '';
      })
      .addCase(addModule, (state) => {
        state.modules.push({
          id: crypto.randomUUID(),
          title: `Module ${state.modules.length + 1}: New Module`,
          description: '',
          objectives: [],
          items: [],
        });
        state.dirty = true;
        state.saveSuccessMessage = '';
      })
      .addCase(updateModule, (state, action) => {
        const updated = action.payload;
        state.modules = state.modules.map((m) =>
          m.id === updated.id ? updated : m
        );
        state.dirty = true;
        state.saveSuccessMessage = '';
      })
      .addCase(deleteModule, (state, action) => {
        state.modules = state.modules.filter((m) => m.id !== action.payload);
        state.dirty = true;
        state.saveSuccessMessage = '';
      })
      .addCase(applyUploadedItem, (state, action) => {
        const updatedItem = action.payload;
        state.modules = state.modules.map((mod) => ({
          ...mod,
          items: (Array.isArray(mod.items) ? mod.items : []).map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          ),
        }));
        state.dirty = true;
      })
      .addCase(clearCurriculumNotices, (state) => {
        state.saveError = '';
        state.saveSuccessMessage = '';
        state.decisionError = '';
      })

      .addCase(fetchCourseEditor.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchCourseEditor.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        if (!data) return;
        state.course = data;
        state.pendingRequest = data.pendingModuleRequest || null;
        if (!state.dirty) {
          state.modules = normalizeEditorModules(data.modules);
        }
      })
      .addCase(fetchCourseEditor.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || 'Unable to load course.';
      })

      .addCase(uploadLessonMedia.pending, (state) => {
        state.uploading = true;
      })
      .addCase(uploadLessonMedia.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(uploadLessonMedia.rejected, (state) => {
        state.uploading = false;
      })

      .addCase(saveCurriculumDraft.pending, (state) => {
        state.saving = true;
        state.saveError = '';
        state.saveSuccessMessage = '';
      })
      .addCase(saveCurriculumDraft.fulfilled, (state) => {
        state.saving = false;
        state.dirty = false;
        state.saveSuccessMessage = 'Draft saved. Learner content is unchanged.';
      })
      .addCase(saveCurriculumDraft.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          action.payload || action.error?.message || 'Unable to save draft.';
      })

      .addCase(submitModuleRequest.pending, (state) => {
        state.saving = true;
        state.saveError = '';
        state.saveSuccessMessage = '';
      })
      .addCase(submitModuleRequest.fulfilled, (state, action) => {
        state.saving = false;
        state.dirty = false;
        state.pendingRequest = action.payload || { status: 'Pending' };
        state.saveSuccessMessage = 'Changes submitted to your organization.';
      })
      .addCase(submitModuleRequest.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          action.payload ||
          action.error?.message ||
          'Unable to submit curriculum changes.';
      })

      .addCase(createModuleAndSaveDraft.pending, (state) => {
        state.saving = true;
        state.saveError = '';
      })
      .addCase(createModuleAndSaveDraft.fulfilled, (state, action) => {
        state.saving = false;
        state.modules = normalizeEditorModules(action.payload);
        state.dirty = false;
      })
      .addCase(createModuleAndSaveDraft.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          action.payload || action.error?.message || 'Unable to save module.';
      })

      .addCase(createLessonAndSaveDraft.pending, (state) => {
        state.saving = true;
        state.saveError = '';
      })
      .addCase(createLessonAndSaveDraft.fulfilled, (state, action) => {
        state.saving = false;
        state.modules = normalizeEditorModules(action.payload);
        state.dirty = false;
      })
      .addCase(createLessonAndSaveDraft.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          action.payload || action.error?.message || 'Unable to save lesson.';
      })

      .addCase(linkQuizToCurriculumItem.fulfilled, (state, action) => {
        if (action.payload) {
          state.modules = normalizeEditorModules(action.payload);
          state.dirty = false;
        }
      })

      .addCase(decideModuleRequest.pending, (state) => {
        state.decisionBusy = true;
        state.decisionError = '';
      })
      .addCase(decideModuleRequest.fulfilled, (state, action) => {
        state.decisionBusy = false;
        const { requestId, decision, note, updated } = action.payload;
        if (Array.isArray(state.moduleRequests.data)) {
          state.moduleRequests.data = state.moduleRequests.data.map((req) =>
            req.id === requestId
              ? updated?.id
                ? updated
                : {
                    ...req,
                    status: decision === 'approve' ? 'Approved' : 'Rejected',
                    note,
                  }
              : req
          );
        }
      })
      .addCase(decideModuleRequest.rejected, (state, action) => {
        state.decisionBusy = false;
        state.decisionError =
          action.payload || action.error?.message || 'Unable to save decision.';
      })

      .addCase(clearSession, () => initialState);
  },
});

export default curriculumSlice.reducer;
