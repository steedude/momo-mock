<script setup lang="ts">
import type { ProductDraft, ValidationErrors } from '../types/product'
import { useI18n } from 'vue-i18n'

defineProps<{ draft: Readonly<ProductDraft>, errors: ValidationErrors }>()

const emit = defineEmits<{ patch: [value: Partial<ProductDraft>], save: [] }>()

const numericFields = ['originalPrice', 'rating', 'reviewCount', 'salesCount'] as const

const { t } = useI18n()

function update(field: keyof ProductDraft, event: Event) {
  emit('patch', { [field]: (event.target as HTMLInputElement | HTMLTextAreaElement).value })
}
</script>

<template>
  <form class="mt-5" novalidate @submit.prevent="emit('save')">
    <div class="mb-5">
      <label class="mb-2 block text-sm font-medium" for="product-name">{{ t('editor.name') }} <span class="ml-1 text-pink-600">*</span></label>
      <input id="product-name" class="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm leading-6 text-zinc-800 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 aria-invalid:border-rose-500" :value="draft.name" aria-required="true" :aria-invalid="!!errors.name" :aria-describedby="errors.name ? 'name-error' : 'name-hint'" @input="update('name', $event)">
      <p v-if="errors.name" id="name-error" class="mt-1.5 text-xs leading-5 text-rose-700">
        {{ t(`validation.${errors.name}`) }}
      </p>
      <p v-else id="name-hint" class="mt-1.5 text-xs leading-5 text-zinc-500">
        {{ t('editor.nameHint') }}
      </p>
    </div>
    <div class="mb-5">
      <label class="mb-2 block text-sm font-medium" for="product-image">{{ t('editor.imageUrl') }} <span class="ml-1 text-pink-600">*</span></label>
      <textarea id="product-image" class="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm leading-6 text-zinc-800 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 aria-invalid:border-rose-500" :value="draft.imageUrl" rows="2" spellcheck="false" aria-required="true" :aria-invalid="!!errors.imageUrl" :aria-describedby="errors.imageUrl ? 'image-error' : 'image-hint'" @input="update('imageUrl', $event)" />
      <p v-if="errors.imageUrl" id="image-error" class="mt-1.5 text-xs leading-5 text-rose-700">
        {{ t(`validation.${errors.imageUrl}`) }}
      </p>
      <p v-else id="image-hint" class="mt-1.5 text-xs leading-5 text-zinc-500">
        {{ t('editor.imageHint') }}
      </p>
    </div>
    <div class="mb-5">
      <label class="mb-2 block text-sm font-medium" for="product-price">{{ t('editor.price') }} <span class="ml-1 text-pink-600">*</span></label>
      <div class="relative">
        <span class="pointer-events-none absolute top-3 left-3 text-xs text-zinc-500" aria-hidden="true">NT$</span><input id="product-price" class="block w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-3 pl-12 text-sm leading-6 text-zinc-800 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 aria-invalid:border-rose-500" :value="draft.price" inputmode="decimal" aria-required="true" :aria-invalid="!!errors.price" :aria-describedby="errors.price ? 'price-error' : 'price-hint'" @input="update('price', $event)">
      </div>
      <p v-if="errors.price" id="price-error" class="mt-1.5 text-xs leading-5 text-rose-700">
        {{ t(`validation.${errors.price}`) }}
      </p>
      <p v-else id="price-hint" class="mt-1.5 text-xs leading-5 text-zinc-500">
        {{ t('editor.priceHint') }}
      </p>
    </div>
    <div class="mb-5">
      <label class="mb-2 block text-sm font-medium" for="product-promotion">{{ t('editor.promotion') }} <span class="ml-1 text-xs font-normal text-zinc-500">{{ t('editor.optional') }}</span></label>
      <input id="product-promotion" class="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm leading-6 text-zinc-800 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 aria-invalid:border-rose-500" :value="draft.promotion" aria-describedby="promotion-hint" @input="update('promotion', $event)">
      <p id="promotion-hint" class="mt-1.5 text-xs leading-5 text-zinc-500">
        {{ t('editor.promotionHint') }}
      </p>
    </div>
    <div class="grid gap-x-4 sm:grid-cols-2">
      <div v-for="field in numericFields" :key="field" class="mb-5">
        <label class="mb-2 block text-sm font-medium" :for="`product-${field}`">{{ t(`editor.${field}`) }} <span class="ml-1 text-xs font-normal text-zinc-500">{{ t('editor.optional') }}</span></label>
        <input :id="`product-${field}`" class="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm leading-6 text-zinc-800 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 aria-invalid:border-rose-500" :value="draft[field]" :inputmode="field === 'reviewCount' || field === 'salesCount' ? 'numeric' : 'decimal'" :aria-invalid="!!errors[field]" :aria-describedby="`${field}-hint`" @input="update(field, $event)">
        <p :id="`${field}-hint`" class="mt-1.5 text-xs leading-5" :class="errors[field] ? 'text-rose-700' : 'text-zinc-500'">
          {{ t(`editor.${field}Hint`) }}
        </p>
      </div>
    </div>
    <div class="mb-5">
      <label class="mb-2 block text-sm font-medium" for="product-badges">{{ t('editor.badges') }} <span class="ml-1 text-xs font-normal text-zinc-500">{{ t('editor.optional') }}</span></label>
      <textarea id="product-badges" class="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm leading-6 text-zinc-800 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100" :value="draft.badges" rows="2" aria-describedby="badges-hint" @input="update('badges', $event)" />
      <p id="badges-hint" class="mt-1.5 text-xs leading-5 text-zinc-500">
        {{ t('editor.badgesHint') }}
      </p>
    </div>
    <div class="mt-6 flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-5">
      <button type="submit" class="inline-flex cursor-pointer items-center gap-8 rounded-lg bg-pink-600 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500">
        {{ t('editor.save') }} <span aria-hidden="true">→</span>
      </button><p class="text-xs text-zinc-500">
        {{ t('editor.saveHint') }}
      </p>
    </div>
  </form>
</template>
