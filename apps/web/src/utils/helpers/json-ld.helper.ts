/** JSON para `<script type="application/ld+json">`, sem deixar `</script>` fechar a tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
