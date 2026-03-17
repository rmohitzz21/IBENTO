import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, X } from 'lucide-react'

/**
 * Search bar component
 *
 * @param {function} onSearch       - called with debounced query string
 * @param {string}   placeholder    - input placeholder
 * @param {string}   buttonLabel    - right button label (default "Search")
 * @param {boolean}  hero           - if true renders the large hero variant
 * @param {string[]} suggestions    - autocomplete suggestions list
 * @param {string}   className      - extra wrapper classes
 * @param {number}   debounceMs     - debounce delay in ms (default 400)
 */
export default function SearchBar({
  onSearch,
  onSubmit,
  placeholder = 'Search vendors, services…',
  buttonLabel = 'Search',
  hero = false,
  suggestions = [],
  className = '',
  debounceMs = 400,
  defaultValue = '',
}) {
  const [query, setQuery] = useState(defaultValue)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  // Debounced onSearch callback
  const handleChange = useCallback(
    (e) => {
      const val = e.target.value
      setQuery(val)
      setShowSuggestions(val.length > 0 && suggestions.length > 0)

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onSearch?.(val)
      }, debounceMs)
    },
    [onSearch, debounceMs, suggestions.length]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(query)
    onSearch?.(query)
    setShowSuggestions(false)
  }

  const handleClear = () => {
    setQuery('')
    onSearch?.('')
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (s) => {
    setQuery(s)
    onSearch?.(s)
    onSubmit?.(s)
    setShowSuggestions(false)
  }

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  )

  if (hero) {
    return (
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center bg-[#FFFEED] rounded-xl shadow-lg overflow-visible ${className}`}
      >
        <Search
          className="absolute left-4 text-[#6A6A6A] shrink-0"
          size={18}
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() =>
            setShowSuggestions(query.length > 0 && filteredSuggestions.length > 0)
          }
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
          className="flex-1 bg-transparent pl-11 pr-4 py-4 text-[#101828] text-base placeholder:text-[#6A6A6A] outline-none"
          aria-label="Search"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-[#6A6A6A] hover:text-[#101828]"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          className="m-2 px-7 py-3 bg-[#F06138] hover:bg-[#F54900] text-[#FDFAD6] font-[Georgia] font-medium text-sm rounded-lg transition-colors"
        >
          {buttonLabel}
        </motion.button>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul
            className="absolute top-full left-0 right-0 mt-2 bg-[#FFFEF5] rounded-xl border border-black/10 shadow-xl z-30 overflow-hidden"
            role="listbox"
          >
            {filteredSuggestions.slice(0, 6).map((s) => (
              <li
                key={s}
                role="option"
                className="flex items-center gap-3 px-4 py-3 text-sm text-[#364153] hover:bg-[#FFF3EF] cursor-pointer transition-colors"
                onMouseDown={() => handleSuggestionClick(s)}
              >
                <Search size={14} className="text-[#6A6A6A] shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        )}
      </form>
    )
  }

  // Standard compact variant
  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center bg-[#FFFEED] border border-[rgba(139,67,50,0.2)] rounded-lg overflow-visible ${className}`}
    >
      <Search
        className="absolute left-3 text-[#6A6A6A] shrink-0"
        size={16}
        aria-hidden="true"
      />

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() =>
          setShowSuggestions(query.length > 0 && filteredSuggestions.length > 0)
        }
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder={placeholder}
        className="flex-1 bg-transparent pl-9 pr-3 py-2.5 text-sm text-[#101828] placeholder:text-[#6A6A6A] outline-none"
        aria-label="Search"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1.5 text-[#6A6A6A] hover:text-[#101828]"
          aria-label="Clear"
        >
          <X size={14} />
        </button>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="m-1 px-4 py-2 bg-[#F06138] hover:bg-[#F54900] text-[#FDFAD6] font-medium text-xs rounded transition-colors"
      >
        {buttonLabel}
      </motion.button>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          className="absolute top-full left-0 right-0 mt-1 bg-[#FFFEF5] rounded-lg border border-black/10 shadow-lg z-30 overflow-hidden"
          role="listbox"
        >
          {filteredSuggestions.slice(0, 6).map((s) => (
            <li
              key={s}
              role="option"
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#364153] hover:bg-[#FFF3EF] cursor-pointer transition-colors"
              onMouseDown={() => handleSuggestionClick(s)}
            >
              <Search size={12} className="text-[#6A6A6A] shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}
