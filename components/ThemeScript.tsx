export function ThemeScript() {
  const code = `
    (function() {
      try {
        var theme = localStorage.getItem('reel-ops-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  `;
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
