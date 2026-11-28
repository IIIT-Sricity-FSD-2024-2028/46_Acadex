export function extractItems(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

export function getErrorMessage(err, fallback = 'Unable to load records.') {
  return err?.message || fallback;
}

export function createResourceState(initialData = null) {
  return {
    data: initialData,
    loading: false,
    error: '',
  };
}

export function bindResourceLifecycle(
  builder,
  thunk,
  selectSlot,
  { resetOnPending = false } = {}
) {
  builder
    .addCase(thunk.pending, (state) => {
      const slot = selectSlot(state);
      slot.loading = true;
      slot.error = '';
      if (resetOnPending) slot.data = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      const slot = selectSlot(state);
      slot.data = action.payload;
      slot.loading = false;
      slot.error = '';
    })
    .addCase(thunk.rejected, (state, action) => {
      const slot = selectSlot(state);
      slot.loading = false;
      slot.error =
        action.payload || action.error?.message || 'Unable to load records.';
      if (resetOnPending) slot.data = null;
    });
}
