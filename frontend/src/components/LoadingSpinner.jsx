function LoadingSpinner({ text = "Loading...", className = "admin-loading" }) {
  return (
    <div className={className}>
      {text}
    </div>
  );
}

export default LoadingSpinner;
