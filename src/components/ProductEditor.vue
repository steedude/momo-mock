<script setup lang="ts">
import type { ProductDraft, ValidationErrors } from '../types/product'
import { useI18n } from 'vue-i18n'
import { NUMBER_RULES, RATING_OPTIONS, TEXT_LIMITS } from '../configs/productRules'
import { normalizeProductInput, textLength } from '../utils/product'

const props = defineProps<{ draft: Readonly<ProductDraft>, errors: ValidationErrors }>()
const emit = defineEmits<{ patch: [value: Partial<ProductDraft>], save: [] }>()
const { t } = useI18n()
const textFields = ['name', 'imageUrl', 'promotion', 'badges'] as const
const detailFields = ['price', 'originalPrice', 'rating', 'reviewCount', 'salesCount'] as const

function update(field: keyof ProductDraft, event: Event) {
  // 中文輸入法組字完成後才截字或驗證，避免打斷選字。
  if ((event as InputEvent).isComposing)
    return
  const input = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  const value = normalizeProductInput(field, input.value, props.draft[field] ?? '')
  input.value = value
  emit('patch', { [field]: value })
}
</script>

<template>
  <form class="mt-5" novalidate @submit.prevent="emit('save')">
    <div v-for="field in textFields" :key="field" class="mb-5">
      <div class="mb-2 flex items-center justify-between gap-3">
        <label class="text-sm font-medium" :for="`product-${field}`">
          {{ t(`editor.${field}`) }}
          <span v-if="field === 'name' || field === 'imageUrl'" class="ml-1 text-pink-600">*</span>
          <span v-else class="ml-1 text-xs font-normal text-zinc-500">{{ t('editor.optional') }}</span>
        </label>
        <span :id="`${field}-count`" class="text-xs tabular-nums text-zinc-500">
          {{ textLength(draft[field] ?? '') }} / {{ TEXT_LIMITS[field] }}
        </span>
      </div>
      <textarea v-if="field === 'imageUrl' || field === 'badges'" :id="`product-${field}`" class="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm leading-6 text-zinc-800 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 aria-invalid:border-rose-500" :value="draft[field]" rows="2" spellcheck="false" :aria-required="field === 'imageUrl'" :aria-invalid="!!errors[field]" :aria-describedby="`${field}-hint ${field}-count`" @input="update(field, $event)" @compositionend="update(field, $event)" />
      <input v-else :id="`product-${field}`" class="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm leading-6 text-zinc-800 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 aria-invalid:border-rose-500" :value="draft[field]" :aria-required="field === 'name'" :aria-invalid="!!errors[field]" :aria-describedby="`${field}-hint ${field}-count`" @input="update(field, $event)" @compositionend="update(field, $event)">
      <p :id="`${field}-hint`" class="mt-1.5 text-xs leading-5" :class="errors[field] ? 'text-rose-700' : 'text-zinc-500'">
        {{ errors[field] ? t(`validation.${errors[field]}`, { max: TEXT_LIMITS[field] }) : t(`editor.${field}Hint`) }}
      </p>
    </div>
    <div class="grid gap-x-4 sm:grid-cols-2">
      <div v-for="field in detailFields" :key="field" class="mb-5">
        <label class="mb-2 block text-sm font-medium" :for="`product-${field}`">
          {{ t(`editor.${field}`) }}
          <span v-if="field === 'price'" class="ml-1 text-pink-600">*</span>
          <span v-else class="ml-1 text-xs font-normal text-zinc-500">{{ t('editor.optional') }}</span>
        </label>
        <select v-if="field === 'rating'" id="product-rating" class="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm leading-6 text-zinc-800 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 aria-invalid:border-rose-500" :value="draft.rating ?? ''" :aria-invalid="!!errors.rating" @change="update('rating', $event)">
          <option value="">
            {{ t('editor.hideRating') }}
          </option>
          <option v-for="rating in RATING_OPTIONS" :key="rating" :value="String(rating)">
            {{ rating }}
          </option>
        </select>
        <input v-else :id="`product-${field}`" class="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm leading-6 text-zinc-800 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 aria-invalid:border-rose-500" :value="draft[field]" inputmode="numeric" :aria-required="field === 'price'" :aria-invalid="!!errors[field]" :aria-describedby="`${field}-hint`" @input="update(field, $event)" @compositionend="update(field, $event)">
        <p v-if="field !== 'rating'" :id="`${field}-hint`" class="mt-1.5 text-xs leading-5" :class="errors[field] ? 'text-rose-700' : 'text-zinc-500'">
          {{ t(field === 'price' || field === 'originalPrice' ? 'editor.moneyHint' : 'editor.countHint', { max: NUMBER_RULES[field].max.toLocaleString('zh-TW') }) }}
          {{ field === 'originalPrice' ? t('editor.originalPriceHint') : '' }}
          {{ field !== 'price' ? t('editor.emptyToHide') : '' }}
        </p>
      </div>
    </div>
    <div class="mt-6 flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-5">
      <button type="submit" class="inline-flex cursor-pointer items-center gap-8 rounded-lg bg-pink-600 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500">
        {{ t('editor.save') }} <span aria-hidden="true">→</span>
      </button>
      <p class="text-xs text-zinc-500">
        {{ t('editor.saveHint') }}
      </p>
    </div>
  </form>
</template>
