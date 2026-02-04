import { createI18n } from 'vue-i18n'
import { translations } from './translations'

const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'ko',
    fallbackLocale: 'ko',
    messages: translations
})

export default i18n