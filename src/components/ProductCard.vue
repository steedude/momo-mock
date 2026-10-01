<script setup lang="ts">
import type { ProductPreview } from '../types/product'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ product: ProductPreview }>()
const { t } = useI18n()
const imageFailed = ref(false)
watch(() => props.product.imageUrl, () => {
  imageFailed.value = false
})
</script>

<template>
  <article class="momo-card">
    <div class="momo-card__image">
      <img v-if="product.imageUrl && !imageFailed" :src="product.imageUrl" :alt="product.name" @error="imageFailed = true">
      <span v-else class="momo-card__placeholder" role="img" :aria-label="t('card.imageUnavailable')">{{ t('card.imageUnavailable') }}</span>
    </div>
    <div class="momo-card__body">
      <p v-if="product.promotion.trim()" class="momo-card__promotion" data-testid="promotion">
        {{ product.promotion }}
      </p>
      <h2>{{ product.name }}</h2>
      <p class="momo-card__price" data-testid="price">
        <template v-if="product.price !== null && Number.isFinite(product.price) && product.price >= 0">
          ${{ product.price.toLocaleString('zh-TW', { maximumFractionDigits: 20 }) }}
        </template>
        <span v-else class="momo-card__placeholder">{{ t('card.pendingPrice') }}</span>
      </p>
    </div>
  </article>
</template>

<style scoped>
.momo-card { box-sizing: border-box; width: 100%; max-width: 280px; overflow: hidden; background: #fff; color: #29252a; font: 14px/1.5 Arial, 'Noto Sans TC', sans-serif; text-align: left; border: 1px solid #eee9ec; border-radius: 12px; }
.momo-card__image { aspect-ratio: 1; display: grid; place-items: center; background: #faf9fa; overflow: hidden; }
.momo-card__image img { display: block; width: 100%; height: 100%; object-fit: contain; }
.momo-card__body { padding: 16px; }
.momo-card__promotion { margin: 0 0 6px; color: #bd1b62; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 12px; }
.momo-card h2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 42px; margin: 0; font-size: 14px; font-weight: 400; line-height: 21px; }
.momo-card__price { margin: 12px 0 0; color: #d61e72; font-size: 26px; font-weight: 600; line-height: 1.2; }
.momo-card__placeholder { font-size: 14px; color: #8a7781; }
</style>
