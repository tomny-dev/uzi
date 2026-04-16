/**
 * Returns a minified JS string to inline in <head> as a blocking script.
 * It reads localStorage and immediately applies theme/accent/preset attributes
 * to <html> before any paint, preventing the flash-of-wrong-theme (FOWT).
 *
 * Usage in Next.js root layout:
 *   <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
 */
export function getThemeScript({
  storageKey = "uzi-theme",
  accentStorageKey = "uzi-accent",
  defaultTheme = "system",
  defaultAccent = "blue",
}: {
  storageKey?: string;
  accentStorageKey?: string;
  defaultTheme?: string;
  defaultAccent?: string;
} = {}): string {
  return `(function(){try{
var t=localStorage.getItem(${JSON.stringify(storageKey)});
var a=localStorage.getItem(${JSON.stringify(accentStorageKey)});
var theme=(t==='light'||t==='dark'||t==='system')?t:${JSON.stringify(defaultTheme)};
var accent=(a==='blue'||a==='cyan'||a==='violet'||a==='emerald'||a==='amber'||a==='rose')?a:${JSON.stringify(defaultAccent)};
var resolved=theme==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):theme;
var d=document.documentElement;
d.setAttribute('data-uzi-theme',resolved);
d.setAttribute('data-uzi-accent',accent);
d.style.colorScheme=resolved;
if(resolved==='dark')d.classList.add('dark');else d.classList.remove('dark');
}catch(e){}})();`;
}
