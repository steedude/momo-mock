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
  <article class="momo-card mc:box-border mc:w-full mc:max-w-[260px] mc:overflow-hidden mc:bg-[#fff] mc:text-left mc:text-[14px] mc:[line-height:1.5] mc:text-[#29252a] mc:[font-family:Arial,'Noto_Sans_TC',sans-serif]">
    <div class="momo-card__image mc:grid mc:aspect-square mc:place-items-center mc:overflow-hidden mc:bg-[#faf9fa]">
      <img v-if="product.imageUrl && !imageFailed" class="mc:block mc:h-full mc:w-full mc:object-contain" :src="product.imageUrl" :alt="product.name" @error="imageFailed = true">
      <span v-else class="momo-card__placeholder mc:text-[14px] mc:text-[#8a7781]" role="img" :aria-label="t('card.imageUnavailable')">{{ t('card.imageUnavailable') }}</span>
    </div>
    <div class="momo-card__body mc:px-[2px] mc:pt-[10px] mc:pb-[2px]">
      <p v-if="product.promotion.trim()" class="momo-card__promotion mc:m-0 mc:mb-[3px] mc:truncate mc:text-[12px] mc:text-[#e72865]" data-testid="promotion">
        {{ product.promotion }}
      </p>
      <h2 class="mc:m-0 mc:line-clamp-2 mc:min-h-[42px] mc:text-[14px] mc:[font-weight:400] mc:[line-height:21px]" :title="product.name">
        {{ product.name }}
      </h2>
      <div class="momo-card__prices mc:mt-[8px] mc:flex mc:flex-wrap mc:items-baseline mc:gap-[8px]">
        <p class="momo-card__price mc:m-0 mc:text-[22px] mc:[font-weight:400] mc:[line-height:1.2] mc:text-[#ed1675]" data-testid="price">
          <template v-if="formattedPrice !== null">
            ${{ formattedPrice }}
          </template>
          <span v-else class="momo-card__placeholder mc:text-[14px] mc:text-[#8a7781]">{{ t('card.pendingPrice') }}</span>
        </p>
        <del v-if="formattedOriginalPrice !== null" class="mc:text-[12px] mc:text-[#92959b] mc:line-through">${{ formattedOriginalPrice }}</del>
      </div>
      <div v-if="product.rating !== undefined" class="momo-card__reviews mc:mt-[3px] mc:flex mc:items-center mc:gap-[7px]">
        <span class="momo-card__stars mc:relative mc:inline-block mc:text-[16px] mc:[line-height:1] mc:[letter-spacing:1px] mc:whitespace-nowrap mc:text-[#e0e0e0]" role="img" :aria-label="t('card.rating', { rating: product.rating })"><span aria-hidden="true">★★★★★</span><span class="momo-card__stars-fill mc:absolute mc:top-0 mc:left-0 mc:overflow-hidden mc:text-[#ffba00]" :style="{ width: ratingWidth }" aria-hidden="true">★★★★★</span></span>
        <span v-if="product.reviewCount !== undefined" class="momo-card__review-count mc:text-[11px] mc:text-[#92959b]">({{ product.reviewCount.toLocaleString('zh-TW') }})</span>
      </div>
      <div v-if="product.badges?.length" class="momo-card__badges mc:mt-[6px] mc:flex mc:flex-wrap mc:gap-[3px]">
        <span v-for="(badge, index) in product.badges" :key="index" class="momo-card__badge mc:rounded-[2px] mc:bg-[#ff4e8b] mc:px-[3px] mc:py-0 mc:text-[11px] mc:[line-height:18px] mc:text-[#fff]">{{ badge }}</span>
      </div>
      <p v-if="product.salesCount !== undefined" class="momo-card__sales mc:m-0 mc:mt-[5px] mc:text-[11px] mc:text-[#444]">
        {{ t('card.sales', { count: product.salesCount.toLocaleString('zh-TW') }) }}
      </p>
    </div>
  </article>
</template>
