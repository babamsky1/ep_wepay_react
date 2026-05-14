import * as React from "react"
import { cn } from "@/helpers/utils"
import { Input } from "@/components/shared_components/input"

interface YearPickerProps {
  value?: number
  onChange?: (year: number | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minYear?: number
  maxYear?: number
}

export function YearPicker({
  value,
  onChange,
  placeholder = "Select year",
  className,
  disabled,
  minYear = 2020,
  maxYear = new Date().getFullYear()
}: YearPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value?.toString() || "")
  
  const years = React.useMemo(() => {
    const yearList = []
    for (let year = maxYear; year >= minYear; year--) {
      yearList.push(year)
    }
    return yearList
  }, [minYear, maxYear])

  React.useEffect(() => {
    setInputValue(value?.toString() || "")
  }, [value])

  const handleYearSelect = (year: number) => {
    onChange?.(year)
    setInputValue(year.toString())
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    const year = parseInt(value)
    if (!isNaN(year) && year >= minYear && year <= maxYear) {
      onChange?.(year)
    }
  }

  return (
    <div className="relative">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-20 px-2 py-1 text-sm",
          className
        )}
      />
      
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="py-1">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => handleYearSelect(year)}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                  value === year && "bg-blue-50 text-blue-600 font-medium"
                )}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
