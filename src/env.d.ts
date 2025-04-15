/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_UPLOAD_URL: string
  readonly VITE_PAYMENT_CALLBACK_URL: string
  readonly VITE_DEVTOOLS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

declare module '*.bmp' {
  const content: string
  export default content
}

declare module '*.tiff' {
  const content: string
  export default content
}

declare module '*.json' {
  const content: any
  export default content
}

declare module '*.md' {
  const content: string
  export default content
}

declare module '*.txt' {
  const content: string
  export default content
}

declare module '*.xml' {
  const content: string
  export default content
}

declare module '*.yaml' {
  const content: any
  export default content
}

declare module '*.yml' {
  const content: any
  export default content
}

declare module '*.csv' {
  const content: string
  export default content
}

declare module '*.tsv' {
  const content: string
  export default content
}

declare module '*.xlsx' {
  const content: any
  export default content
}

declare module '*.xls' {
  const content: any
  export default content
}

declare module '*.pdf' {
  const content: any
  export default content
}

declare module '*.doc' {
  const content: any
  export default content
}

declare module '*.docx' {
  const content: any
  export default content
}

declare module '*.ppt' {
  const content: any
  export default content
}

declare module '*.pptx' {
  const content: any
  export default content
}

declare module '*.zip' {
  const content: any
  export default content
}

declare module '*.rar' {
  const content: any
  export default content
}

declare module '*.7z' {
  const content: any
  export default content
}

declare module '*.tar' {
  const content: any
  export default content
}

declare module '*.gz' {
  const content: any
  export default content
}

declare module '*.mp3' {
  const content: string
  export default content
}

declare module '*.wav' {
  const content: string
  export default content
}

declare module '*.ogg' {
  const content: string
  export default content
}

declare module '*.mp4' {
  const content: string
  export default content
}

declare module '*.webm' {
  const content: string
  export default content
}

declare module '*.mov' {
  const content: string
  export default content
}

declare module '*.avi' {
  const content: string
  export default content
}

declare module '*.flv' {
  const content: string
  export default content
}

declare module '*.mkv' {
  const content: string
  export default content
}

declare module '*.swf' {
  const content: string
  export default content
}

declare module '*.woff' {
  const content: string
  export default content
}

declare module '*.woff2' {
  const content: string
  export default content
}

declare module '*.ttf' {
  const content: string
  export default content
}

declare module '*.eot' {
  const content: string
  export default content
}

declare module '*.otf' {
  const content: string
  export default content
}

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.scss' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.sass' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.less' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.styl' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.stylus' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.postcss' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.pcss' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.module.css' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.module.scss' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.module.sass' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.module.less' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.module.styl' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.module.stylus' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.module.postcss' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.module.pcss' {
  const content: { [className: string]: string }
  export default content
} 