# momo-mock

momo B 題 Merchant Card Showroom，以 Vue 3 + TypeScript 實作一種商品卡、一組資料及一個編輯區。九個欄位即時預覽，按下儲存才寫入 localStorage；獨立 HTML 用 Web Component 帶入自己的商品資料，共用同一份商品卡。

**已完成：** 商品卡、九欄編輯、驗證、儲存／還原與錯誤處理、已儲存卡片的 HTML 下載、正式 script／CSS。4 個測試檔共 111 個案例；驗收結果見 [規格](docs/spec.md#實際驗收結果)。Schema／Plugin 選做未實作。

## 啟動與驗證

實測 Node.js **22.22.3**、pnpm **11.8.0**。Node 支援範圍為 `^22.22.2 || ^24.15.0 || >=26.0.0`，pnpm 版本由 packageManager 固定。

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm build
pnpm preview
```

開啟終端顯示的網址，預設為：

- Showroom：http://localhost:4173/
- Web Component 引用範例：在 Showroom 儲存商品後，按「下載 HTML」。

`pnpm build` 會先執行 vue-tsc，再建立 Showroom 與商品卡 script 產物；整個 `dist/` 可部署到靜態 HTTP 伺服器。Showroom 需 HTTP；從 Showroom 下載的 `product-card.html` 則可直接雙擊開啟，圖片需網路連線。若連接埠被占用，依終端顯示網址為準。

| 指令 | 用途 |
| --- | --- |
| `pnpm dev` | 先建置商品卡，再啟動 Vite，預設 localhost:5173。 |
| `pnpm test` / `pnpm test:watch` | 先建置商品卡，再執行 Vitest 單次／監看測試；修改嵌入程式後需重啟監看以更新產物。 |
| `pnpm lint` / `pnpm lint:fix` | antfu ESLint 檢查／修正。 |
| `pnpm typecheck` | vue-tsc 檢查 Vue、TypeScript 與測試。 |
| `pnpm build` / `pnpm preview` | 正式建置／預覽 Showroom。 |

工具包含 Vue、TypeScript、Vite、vue-i18n、Tailwind CSS 4、antfu ESLint、vue-tsc、Vitest、Vue Test Utils、jsdom、lint-staged、Husky。i18n 只有 zh-TW；不加入 Router 或 Pinia。VS Code 的專案設定提供 ESLint 存檔修正、TypeScript 路徑、Tailwind 提示與 i18n Ally 繁中預覽。

Husky pre-commit 依序執行暫存檔案的 ESLint 修正與整個專案的型別檢查。測試及正式建置依上方指令執行，不設 pre-push 或覆蓋率門檻。

## 操作與嵌入

修改名稱、HTTP(S) 圖片網址、售價與促銷文字，左側即時更新；促銷留空會隱藏。按「儲存內容」成功後，重新整理會還原這份資料。未儲存修改會捨棄，無效輸入或儲存失敗會保留草稿。圖片載入失敗顯示佔位圖，仍允許儲存有效網址。

原價、星等／評價數、商品標籤與銷量也可編輯；選填數字留空會隱藏，標籤以中英文逗號或換行分隔。所有修改需成功儲存才更新引用內容。既有存檔缺少的選填欄位保持空白，不再補入示範值，避免清空後重新出現。

下方「下載商品卡」只使用**最後一次成功儲存的快照**。按「下載 HTML」取得 `product-card.html`，內含共用商品卡的完整 JS、CSS 與已儲存商品資料，開啟時以 `<momo-product-card>` 自訂元素呈現，可直接雙擊開啟。圖片保留原始 HTTP(S) 網址，不下載或轉換 Base64，開啟檔案時需網路且來源圖片仍可存取；產生檔案不需要圖片 CORS 授權。尚未儲存時禁止下載，下載後不會跟隨 Showroom 更新，需重新儲存下載。

下載檔就是題目要求的 sample HTML：資料以縮排 JSON 放在 `product-data`，自訂元素的資料設定程式位於其後，完整商品卡程式放在最後。不再提供固定資料的獨立範例頁或按鈕；下載檔不讀 localStorage，也不依賴原網站的 JS／CSS，但需要啟用 JavaScript。產生檔案時需能取得同站的商品卡 JS，失敗會顯示下載錯誤並保留存檔。修改商品卡後須重新執行 `pnpm dev` 或 `pnpm build` 更新下載用產物。以下示範外部網頁載入 Web Component 的方式，不必另外引用 CSS。

選填商品欄位：`originalPrice`（有限且不小於零，僅高於售價時顯示）、`rating`（0–5、每 0.5 一級）、`reviewCount`／`salesCount`（非負安全整數）、`badges`（非空白字串陣列）。缺省欄位不顯示；四個原有欄位仍為必要資料。商品名稱最多兩行，title 保留完整內容。

獨立頁面引用正式產物，不需建立 Vue 專案；JS 已包含 Vue 執行環境及必要文案。以下路徑以部署後的位置為準：

```html
<script src="./embed/product-card.iife.js"></script>
<momo-product-card id="card"></momo-product-card>
<script>
  customElements.whenDefined('momo-product-card').then(() => {
    document.getElementById('card').product = {
      name: '輕量耳機',
      imageUrl: 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp',
      price: 599,
      promotion: '限時優惠',
    }
  })
</script>
```

`momo-product-card` 由 Vue 的 `defineCustomElement()` 建立，內含共用 ProductCard 及 Shadow DOM 樣式。以 `.product = 商品物件` 傳入或更新資料；不支援以 HTML 字串屬性傳入商品 JSON。資料無效時顯示錯誤；移除元素時自動卸載，重新加入時重新呈現。元件不讀取 Showroom 的 localStorage。

## 架構與取捨

| 部分 | 責任 |
| --- | --- |
| ProductCard | 接收資料、呈現固定版型、圖片失敗佔位；局部 CSS。 |
| ProductEditor | 九個欄位與錯誤提示，以事件交出修改及儲存操作。 |
| useShowroom | 持有文字草稿、已儲存快照與提示；驗證及寫入成功後才更新快照。 |
| utils/storage | localStorage 讀寫、JSON／版本檢查、錯誤結果；不自動覆寫損壞資料。 |
| embed | 驗證快照並產生內含資料與 Web Component 的下載 HTML。 |
| web-component | 註冊自訂元素、驗證 product、管理生命週期與 Shadow DOM 樣式；共用 ProductCard。 |

資料流為「Editor → patchDraft → 預覽 → Card」；按儲存後「驗證 → storage.save → 成功才更新快照」。售價草稿保留文字，避免把輸入中的空白轉成零。儲存 key 為 `momo-showroom:product`，格式 `{ version: 1, product }`。

- **Reusable Card Architecture 已實作：** 兩入口共用 ProductCard，獨立頁自帶資料，正式 JS／CSS 可直接引用。
- **State Consistency Strategy 已實作：** 草稿與快照分離；寫入失敗可重試；損壞或不支援版本的內容以警告及示範值降級，不自動覆寫。
- **Schema / Plugin Extensibility 未實作：** 編輯欄位由編輯器定義，數字欄位共用排版；這不等於通用 Schema／Plugin。

固定一種版型、一筆商品及單頁狀態，避免引入全域狀態與通用插件架構。Showroom 使用 Tailwind utilities；卡片使用語意 class 與傳統 CSS，不包含全域 reset 或依賴宿主的主題變數。Web Component 使用 Shadow DOM 隔離宿主的一般樣式選擇器。範例圖片使用使用者指定的 DummyJSON CDN 網址，momo 僅作版型觀察。

限制：資料只存在同一 origin 的瀏覽器中，localhost 與 127.0.0.1、不同埠號各有自己的存檔；無雲端、跨分頁同步、草稿復原或版本遷移。多分頁最後一次成功儲存可能覆蓋另一分頁。後續先依需求加入欄位 schema，有第二種版型再做註冊，之後才考慮衝突處理及版本遷移。

## 文件、歷史與交付

- [規格](docs/spec.md)：實站來源、範圍、不做項目與逐項驗收結果。
- [開發規則](AGENTS.md)：資料夾責任、enum 與自動使用 TDD 的規則。
- [Human–Agent 協作紀錄](docs/agent-collaboration.md)：人的決策與修正、Agent 貢獻、實際驗證及階段提交。

Agent 參與的提交附 `Co-authored-by: Codex <noreply@openai.com>`；詳細內容在協作紀錄，不只共同作者署名。功能分為 `e7a4a79` 商品卡與嵌入、`50811e4` 編輯與儲存，再補驗收文件。

第二輪 `91790ba` 依使用者回饋補齊卡片資訊、Tailwind 與已儲存內容的 HTML 複製，並修正 sample 開發路徑及快取；獨立驗證副本通過 89 案例及正式建置。

原始準備歷史保留：`8dad3b4` 於 2026-10-01 12:06:53、`cc5c0f3` 於 12:23:24（Asia/Taipei）。功能實作於同日 13:38 開始；完成時間見協作紀錄。考題從 First Commit 起算的採認由出題方決定，不能假定準備提交一定排除。

origin 為 `git@github.com:steedude/momo-mock.git`。交付可選 GitHub 指定最終 commit 並確認評估者權限，或提供含完整 `.git` 的 Zip／原始碼加完整 Git bundle。僅檔案快照或文字 log 不算 Git History；尚未推送的本機成果不能當作已交付的遠端版本。
