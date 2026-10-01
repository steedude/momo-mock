<script setup lang="ts">
import type { ProductDraft, ValidationErrors } from '../types/product'
import { useI18n } from 'vue-i18n'

defineProps<{ draft: Readonly<ProductDraft>, errors: ValidationErrors }>()
const emit = defineEmits<{ patch: [value: Partial<ProductDraft>], save: [] }>()
const { t } = useI18n()

function update(field: keyof ProductDraft, event: Event) {
  emit('patch', { [field]: (event.target as HTMLInputElement | HTMLTextAreaElement).value })
}
</script>

<template>
  <form class="product-form" novalidate @submit.prevent="emit('save')">
    <div class="form-field">
      <label for="product-name">{{ t('editor.name') }} <span class="required-star">*</span></label>
      <input id="product-name" :value="draft.name" aria-required="true" :aria-invalid="!!errors.name" :aria-describedby="errors.name ? 'name-error' : 'name-hint'" @input="update('name', $event)">
      <p v-if="errors.name" id="name-error" class="field-error">
        {{ t(`validation.${errors.name}`) }}
      </p>
      <p v-else id="name-hint" class="field-hint">
        {{ t('editor.nameHint') }}
      </p>
    </div>
    <div class="form-field">
      <label for="product-image">{{ t('editor.imageUrl') }} <span class="required-star">*</span></label>
      <textarea id="product-image" :value="draft.imageUrl" rows="2" spellcheck="false" aria-required="true" :aria-invalid="!!errors.imageUrl" :aria-describedby="errors.imageUrl ? 'image-error' : 'image-hint'" @input="update('imageUrl', $event)" />
      <p v-if="errors.imageUrl" id="image-error" class="field-error">
        {{ t(`validation.${errors.imageUrl}`) }}
      </p>
      <p v-else id="image-hint" class="field-hint">
        {{ t('editor.imageHint') }}
      </p>
    </div>
    <div class="form-field">
      <label for="product-price">{{ t('editor.price') }} <span class="required-star">*</span></label>
      <div class="price-input">
        <span aria-hidden="true">NT$</span><input id="product-price" :value="draft.price" inputmode="decimal" aria-required="true" :aria-invalid="!!errors.price" :aria-describedby="errors.price ? 'price-error' : 'price-hint'" @input="update('price', $event)">
      </div>
      <p v-if="errors.price" id="price-error" class="field-error">
        {{ t(`validation.${errors.price}`) }}
      </p>
      <p v-else id="price-hint" class="field-hint">
        {{ t('editor.priceHint') }}
      </p>
    </div>
    <div class="form-field">
      <label for="product-promotion">{{ t('editor.promotion') }} <span class="optional-label">{{ t('editor.optional') }}</span></label>
      <input id="product-promotion" :value="draft.promotion" aria-describedby="promotion-hint" @input="update('promotion', $event)">
      <p id="promotion-hint" class="field-hint">
        {{ t('editor.promotionHint') }}
      </p>
    </div>
    <div class="form-actions">
      <button type="submit">
        {{ t('editor.save') }} <span aria-hidden="true">→</span>
      </button><p>{{ t('editor.saveHint') }}</p>
    </div>
  </form>
</template>
