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
      <h2 :title="product.name">
        {{ product.name }}
      </h2>
      <div class="momo-card__prices">
        <p class="momo-card__price" data-testid="price">
          <template v-if="product.price !== null && Number.isFinite(product.price) && product.price >= 0">
            ${{ product.price.toLocaleString('zh-TW', { maximumFractionDigits: 20 }) }}
          </template>
          <span v-else class="momo-card__placeholder">{{ t('card.pendingPrice') }}</span>
        </p>
        <del v-if="product.originalPrice !== undefined && product.price !== null && product.originalPrice > product.price">${{ product.originalPrice.toLocaleString('zh-TW') }}</del>
      </div>
      <div v-if="product.rating !== undefined" class="momo-card__reviews">
        <span class="momo-card__stars" role="img" :aria-label="t('card.rating', { rating: product.rating })"><span aria-hidden="true">★★★★★</span><span class="momo-card__stars-fill" :style="{ width: `${product.rating / 5 * 100}%` }" aria-hidden="true">★★★★★</span></span>
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

<style scoped>
@reference "tailwindcss";

.momo-card { @apply box-border w-full max-w-[260px] overflow-hidden bg-[#fff] text-left text-[14px] [line-height:1.5] text-[#29252a]; font-family: Arial, 'Noto Sans TC', sans-serif; }
.momo-card__image { @apply grid aspect-square place-items-center overflow-hidden bg-[#faf9fa]; }
.momo-card__image img { @apply block h-full w-full object-contain; }
.momo-card__body { @apply px-[2px] pt-[10px] pb-[2px]; }
.momo-card__promotion { @apply m-0 mb-[3px] truncate text-[12px] text-[#e72865]; }
.momo-card h2 { @apply m-0 line-clamp-2 min-h-[42px] text-[14px] [font-weight:400] [line-height:21px]; }
.momo-card__prices { @apply mt-[8px] flex flex-wrap items-baseline gap-[8px]; }
.momo-card__price { @apply m-0 text-[22px] [font-weight:400] [line-height:1.2] text-[#ed1675]; }
.momo-card__prices del { @apply text-[12px] text-[#92959b] line-through; }
.momo-card__reviews { @apply mt-[3px] flex items-center gap-[7px]; }
.momo-card__stars { @apply relative inline-block text-[16px] [line-height:1] [letter-spacing:1px] whitespace-nowrap text-[#e0e0e0]; }
.momo-card__stars-fill { @apply absolute top-0 left-0 overflow-hidden text-[#ffba00]; }
.momo-card__review-count { @apply text-[11px] text-[#92959b]; }
.momo-card__badges { @apply mt-[6px] flex flex-wrap gap-[3px]; }
.momo-card__badge { @apply rounded-[2px] bg-[#ff4e8b] px-[3px] py-0 text-[11px] [line-height:18px] text-[#fff]; }
.momo-card__sales { @apply m-0 mt-[5px] text-[11px] text-[#444]; }
.momo-card__placeholder { @apply text-[14px] text-[#8a7781]; }
</style>
