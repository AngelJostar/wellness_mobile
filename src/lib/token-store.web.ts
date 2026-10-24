// Browser previews keep tokens in memory; native apps use SecureStore.
let token: string | null = null;

export const tokenStore = {
  get: async () => token,
  set: async (value: string) => { token = value; },
  remove: async () => { token = null; },
};
