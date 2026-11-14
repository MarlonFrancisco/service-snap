/** Baixa um arquivo a partir de uma URL (`data:`, `blob:` ou do mesmo domínio). */
export function downloadFromUrl(url: string, fileName: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
