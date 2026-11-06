jest.mock('expo-secure-store', () => {
  let values: Record<string, string> = {};

  return {
    getItemAsync: jest.fn(async (key: string) => values[key] ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      values[key] = value;
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      delete values[key];
    }),
    __reset: () => {
      values = {};
    },
    __set: (key: string, value: string) => {
      values[key] = value;
    },
    __get: (key: string) => values[key] ?? null,
  };
});
