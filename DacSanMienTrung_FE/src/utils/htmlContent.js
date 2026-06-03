const blockTagPattern = /<\/?(p|h[1-6]|ul|ol|li|blockquote|strong|em|br|a|img)\b[^>]*>/i

export const sanitizeHtmlContent = (value) => {
  const html = String(value || '').trim()

  if (!html) {
    return ''
  }

  const formattedHtml = blockTagPattern.test(html)
    ? html
    : html
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
        .join('')

  return formattedHtml
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)=["']javascript:[^"']*["']/gi, '')
}
