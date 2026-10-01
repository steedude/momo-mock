import type { Product, ProductDraft, StorageIssue, ValidationErrors } from '../types/product'
import { computed, readonly, ref } from 'vue'
import { defaultProduct } from '../configs/product'
import { CopyStatus, SaveStatus } from '../types/product'
import { createEmbedHtml } from '../utils/embedHtml'
import { parseDraft, previewProduct } from '../utils/product'
import { createProductStorage } from '../utils/storage'

export function useShowroom(source: () => Pick<Storage, 'getItem' | 'setItem'> = () => window.localStorage) {
  const storage = createProductStorage(source)
  const loaded = storage.load()
  const loadWarning = ref<StorageIssue | null>(loaded.ok ? null : loaded.reason)
  const lastSaved = ref<Product | null>(loaded.ok ? loaded.value : null)
  const initial = { ...defaultProduct(typeof document === 'undefined' ? 'http://localhost/' : document.baseURI), ...lastSaved.value }
  const draft = ref<ProductDraft>({ ...initial, price: String(initial.price) })
  const savedDraftBaseline = ref(lastSaved.value ? { ...lastSaved.value, price: String(lastSaved.value.price) } : { ...draft.value })
  const dirty = computed(() => JSON.stringify(draft.value) !== JSON.stringify(savedDraftBaseline.value))
  const preview = computed(() => previewProduct(draft.value))
  const saveStatus = ref(SaveStatus.Idle)
  const copyStatus = ref(CopyStatus.Idle)
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
    copyStatus.value = CopyStatus.Idle
    return true
  }

  function exportHtml(assetBase: string) {
    return lastSaved.value ? createEmbedHtml(lastSaved.value, assetBase) : null
  }

  async function copyHtml(assetBase: string, writeText: (text: string) => Promise<void> = text => navigator.clipboard.writeText(text)) {
    const html = exportHtml(assetBase)
    if (!html)
      return false
    try {
      await writeText(html)
      if (exportHtml(assetBase) === html)
        copyStatus.value = CopyStatus.Copied
      return true
    }
    catch {
      if (exportHtml(assetBase) === html)
        copyStatus.value = CopyStatus.Failed
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
    copyStatus: readonly(copyStatus),

    patchDraft,
    save,
    exportHtml,
    copyHtml,
  }
}
