import type { Product } from '../types/product'

export function createEmbedHtml(product: Product, assetBase: string): string {
  const scriptUrl = new URL('embed/product-card.iife.js', assetBase).href
  const styleUrl = new URL('embed/product-card.css', assetBase).href
  return `<!doctype html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>商品卡引用範例</title>
  <link rel="stylesheet" href="${styleUrl}">
</head>
<body>
  <div id="product-card"></div>
  <script id="product-data" type="application/json">${JSON.stringify(product, null, 2).replace(/</g, '\\u003c')}</script>
  <script src="${scriptUrl}"></script>
  <script>
    const product = JSON.parse(document.getElementById('product-data').textContent)
    const result = MomoCard.mountProductCard(document.getElementById('product-card'), product)
    if (!result.ok) console.error('商品資料不正確', result.errors)
    // 需要移除商品卡時：if (result.ok) result.unmount()
  </script>
</body>
</html>`
}
