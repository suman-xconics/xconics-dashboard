const KEY = "theme";

export function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
}

export function saveTheme(theme) {
  localStorage.setItem(KEY, theme);
}

export function getSavedTheme() {
  return localStorage.getItem(KEY);
}

export function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}