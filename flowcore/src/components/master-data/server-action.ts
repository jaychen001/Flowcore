export function toVoidAction(action: (formData: FormData) => Promise<unknown>) {
  return async (formData: FormData) => {
    await action(formData);
  };
}
