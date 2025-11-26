import { defineNuxtPlugin } from '#app'
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.provide('grapesjs', grapesjs)
})
