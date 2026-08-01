/// <reference types="vite/client" />

// Uppercase .PNG files (Windows convention) — same as lowercase .png
declare module '*.PNG' {
  const src: string;
  export default src;
}
