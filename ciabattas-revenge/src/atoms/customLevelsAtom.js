import { create } from 'zustand';

const useStore = create((set) => ({
  customLevels: [],
  setCustomLevels: (image) => set({ customLevels: image }),
}));

export default useStore;
