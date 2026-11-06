import { create } from 'zustand';
import {
  closeAuthAction,
  createAuthSessionAction,
  googleLoginAction,
  onAuthDefaultAction,
  openAuthAction,
  registerAction,
  validateAuthSessionAction,
} from './auth.actions';
import { IAuthState } from './auth.types';

export const useAuthStore = create<IAuthState>((set, get) => {
  return {
    isOpen: false,
    fetchingStatus: 'idle',
    isNewUser: false,
    authSource: 'other',
    onAuth: onAuthDefaultAction(set, get),
    googleLoginAction: googleLoginAction(set, get),
    openAuthAction: openAuthAction(set, get),
    closeAuthAction: closeAuthAction(set, get),
    createAuthSessionAction: createAuthSessionAction(set, get),
    validateAuthSessionAction: validateAuthSessionAction(set, get),
    registerAction: registerAction(set, get),
  };
});
