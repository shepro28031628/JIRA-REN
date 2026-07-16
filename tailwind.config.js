/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./client/components/**/*.{js,vue,ts}",
    "./client/layouts/**/*.vue",
    "./client/pages/**/*.vue",
    "./client/plugins/**/*.{js,ts}",
    "./client/app.vue",
    "./client/error.vue"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        "surface-1": "var(--bg-surface-1)",
        "surface-2": "var(--bg-surface-2)",
        "txt-primary": "var(--txt-primary)",
        "txt-secondary": "var(--txt-secondary)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",
        "brand-default": "var(--brand-default)"
      }
    },
  },
  plugins: [],
}
