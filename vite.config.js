import {defineConfig} from 'vite'
import {resolve} from 'path'
import dts from "vite-plugin-dts";

export default defineConfig({
    target: 'esnext',
    plugins: [
        dts()
    ],
    build: {
        assetsInlineLimit: 409600,
        target: 'esnext',
        lib: {
            assetsInlineLimit: 409600,
            name: "panorama-renderer",
            entry: resolve(__dirname, 'src/index.ts'),
            declaration: true,
        }
    }
})