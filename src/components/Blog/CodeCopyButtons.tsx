'use client';

import { useEffect } from 'react';

/**
 * Progressive enhancement over the static markdown HTML: adds a copy
 * button to every `<pre>` in the article. Doing it here rather than in
 * a rehype plugin keeps the rendered HTML free of interactive markup,
 * so the article still reads fine with JavaScript off.
 */
export default function CodeCopyButtons({ targetId }: { targetId: string }) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;

    const cleanups: Array<() => void> = [];

    root.querySelectorAll('pre').forEach(pre => {
      if (pre.dataset.copyReady) return;
      pre.dataset.copyReady = 'true';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'codeCopy';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');

      let timer: ReturnType<typeof setTimeout>;
      const onClick = async () => {
        const code = pre.querySelector('code')?.textContent ?? '';
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = 'Copied';
        } catch {
          // Clipboard is unavailable over plain HTTP and in some webviews.
          button.textContent = 'Press ⌘C';
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
          button.textContent = 'Copy';
        }, 1600);
      };

      button.addEventListener('click', onClick);
      pre.appendChild(button);

      cleanups.push(() => {
        clearTimeout(timer);
        button.removeEventListener('click', onClick);
        button.remove();
        delete pre.dataset.copyReady;
      });
    });

    return () => cleanups.forEach(fn => fn());
  }, [targetId]);

  return null;
}
