export default function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
