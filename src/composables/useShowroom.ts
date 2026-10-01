import type { Product, ProductDraft, StorageIssue, ValidationErrors } from '../types/product'
import { computed, readonly, ref } from 'vue'
import { defaultProduct } from '../configs/product'
import { createStandaloneHtml } from '../embed'
import { DownloadStatus, SaveStatus } from '../types/product'
import { downloadHtmlFile } from '../utils/download'
import { createEmbedHtml } from '../utils/embedHtml'
import { parseDraft, previewProduct, toProductDraft } from '../utils/product'
import { createProductStorage } from '../utils/storage'

export function useShowroom(source: () => Pick<Storage, 'getItem' | 'setItem'> = () => window.localStorage) {
  const storage = createProductStorage(source)
  const loaded = storage.load()
  const loadWarning = ref<StorageIssue | null>(loaded.ok ? null : loaded.reason)
  const lastSaved = ref<Product | null>(loaded.ok ? loaded.value : null)
  const initial = lastSaved.value ?? defaultProduct(typeof document === 'undefined' ? 'http://localhost/' : document.baseURI)
  const draft = ref<ProductDraft>(toProductDraft(initial))
  const savedDraftBaseline = ref({ ...draft.value })
  const dirty = computed(() => JSON.stringify(draft.value) !== JSON.stringify(savedDraftBaseline.value))
  const preview = computed(() => previewProduct(draft.value))
  const saveStatus = ref(SaveStatus.Idle)
  const downloadStatus = ref(DownloadStatus.Idle)
  const hasAttemptedSave = ref(false)
  const errors = computed<ValidationErrors>(() => {
    const parsed = parseDraft(draft.value)
    return hasAttemptedSave.value && !parsed.ok ? parsed.errors : {}
  })

  function patchDraft(patch: Partial<ProductDraft>) {
    draft.value = { ...draft.value, ...patch }
    saveStatus.value = SaveStatus.Idle
  }

  function save() {
    hasAttemptedSave.value = true
    const parsed = parseDraft(draft.value)
    if (!parsed.ok) {
      saveStatus.value = SaveStatus.Invalid
      return false
    }
    const result = storage.save(parsed.value)
    if (!result.ok) {
      saveStatus.value = SaveStatus.Failed
      return false
    }
    lastSaved.value = { ...parsed.value }
    savedDraftBaseline.value = { ...draft.value }
    loadWarning.value = null
    saveStatus.value = SaveStatus.Saved
    downloadStatus.value = DownloadStatus.Idle
    return true
  }

  function exportHtml(assetBase: string) {
    return lastSaved.value ? createEmbedHtml(lastSaved.value, assetBase) : null
  }

  async function downloadHtml(writeFile: (html: string) => Promise<void> = downloadHtmlFile) {
    const snapshot = lastSaved.value
    if (!snapshot || downloadStatus.value === DownloadStatus.Preparing)
      return false
    downloadStatus.value = DownloadStatus.Preparing
    try {
      const html = await createStandaloneHtml(snapshot)
      await writeFile(html)
      if (lastSaved.value === snapshot)
        downloadStatus.value = DownloadStatus.Downloaded
      return true
    }
    catch {
      if (lastSaved.value === snapshot)
        downloadStatus.value = DownloadStatus.Failed
      return false
    }
  }

  return {
    draft: readonly(draft),
    lastSaved: readonly(lastSaved),
    preview,

    loadWarning: readonly(loadWarning),
    dirty,
    errors,
    saveStatus: readonly(saveStatus),
    downloadStatus: readonly(downloadStatus),

    patchDraft,
    save,
    exportHtml,
    downloadHtml,
  }
}
