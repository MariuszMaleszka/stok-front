import { toast } from 'vue3-toastify'
import { h } from 'vue'
import ToastWithAction from '@/components/toasts/Toast.vue'

export function useToast() {
  const showSimpleToast = (message, type = 'info') => {
    const toastMethod = {
      'success': toast.success,
      'error': toast.error,
      'warning': toast.warning,
      'info': toast.info
    }[type] || toast.info

    toastMethod(message, {
      autoClose: 6000,
      hideProgressBar: true,
    })
  }
  const showActionToast = (content, buttonText, onAction, buttonStyle = '') => {
    const toastId = toast(h(ToastWithAction, {
      buttonText,
      buttonStyle,
      onAction: () => {
        onAction()
        toast.remove(toastId)
      }
    }, () => content), {
      autoClose: false,
      closeButton: true,
      hideProgressBar: true,
    })
  }

  return {
    showSimpleToast,
    showActionToast,
  }
}
