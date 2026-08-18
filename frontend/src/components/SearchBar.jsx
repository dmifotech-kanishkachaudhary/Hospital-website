function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search...",
  formClassName = "patient-search",
  inputWrapperClassName = "search-input-wrapper",
  clearClassName = "clear-search-btn",
}) {
  return (
    <form className={formClassName} onSubmit={onSubmit}>
      <div className={inputWrapperClassName}>
        <span>⌕</span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      <button type="submit">Search</button>

      {value && (
        <button type="button" className={clearClassName} onClick={onClear}>
          Clear
        </button>
      )}
    </form>
  );
}

export default SearchBar;
