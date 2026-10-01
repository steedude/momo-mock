export async function downloadHtmlFile(html: string): Promise<void> {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'product-card.html'
  document.body.append(link)
  link.click()
  link.remove()
  // 留時間讓瀏覽器接手下載，再釋放暫存網址。
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
