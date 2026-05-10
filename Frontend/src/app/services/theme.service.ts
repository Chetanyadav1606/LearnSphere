import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly STORAGE_KEY = 'learnsphere-theme';

    constructor() {
        // Apply saved theme on startup
        this.applyTheme(this.getTheme());
    }

    getTheme(): 'dark' | 'light' {
        return (localStorage.getItem(this.STORAGE_KEY) as 'dark' | 'light') || 'dark';
    }

    isDark(): boolean {
        return this.getTheme() === 'dark';
    }

    toggle(): void {
        const next = this.isDark() ? 'light' : 'dark';
        localStorage.setItem(this.STORAGE_KEY, next);
        this.applyTheme(next);
    }

    private applyTheme(theme: 'dark' | 'light'): void {
        document.documentElement.setAttribute('data-theme', theme);
    }
}
