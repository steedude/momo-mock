<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ProductCard from './components/ProductCard.vue'
import ProductEditor from './components/ProductEditor.vue'
import { useShowroom } from './composables/useShowroom'
import { DownloadStatus, SaveStatus } from './types/product'

const { t } = useI18n()
const sampleHref = `${import.meta.env.BASE_URL}sample.html`
const { draft, lastSaved, loadWarning, dirty, preview, errors, saveStatus, downloadStatus, patchDraft, save, downloadHtml } = useShowroom()
</script>

<template>
  <header class="border-b border-zinc-200 bg-white">
    <div class="mx-auto flex min-h-18 max-w-6xl items-center gap-4 px-5 sm:px-8">
      <span class="text-3xl font-black tracking-tighter text-pink-600">momo</span>
      <span class="h-5 w-px bg-zinc-200" aria-hidden="true" />
      <h1 class="text-sm font-semibold text-zinc-800 sm:text-base">
        {{ t('app.title') }}
      </h1>
    </div>
  </header>
  <main class="mx-auto max-w-6xl px-5 py-7 sm:px-8">
    <p v-if="loadWarning" class="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900" role="alert">
      {{ t(`storage.${loadWarning}`) }}
    </p>
    <div class="grid items-start gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <section class="min-w-0 rounded-xl border border-zinc-200 bg-white p-5 sm:p-6" aria-labelledby="preview-heading">
        <div class="flex items-center justify-between gap-3">
          <h2 id="preview-heading" class="text-base font-semibold">
            {{ t('app.preview') }}
          </h2>
          <span class="rounded bg-pink-50 px-2 py-1 text-xs text-pink-700">{{ t('app.template') }}</span>
        </div>
        <div class="mt-5 flex min-h-110 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50 p-6">
          <ProductCard :product="preview" />
        </div>
        <p class="mt-4 text-center text-xs text-zinc-500">
          {{ t('app.previewHint') }}
        </p>
        <p class="mt-4 border-t border-zinc-100 pt-4 text-xs leading-6 text-zinc-500">
          {{ t('app.detailsHint') }}
        </p>
      </section>
      <section class="min-w-0 rounded-xl border border-zinc-200 bg-white p-5 sm:p-6" aria-labelledby="editor-heading">
        <div class="flex items-center justify-between gap-3">
          <h2 id="editor-heading" class="text-base font-semibold">
            {{ t('app.editing') }}
          </h2>
          <span class="text-xs text-zinc-500">{{ t('app.requiredHint') }}</span>
        </div>
        <div class="mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-xs" :class="dirty ? 'bg-amber-50 text-amber-800' : 'bg-zinc-100 text-zinc-600'" role="status">
          <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />{{ t(dirty ? 'app.dirty' : lastSaved ? 'app.clean' : 'app.initial') }}
        </div>
        <p v-if="dirty" class="mt-2 text-xs leading-5 text-amber-800">
          {{ t('app.draftHint') }}
        </p>
        <p v-if="saveStatus !== SaveStatus.Idle" class="my-4 rounded-lg p-3 text-sm leading-6" :class="saveStatus === SaveStatus.Saved ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'" :role="saveStatus === SaveStatus.Saved ? 'status' : 'alert'">
          {{ t(`app.${saveStatus}`) }}
        </p>
        <ProductEditor :draft="draft" :errors="errors" @patch="patchDraft" @save="save" />
      </section>
    </div>
    <section class="mt-6 rounded-xl border border-zinc-200 bg-white p-5 sm:p-6" aria-labelledby="embed-heading">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="embed-heading" class="text-base font-semibold">
            {{ t('embed.title') }}
          </h2>
          <p class="mt-2 text-sm text-zinc-600">
            {{ t('embed.description') }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <a :href="sampleHref" target="_blank" rel="noopener" class="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500">
            {{ t('embed.sample') }}
          </a>
          <button type="button" class="cursor-pointer rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500" :disabled="!lastSaved || downloadStatus === DownloadStatus.Preparing" @click="downloadHtml()">
            {{ t(downloadStatus === DownloadStatus.Preparing ? 'embed.preparing' : 'embed.download') }}
          </button>
        </div>
      </div>
      <p v-if="!lastSaved" class="mt-5 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">
        {{ t('embed.saveFirst') }}
      </p>
      <p v-else-if="dirty" class="mt-4 text-xs text-amber-800">
        {{ t('embed.draftNotice') }}
      </p>
      <p v-if="downloadStatus === DownloadStatus.Downloaded || downloadStatus === DownloadStatus.Failed" class="mt-3 text-sm" :class="downloadStatus === DownloadStatus.Downloaded ? 'text-emerald-700' : 'text-rose-700'" :role="downloadStatus === DownloadStatus.Downloaded ? 'status' : 'alert'">
        {{ t(`embed.${downloadStatus}`) }}
      </p>
      <p class="mt-4 text-xs leading-6 text-zinc-500">
        {{ t('embed.assetHint') }}
      </p>
    </section>
  </main>
</template>
