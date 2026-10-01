// 只縮排區塊元素，行內文字與星星保持相鄰，避免改變顯示間距。
export function formatCardMarkup(container: HTMLElement): string {
  const copy = container.cloneNode(true) as HTMLElement
  const walker = document.createTreeWalker(copy, NodeFilter.SHOW_COMMENT)
  const comments: Node[] = []
  while (walker.nextNode())
    comments.push(walker.currentNode)
  comments.forEach(comment => comment.parentNode?.removeChild(comment))

  function format(element: Element, depth: number): string {
    const indent = '  '.repeat(depth)
    if (!['ARTICLE', 'DIV'].includes(element.tagName))
      return `${indent}${element.outerHTML}`
    const closing = `</${element.tagName.toLowerCase()}>`
    const empty = (element.cloneNode(false) as Element).outerHTML
    const opening = empty.slice(0, -closing.length)
    const children = Array.from(element.childNodes).map((node) => {
      if (node.nodeType === Node.ELEMENT_NODE)
        return format(node as Element, depth + 1)
      // 透過 DOM 保留文字轉義，避免把商品內容當成 HTML。
      const holder = document.createElement('span')
      holder.append(node.cloneNode(true))
      return holder.innerHTML.trim() ? `${'  '.repeat(depth + 1)}${holder.innerHTML}` : ''
    }).filter(Boolean)
    return [`${indent}${opening}`, ...children, `${indent}${closing}`].join('\n')
  }
  return Array.from(copy.children).map(element => format(element, 2)).join('\n')
}
