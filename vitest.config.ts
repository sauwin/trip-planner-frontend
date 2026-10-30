import { fileURLToPath } from 'node:url';
import { defineConfig, configDefaults } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({

  plugins: [vue() as never],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    test: {
        environment: 'jsdom',
        include: ['src/**/__tests__/**/*.test.ts'],
        exclude: [...configDefaults.exclude, 'e2e/**'],
        setupFiles: ['src/__tests__/setup.ts'],
        clearMocks: true,
        coverage: {
            provider: 'v8',
            include: ['src/utils/**', 'src/stores/**', 'src/api/http.ts', 'src/router/**'],
            exclude: ['src/utils/exportReports.ts', 'src/utils/dashboardExport.ts'],
            reporter: ['text', 'html'],
        },
    },
});