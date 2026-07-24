export function insertTextAtCursor(
  element: HTMLTextAreaElement | HTMLInputElement,
  text: string,
  currentValue: string,
): string {
  const start = element.selectionStart ?? currentValue.length
  const end = element.selectionEnd ?? currentValue.length
  const next = `${currentValue.slice(0, start)}${text}${currentValue.slice(end)}`

  requestAnimationFrame(() => {
    const position = start + text.length
    element.focus()
    element.setSelectionRange(position, position)
  })

  return next
}
