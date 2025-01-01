import { create } from 'zustand';


const useLanguageStore = create((set) => ({
  selectedLanguage: "en-US", // Default language
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
}));

export default useLanguageStore;