import Button from 'react-bootstrap/Button';

export default function ThemeToggle({ theme, onToggle, className = '' }) {
  const isDark = theme === 'dark';
  const label = isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';

  return (
    <Button
      type="button"
      variant={isDark ? 'outline-light' : 'outline-secondary'}
      className={`d-inline-flex align-items-center justify-content-center gap-2 text-nowrap ${className}`}
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon-stars'}`} aria-hidden="true" />
      <span>{isDark ? 'Sáng' : 'Tối'}</span>
    </Button>
  );
}
