import * as React from 'react'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, ...props }, ref) => {
    return (
      <div className={`inline-flex items-center ${props.disabled ? 'opacity-60' : ''}`}>
        <input
          {...props}
          ref={ref}
          type="checkbox"
          className={
            `w-4 h-4 text-blue-600 rounded border border-zinc-300 focus:ring-2 focus:ring-blue-500 ${className}`
          }
        />
        {label && <span className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">{label}</span>}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
