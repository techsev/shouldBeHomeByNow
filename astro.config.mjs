// @ts-check
import { defineConfig } from 'astro/config'

import react from '@astrojs/react'

import tailwindcss from '@tailwindcss/vite'

import node from '@astrojs/node'

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'server',

  vite: {
    plugins: [tailwindcss()]
  },
  server: {
    host: true
  },

  security: {
    checkOrigin: false
  },

  adapter: node({
    mode: 'standalone'
  })
})
