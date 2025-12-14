import { h } from 'vue'
import { toast } from 'vue3-toastify'
import ToastWithAction from '@/components/toasts/Toast.vue'

export function useToast () {
  const showSimpleToast = (message, type = 'info') => {
    const toastMethod = {
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
    }[type] || toast.info

    toastMethod(message, {
      autoClose: 6000,
      hideProgressBar: true,
    })
  }

  const showActionToast = (message, buttonText, onAction) => {
    const toastId = toast(h(ToastWithAction, {
      message,
      buttonText,
      onAction: () => {
        onAction()
        toast.dismiss(toastId)
      },
    }), {
      autoClose: false, // Set a timeout or keep false
      closeButton: true,
      hideProgressBar: true,
    })
  }

  return {
    showSimpleToast,
    showActionToast,
  }
}
