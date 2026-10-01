import type { Product, ProductDraft, StorageIssue, ValidationErrors } from '../types/product'
import { computed, readonly, ref } from 'vue'
import { defaultProduct } from '../configs/product'
import { SaveStatus } from '../types/product'
import { parseDraft, previewProduct } from '../utils/product'
import { createProductStorage } from '../utils/storage'

export function useShowroom(source: () => Pick<Storage, 'getItem' | 'setItem'> = () => window.localStorage) {
  const storage = createProductStorage(source)
  const loaded = storage.load()
  const loadWarning = ref<StorageIssue | null>(loaded.ok ? null : loaded.reason)
  const lastSaved = ref<Product | null>(loaded.ok ? loaded.value : null)
  const initial = lastSaved.value ?? defaultProduct(typeof document === 'undefined' ? 'http://localhost/' : document.baseURI)
  const draft = ref<ProductDraft>({ ...initial, price: String(initial.price) })
  const baseline = ref({ ...draft.value })
  const dirty = computed(() => JSON.stringify(draft.value) !== JSON.stringify(baseline.value))
  const preview = computed(() => previewProduct(draft.value))
  const status = ref(SaveStatus.Idle)
  const attempted = ref(false)
  const errors = computed<ValidationErrors>(() => {
    const parsed = parseDraft(draft.value)
    return attempted.value && !parsed.ok ? parsed.errors : {}
  })

  function patchDraft(patch: Partial<ProductDraft>) {
    draft.value = { ...draft.value, ...patch }
    status.value = SaveStatus.Idle
  }

  function save() {
    attempted.value = true
    const parsed = parseDraft(draft.value)
    if (!parsed.ok) {
      status.value = SaveStatus.Invalid
      return false
    }
    const result = storage.save(parsed.value)
    if (!result.ok) {
      status.value = SaveStatus.Failed
      return false
    }
    lastSaved.value = { ...parsed.value }
    baseline.value = { ...draft.value }
    loadWarning.value = null
    status.value = SaveStatus.Saved
    return true
  }

  return { draft: readonly(draft), lastSaved: readonly(lastSaved), loadWarning: readonly(loadWarning), dirty, preview, errors, status: readonly(status), patchDraft, save }
}
