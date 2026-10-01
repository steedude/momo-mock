<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
    <div class="mx-auto max-w-2xl">
      <header>
        <span class="text-2xl font-bold tracking-tight text-pink-600">momo</span>
      </header>
      <section class="mt-16 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p class="text-sm font-medium text-pink-600">
          {{ t('app.status') }}
        </p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight">
          {{ t('app.title') }}
        </h1>
        <p class="mt-4 leading-7 text-slate-600">
          {{ t('app.description') }}
        </p>
      </section>
    </div>
  </main>
</template>
