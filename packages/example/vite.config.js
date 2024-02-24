import { defineConfig } from "vite";
import { qrcode } from "vite-plugin-qrcode";

export default defineConfig({
  plugins: [
    qrcode(), // only applies in dev mode
  ],
});
