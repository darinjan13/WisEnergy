let registerDraft = null;

export const setRegisterDraft = (draft) => {
  registerDraft = draft;
};

export const getRegisterDraft = () => registerDraft;

export const clearRegisterDraft = () => {
  registerDraft = null;
};
