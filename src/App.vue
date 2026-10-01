<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ProductCard from './components/ProductCard.vue'
import ProductEditor from './components/ProductEditor.vue'
import { useShowroom } from './composables/useShowroom'
import { SaveStatus } from './types/product'

const { t } = useI18n()
const { draft, lastSaved, loadWarning, dirty, preview, errors, status, patchDraft, save } = useShowroom()
const sampleHref = import.meta.env.DEV ? '/dist/sample.html' : './sample.html'
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <div class="brand">
        <span class="brand-logo">momo</span><span class="brand-divider" /><span>{{ t('app.title') }}</span>
      </div>
      <a :href="sampleHref" target="_blank" rel="noopener">{{ t('app.sample') }} <span aria-hidden="true">↗</span></a>
    </div>
  </header>
  <main class="workspace">
    <section class="intro">
      <p class="eyebrow">
        {{ t('app.eyebrow') }}
      </p>
      <h1>{{ t('app.headline') }}</h1>
      <p class="intro-description">
        {{ t('app.description') }}
      </p>
    </section>
    <p v-if="loadWarning" class="notice notice-warning" role="alert">
      {{ t(`storage.${loadWarning}`) }}
    </p>
    <div class="workspace-grid">
      <section class="panel preview-panel" aria-labelledby="preview-heading">
        <div class="panel-heading">
          <h2 id="preview-heading">
            {{ t('app.preview') }}
          </h2><span class="template-badge">{{ t('app.template') }}</span>
        </div>
        <div class="preview-stage">
          <ProductCard :product="preview" />
        </div>
        <p class="preview-caption">
          <span class="live-dot" />{{ t('app.previewHint') }}
        </p>
        <div class="template-summary">
          <span class="template-number">01</span><div><h3>{{ t('app.template') }}</h3><p>{{ t('app.templateDescription') }}</p></div><span class="template-check" aria-hidden="true">✓</span>
        </div>
        <p class="template-count">
          {{ t('app.singleTemplate') }}
        </p>
      </section>
      <section class="panel editor-panel" aria-labelledby="editor-heading">
        <div class="panel-heading">
          <h2 id="editor-heading">
            {{ t('app.editing') }}
          </h2><span class="required-note">{{ t('app.requiredHint') }}</span>
        </div>
        <p class="editor-description">
          {{ t('app.editingHint') }}
        </p>
        <div class="draft-state" :class="{ 'is-dirty': dirty }" role="status">
          <span class="state-dot" />{{ t(dirty ? 'app.dirty' : lastSaved ? 'app.clean' : 'app.initial') }}
        </div>
        <p v-if="dirty" class="draft-hint">
          {{ t('app.draftHint') }}
        </p>
        <p v-if="status !== SaveStatus.Idle" class="notice" :class="status === SaveStatus.Saved ? 'notice-success' : 'notice-error'" :role="status === SaveStatus.Saved ? 'status' : 'alert'">
          {{ t(`app.${status}`) }}
        </p>
        <ProductEditor :draft="draft" :errors="errors" @patch="patchDraft" @save="save" />
      </section>
    </div>
    <footer class="workspace-footer">
      <p>{{ t('app.localNote') }}</p><p>{{ t('app.footer') }}</p>
    </footer>
  </main>
</template>
