/// <reference path="../vfs.d.ts" />
import type { FileSystemTree } from '@webcontainer/api';
import solidTsTemplate from 'virtual:template:solid-ts';
import vueTsTemplate from 'virtual:template:vue-ts';
import reactTsTemplate from 'virtual:template:react-ts';

export interface TemplateConfig {
    files: FileSystemTree;
    entryFile: string;
    installCommand: string;
    devCommand: string;
}

export const templates: Record<string, TemplateConfig> = {
    'solid-ts': {
        files: solidTsTemplate,
        entryFile: 'src/App.tsx',
        installCommand: 'npm install --no-audit --no-fund',
        devCommand: 'npm run dev'
    },
    'vue-ts': {
        files: vueTsTemplate,
        entryFile: 'src/App.vue',
        installCommand: 'npm install --no-audit --no-fund',
        devCommand: 'npm run dev'
    },
    'react-ts': {
        files: reactTsTemplate,
        entryFile: 'src/App.tsx',
        installCommand: 'npm install --no-audit --no-fund',
        devCommand: 'npm run dev'
    }
};