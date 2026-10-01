<script setup lang="ts">
import type { ProductPreview } from '../types/product'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import '../card.css'

const props = defineProps<{ product: ProductPreview }>()
const { t } = useI18n()
const imageFailed = ref(false)
const formattedPrice = computed(() => {
  const { price } = props.product
  return price !== null && Number.isFinite(price) && price >= 0
    ? price.toLocaleString('zh-TW', { maximumFractionDigits: 20 })
    : null
})
const formattedOriginalPrice = computed(() => {
  const { originalPrice, price } = props.product
  return originalPrice !== undefined && price !== null && originalPrice > price
    ? originalPrice.toLocaleString('zh-TW')
    : null
})
const ratingWidth = computed(() => `${(props.product.rating ?? 0) / 5 * 100}%`)

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
      <h2 :title="product.name">
        {{ product.name }}
      </h2>
      <div class="momo-card__prices">
        <p class="momo-card__price" data-testid="price">
          <template v-if="formattedPrice !== null">
            ${{ formattedPrice }}
          </template>
          <span v-else class="momo-card__placeholder">{{ t('card.pendingPrice') }}</span>
        </p>
        <del v-if="formattedOriginalPrice !== null">${{ formattedOriginalPrice }}</del>
      </div>
      <div v-if="product.rating !== undefined" class="momo-card__reviews">
        <span class="momo-card__stars" role="img" :aria-label="t('card.rating', { rating: product.rating })"><span aria-hidden="true">★★★★★</span><span class="momo-card__stars-fill" :style="{ width: ratingWidth }" aria-hidden="true">★★★★★</span></span>
        <span v-if="product.reviewCount !== undefined" class="momo-card__review-count">({{ product.reviewCount.toLocaleString('zh-TW') }})</span>
      </div>
      <div v-if="product.badges?.length" class="momo-card__badges">
        <span v-for="(badge, index) in product.badges" :key="index" class="momo-card__badge">{{ badge }}</span>
      </div>
      <p v-if="product.salesCount !== undefined" class="momo-card__sales">
        {{ t('card.sales', { count: product.salesCount.toLocaleString('zh-TW') }) }}
      </p>
    </div>
  </article>
</template>
