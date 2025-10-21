import { create } from "zustand";

const emptyFields = {
  personalHistory: "",
  chiefComplaint: "",
  presentIllness: "",
  medicationHistory: "",
  pastHistory: "",
  familyHistory: "",
  requiredLabTestsAndProcedures: "",
};

const useClaimsReviewStore = create((set) => ({
  open: false,
  transcript: "",
  fields: { ...emptyFields },

  openClaimsReview: ({ transcript = "", fields = {} } = {}) =>
    set({
      open: true,
      transcript,
      fields: { ...emptyFields, ...fields },
    }),

  closeClaimsReview: () =>
    set({
      open: false,
    }),

  resetClaimsReview: () =>
    set({
      open: false,
      transcript: "",
      fields: { ...emptyFields },
    }),
}));

export default useClaimsReviewStore;
