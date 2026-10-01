# Human–Agent 協作紀錄

本檔是實際協作摘要，不是完整對話匯出。最終需求見 [規格](spec.md)，提交方式見 [README](../README.md)。

## 規劃階段：2026-10-01

工具：Codex。先使用 grill-with-docs 討論，再使用 to-spec 整理本機規格；依使用者要求只規劃，不寫程式。

| 項目 | 使用者的決策與監督 | Agent 的工作 |
| --- | --- | --- |
| 限制 | 指定 Vue 3 + TypeScript、最多兩小時、在 docs 記錄。 | 讀取題目 B 與技能，整理基本需求及架構問題。 |
| 範圍 | 確認一種版型、一組資料、一個編輯區；只編輯名稱、圖片網址、售價與促銷標籤。 | 收斂內容編輯，固定樣式，把時間留給完整流程。 |
| 狀態 | 選擇即時預覽與明確儲存。 | 分離草稿與已儲存快照，定義失敗保留草稿、重新載入還原已儲存內容。 |
| 範圍修正 | 指出不需要商品 A/B 切換，只有一個編輯區。 | 撤回多商品編輯假設與切換確認，收斂為一組示範資料。 |
| 討論節奏 | 指出逐項提問過慢。 | 將剩餘問題整理成兩輪整體確認。 |
| 共用與嵌入 | 選擇 script 掛載，要求釐清 Showroom 與 sample HTML 共用商品卡的意思。 | 說明共用呈現實作、各自帶入資料，並寫入資料流文件。 |
| 定案 | 釐清共用商品卡後回覆「好啊 定案」。 | 優先可重用架構與狀態一致性，Schema 欄位描述列選做，完整 Plugin 延後；整理失敗處理與 120 分鐘安排。 |
| 提交準備 | 詢問 Source Code、Git History 與文件如何交付。 | 查核本機 Git 狀態，建立提交清單與本協作摘要。 |
| 規格整理 | 指定 to-spec，要求本機文件、可操作的驗收、不新增未確認需求且不實作。 | 依既有定案與詞彙表整理 spec，保留必做、選做及不做的邊界，將驗收寫成步驟與預期結果。 |
| 文件精簡 | 指出文件太多，確認收斂為 README 加兩份 docs。 | 合併重複規則、詞彙及提交清單；保留驗收情境、原編號與協作修正，移除重複文件。 |

已實際查核：題目 PDF、repo 與 Git 狀態、Vue／Vite 及 GitHub／Git 官方文件；規格編號與文件連結。

規劃文件隨專案基底一併提交；既有初始化與技能設定 commits 不宣稱為 Agent 共作成果。

## 本機基底建立：2026-10-01

- 使用者：要求 Vue 3、TypeScript、antfu ESLint、i18n、Husky 與 Tailwind；另確認加入 vue-tsc、lint-staged。後續要求先不推送，套件繼續討論。
- Agent：建立 Vite 基底與中英文首頁、Tailwind、型別檢查及 Husky 提交前設定。依 ESLint 相容範圍採 TypeScript 6；未開始商品卡功能。
- 語系修正：使用者確認只需繁體中文；移除英文語系及切換介面，保留 vue-i18n 集中管理 zh-TW 文案。Pinia 維持原本單頁局部狀態的決策，尚未加入。
- Git／SSH：先前只做遠端讀取與 push dry-run，未上傳變更。找到 steedude key，指定後成功驗證 GitHub 帳號，未修改 SSH 設定。
- 驗證：vue-tsc、正式建置及 ESLint 已通過；首次 ESLint 延遲後重跑，修正 TypeScript 設定鍵排序。Husky hook 在無暫存檔案時可執行並通過型別檢查；尚未用實際 commit 驗證攔截流程，使用者也尚未驗收首頁或程式。
- 提交：使用者於編輯器設定調整後授權提交並推送目前基底；本階段對應 `chore: initialize Vue project and development tooling`，包含規格與協作紀錄，附 Codex 共同作者署名。此基底包含實際程式變更，計時與最終功能驗收仍依 README 記錄。
- 編輯器：依使用者要求設定 VS Code 的 ESLint 存檔修正、專案 TypeScript、Tailwind 提示與繁中 i18n Ally；保留既有語系路徑設定的用途，集中指向 locales 目錄。新增四個擴充套件建議，已確認本機皆有安裝；未修改全域設定。設定檔通過 ESLint 與 JSON 解析，SDK／語系路徑存在；尚未透過編輯器實際操作存檔驗證。
- 編輯器修正：使用者指出兩個 TypeScript 設定已淘汰；查核本機 VS Code 1.139.0 內建擴充套件定義，改為 `js/ts.tsdk.path` 與 `js/ts.tsdk.promptToUseWorkspaceVersion`。先前的 ESLint／JSON 檢查無法辨識 VS Code 設定是否已淘汰。
- 編輯器精簡：使用者確認刪除額外的縮排、換行、空白清理、i18n Ally 語系偏好及 TypeScript 版本提醒；保留 ESLint、SDK 路徑、Tailwind 提示與語系路徑，以及四個擴充套件推薦。
- 文案預覽修正：精簡後使用者回報翻譯預覽消失；補回 `i18n-ally.displayLanguage: zh-TW`，指定編輯器預覽繁中文案。外掛的行內註解預設已啟用，未額外加入該設定；實際畫面待使用者確認。
