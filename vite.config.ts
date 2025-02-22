import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [vue()],
    base: mode === "production" ? "/vimirror/" : "/",
    server: {
      port: 3000,
    },
  };
});
