export default function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-feedback">
      <svg aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7.5" />
        <path strokeLinecap="round" d="M10 6.5v4M10 13.5h.01" />
      </svg>
      <span>{children}</span>
    </p>
  );
}
