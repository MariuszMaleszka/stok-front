import { toast } from 'vue3-toastify'
import { h } from 'vue'
import ToastWithAction from '@/components/toasts/Toast.vue'

export function useToast() {
  const showSimpleToast = (message, type = 'info') => {
    toast[type](message, {
      autoClose: 3000,
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
      }
    }), {
      autoClose: 5000, // Set a timeout or keep false
      closeButton: true,
      hideProgressBar: true,
    })
  }

  return {
    showSimpleToast,
    showActionToast,
  }
}
