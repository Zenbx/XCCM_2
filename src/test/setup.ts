import "@testing-library/jest-dom";
import { vi, afterEach, beforeEach } from "vitest";

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    // Clear all cookies
    document.cookie.split(';').forEach(c => {
        document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
    });
});

afterEach(() => {
    vi.clearAllMocks();
});
