import toast from 'react-hot-toast';

// Custom toast configurations with dark mode support
const toastConfig = {
  // Success toast
  success: (message) => {
    return toast.success(message, {
      duration: 3000,
      style: {
        background: 'var(--toast-bg, #10B981)',
        color: 'var(--toast-text, #ffffff)',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#10B981',
      },
    });
  },

  // Error toast
  error: (message) => {
    return toast.error(message, {
      duration: 4000,
      style: {
        background: 'var(--toast-bg, #EF4444)',
        color: 'var(--toast-text, #ffffff)',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#EF4444',
      },
    });
  },

  // Info toast
  info: (message) => {
    return toast(message, {
      duration: 3000,
      icon: 'ℹ️',
      style: {
        background: 'var(--toast-bg, #3B82F6)',
        color: 'var(--toast-text, #ffffff)',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
    });
  },

  // Warning toast
  warning: (message) => {
    return toast(message, {
      duration: 3500,
      icon: '⚠️',
      style: {
        background: 'var(--toast-bg, #F59E0B)',
        color: 'var(--toast-text, #ffffff)',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
    });
  },

  // Loading toast
  loading: (message) => {
    return toast.loading(message, {
      style: {
        background: 'var(--toast-bg, #6B7280)',
        color: 'var(--toast-text, #ffffff)',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
    });
  },

  // Promise toast - useful for async operations
  promise: (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred',
      },
      {
        style: {
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          duration: 3000,
        },
        error: {
          duration: 4000,
        },
      }
    );
  },

  // Dismiss specific toast
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },
};

// Export both individual methods and the toast object
export const showToast = toastConfig;
export default toast;

