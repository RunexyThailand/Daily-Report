import "@testing-library/jest-dom";

// Polyfill window.matchMedia for jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,                 // ปรับเป็น true/false ตามที่อยากจำลอง
    media: query,
    onchange: null,
    addEventListener: () => void 0, // API ใหม่
    removeEventListener: () => void 0,
    addListener: () => void 0,      // legacy API (บาง lib ยังเรียกใช้)
    removeListener: () => void 0,
    dispatchEvent: () => false,
  }),
});
