import React, { forwardRef } from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-semibold text-gray-800 tracking-tight"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            {...props}
            className={`w-full border border-gray-300 ${
              icon ? 'pl-10' : 'pl-3'
            } pr-3 py-2 rounded-full shadow-sm placeholder-gray-400 
            text-sm bg-white/90 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
            hover:shadow-md transition-all duration-200 
            ${error ? 'border-red-500 focus:ring-red-200' : ''} ${className}`}
          />
        </div>

        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
