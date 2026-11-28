import { createSlice } from '@reduxjs/toolkit';

// Server responses are keyed by endpoint, query and request identity.
// Keep this separate from the domain slices, which hold the current UI view.
const apiCacheSlice = createSlice({
  name: 'apiCache',
  initialState: { entries: {}, generation: 0, sessionVersion: 0 },
  reducers: {
    responseCached(state, { payload: { key, data, generation } }) {
      if (state.generation === generation) state.entries[key] = data;
    },
    cacheInvalidated(state) {
      state.entries = {};
      state.generation += 1;
    },
    cacheSessionChanged(state) {
      state.entries = {};
      state.generation += 1;
      state.sessionVersion += 1;
    },
  },
});

export const { responseCached, cacheInvalidated, cacheSessionChanged } =
  apiCacheSlice.actions;
export default apiCacheSlice.reducer;
