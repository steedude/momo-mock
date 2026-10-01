# momo-mock

momo B 題 Merchant Card Showroom。預計以 Vue 3 + TypeScript，在兩小時實作一種商品卡版型、一組示範資料與一個編輯區，支援四欄位即時預覽、明確儲存及獨立 HTML 的 script 引用。

**目前狀態：已建立 Vue 3 + TypeScript 專案骨架與開發工具設定。** 首頁使用 i18n 管理繁體中文文案，沒有語言切換或其他語系；已完成搜尋商品卡的初步實站觀察並確認簡化直式版型，詳見規格。商品卡功能與獨立 sample HTML 尚未實作。

## 文件與啟動

- [功能規格](docs/spec.md)：必做功能、架構、取捨、不做項目及操作／測試驗收。
- [開發規則](AGENTS.md)：資料夾責任、列舉放置與依賴邊界。
- [Human–Agent 協作紀錄](docs/agent-collaboration.md)：人的決策、修正與 Agent 貢獻。

本機環境：Node.js 22.22.3、pnpm 11.8.0；專案要求 Node.js >=22.22.1，pnpm 版本由 packageManager 固定。

| 指令 | 用途 |
| --- | --- |
| `pnpm install` | 安裝依賴並透過 prepare 啟用 Husky。 |
| `pnpm dev` | 啟動 Vite，預設 http://localhost:5173。 |
| `pnpm lint` / `pnpm lint:fix` | 使用 antfu ESLint 檢查／自動修正。 |
| `pnpm typecheck` | 使用 vue-tsc 檢查整個 Vue／TypeScript 專案。 |
| `pnpm build` | 先型別檢查，再產出正式建置。 |
| `pnpm preview` | 預覽建置產物，預設 http://localhost:4173。 |

已加入 Vue 3、TypeScript 6、Vite、vue-i18n、Tailwind CSS 4、antfu ESLint、vue-tsc、lint-staged 與 Husky。TypeScript 6 符合目前 ESLint 支援範圍；未加入 Router、Pinia 或其他功能套件。

i18n 只載入 `zh-TW`，文案集中在繁中語系檔，關閉其他語系 fallback。商品狀態仍依規格由 Showroom 局部管理；目前沒有需要 Pinia 的跨頁共享狀態。

VS Code 工作區設定已加入：手動存檔時由 ESLint 修正、專案 TypeScript 路徑、Tailwind 提示與 i18n Ally 語系路徑。建議擴充套件列於 `.vscode/extensions.json`；開啟 TypeScript 檔案後，可透過 `TypeScript: Select TypeScript Version` 選擇工作區版本。

Husky 的 pre-commit 依序執行 lint-staged（只對暫存區的支援檔案執行 `eslint --fix`），再執行整個專案的 `pnpm typecheck`；任一失敗就阻止 commit。vue-tsc 不放進逐檔 lint-staged 任務，避免把檔名當成型別檢查參數。正式建置另行執行，目前不設 pre-push。

## 提交清單

- [ ] Source code、建置設定、依賴 lockfile、sample HTML、README 與 docs 已納入 Git。
- [ ] 從乾淨 checkout 可依指令通過型別檢查、建置並開啟兩個頁面；sample 使用正式 JS／CSS 產物。
- [ ] 補上 momo 參考來源、觀察日期、類型差異、所選版型及簡化說明。
- [ ] 對照規格填寫實際驗收結果、已完成 Bonus、未完成項目與已知限制，不將計畫列為成果。
- [ ] 保留分階段 commits 與 Agent 協作紀錄，記錄實際驗證、人的修正與對應 commit。
- [ ] 交付指定最終 commit 的 GitHub Repo，確認評估者可存取；或交付可還原原始碼與 Git 歷史的 Zip，並實際還原驗證。

建議沿設計定案、商品卡與 script、編輯預覽、儲存與錯誤處理、驗收文件等里程碑提交，數量依實際完成情況調整。

Codex 參與的 commit 使用共同作者署名 `Co-authored-by: Codex <noreply@openai.com>`，並在協作紀錄說明任務、貢獻、人的檢查及驗證結果。參考 [GitHub 多作者 commit](https://docs.github.com/en/pull-requests/how-tos/commit-changes/creating-a-commit-with-multiple-authors)。

Zip 可包含完整 `.git`，或原始碼、完整 Git bundle 與還原說明；僅檔案快照或文字 log 不足以保留可檢查差異的歷史，bundle 也不包含未 commit 的檔案。參考 [Git bundle](https://git-scm.com/docs/git-bundle)。

## 時間與版本紀錄

origin 為 `git@github.com:steedude/momo-mock.git`；本機 steedude SSH key 已通過 GitHub 帳號驗證，評估者權限尚未確認。既有準備 commits：

- `8dad3b4` Initial commit：2026-10-01 12:06:53 +08:00。
- `cc5c0f3` add skill：2026-10-01 12:23:24 +08:00。

實作開始／完成時間與對應 commit 待實際執行後填寫。考題以 First Commit 計時的採認方式由出題方決定，不能假定準備 commits 一定排除；保留真實歷史及階段說明。

## 限制與後續演進

本作將「所有商品卡」解讀為作品提供的版型，目前僅一種。樣式固定，sample 自行提供資料；未儲存草稿關閉／重新整理即捨棄。多分頁沒有同步及衝突合併，後續儲存可能覆蓋另一分頁的內容。

演進順序：先補欄位描述與驗證 schema（若本次未完成），有第二種版型需求時再做版型註冊，之後依實際使用情境加入跨分頁衝突處理與版本遷移；均非本次必做承諾。
