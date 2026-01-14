import type { ToastType } from '../components/Toast';

export const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
  const event = new CustomEvent('show-toast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};
