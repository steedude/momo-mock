import { defineCustomElement, h } from 'vue'
import cardStyles from './card.css?raw'
import ProductCard from './components/ProductCard.vue'
import { i18n } from './i18n'
import { parseProduct } from './utils/product'

// 外部頁面以 element.product 傳入物件；樣式放入 Shadow DOM。
const ProductCardElement = defineCustomElement({
  props: ['product'],
  inheritAttrs: false,
  styles: [':host { display: inline-block; }', cardStyles],
  configureApp: app => app.use(i18n),
  setup: props => () => {
    if (props.product === undefined)
      return null
    const result = parseProduct(props.product)
    return result.ok
      ? h(ProductCard, { product: result.value })
      : h('p', { role: 'alert' }, i18n.global.t('card.invalidProduct'))
  },
})

if (!customElements.get('momo-product-card'))
  customElements.define('momo-product-card', ProductCardElement)
