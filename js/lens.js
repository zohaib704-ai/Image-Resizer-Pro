/* ============================================================
   lens.js — Google Lens hand-off
   ============================================================ */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const downloadBtn = document.getElementById('lensDownload');
        const openBtn = document.getElementById('lensOpen');

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (!App.baseImage) { alert('Load an image first.'); return; }
                App.download(App.filename + '-for-lens', 'image/png');
            });
        }

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                window.open('https://lens.google.com/upload', '_blank', 'noopener');
            });
        }
    });
})();
