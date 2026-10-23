// Type declarations for untyped third-party modules

declare module 'lottie-web' {
  interface AnimationConfig {
    container: HTMLElement
    renderer?: 'svg' | 'canvas' | 'html'
    loop?: boolean
    autoplay?: boolean
    animationData?: unknown
    path?: string
    name?: string
  }

  interface AnimationItem {
    play(): void
    stop(): void
    pause(): void
    destroy(): void
    setSpeed(speed: number): void
    goToAndPlay(value: number, isFrame?: boolean): void
    goToAndStop(value: number, isFrame?: boolean): void
    setDirection(direction: 1 | -1): void
    getDuration(inFrames?: boolean): number
    totalFrames: number
    isPaused: boolean
  }

  const lottie: {
    loadAnimation(config: AnimationConfig): AnimationItem
    destroy(name?: string): void
    play(name?: string): void
    stop(name?: string): void
    setSpeed(speed: number, name?: string): void
  }

  export default lottie
}

declare module 'react-quill' {
  import { Component } from 'react'

  interface ReactQuillProps {
    value?: string
    defaultValue?: string
    onChange?: (content: string) => void
    theme?: string
    modules?: Record<string, unknown>
    formats?: string[]
    placeholder?: string
    readOnly?: boolean
    className?: string
    style?: React.CSSProperties
  }

  export default class ReactQuill extends Component<ReactQuillProps> {}
}

declare module 'grapesjs' {
  const grapesjs: {
    init(config: Record<string, unknown>): unknown
  }
  export default grapesjs
}

declare module 'grapesjs-preset-webpage' {
  const plugin: unknown
  export default plugin
}

declare module 'grapesjs-plugin-forms' {
  const plugin: unknown
  export default plugin
}

// Image/asset imports
declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.mp4' {
  const src: string
  export default src
}

declare module '*.webm' {
  const src: string
  export default src
}

// JSON animation data (Lottie)
declare module '*.json' {
  const value: unknown
  export default value
}

// Vite env types
interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_PRESET: string
  readonly VITE_PAYPAL_AUTH: string
  readonly VITE_REACT_APP_PAYPAL_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_API_KEY: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
