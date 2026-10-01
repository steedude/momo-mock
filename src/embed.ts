import { parseProduct } from './utils/product'

export async function createStandaloneHtml(data: unknown): Promise<string> {
  const parsed = parseProduct(data)
  if (!parsed.ok)
    throw new Error('Invalid product')
  const response = await fetch(`${import.meta.env.BASE_URL}embed/product-card.iife.js`)
  if (!response.ok || !response.headers.get('Content-Type')?.includes('javascript'))
    throw new Error('Unable to load card script')
  const runtime = await response.text()
  // 商品文字不能提前結束 script 標籤；下載後不需再讀取 localStorage。
  const productJson = JSON.stringify(parsed.value, null, 2).replace(/</g, '\\u003c')
  return `<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>商品卡</title>
  </head>
  <body>
    <momo-product-card id="product-card"></momo-product-card>
    <noscript>請啟用 JavaScript 以顯示商品卡。</noscript>

    <!-- 商品資料：最後一次成功儲存的內容 -->
    <script id="product-data" type="application/json">
${productJson.split('\n').map(line => `      ${line}`).join('\n')}
    </script>

    <!-- 元件註冊完成後，把商品資料交給自訂元素 -->
    <script>
      customElements.whenDefined('momo-product-card').then(() => {
        const product = JSON.parse(document.getElementById('product-data').textContent)
        document.getElementById('product-card').product = product
      })
    </script>

    <!-- Web Component 程式（含 Vue 與 Shadow DOM 樣式），無須手動修改 -->
    <script>
${runtime.replace(/<\/script/gi, '<\\/script')}
    </script>
  </body>
</html>`
}
