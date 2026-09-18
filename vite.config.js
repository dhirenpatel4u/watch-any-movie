import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
plugins: [react()],

build: {
    rollupOptions: {
        output: {
            // Keep predictable filenames so the
            // server-generated watch page can load
            // the React application correctly.

            entryFileNames: "assets/app.js",

            chunkFileNames: "assets/[name].js",

            assetFileNames: "assets/[name][extname]"
        }
    }
}
    
});
