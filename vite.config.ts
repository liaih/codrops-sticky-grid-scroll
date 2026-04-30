import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    server: {
        host: true, // Open to local network and display URL
        open: false,
    },
    build: {
        emptyOutDir: true, // Empty the folder first
        sourcemap: true, // Add sourcemap
    }
})
