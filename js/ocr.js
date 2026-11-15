/* ============================================================
   ocr.js — Tesseract.js OCR tool
   ============================================================ */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const startBtn = document.getElementById('ocrStart');
        const copyBtn = document.getElementById('ocrCopy');
        const progress = document.getElementById('ocrProgress');
        const result = document.getElementById('ocrResult');
        const langSel = document.getElementById('ocrLang');
        let worker = null;

        if (startBtn) {
            startBtn.addEventListener('click', async () => {
                if (!App.baseImage) { alert('Load an image first.'); return; }
                if (typeof Tesseract === 'undefined') {
                    alert('OCR library not loaded. Check your internet connection.');
                    return;
                }
                const lang = langSel.value;
                progress.style.display = 'flex';
                progress.textContent = 'Loading OCR engine (first time ~10s)…';
                result.textContent = '';

                try {
                    if (worker) { try { await worker.terminate(); } catch (e) {} worker = null; }
                    worker = await Tesseract.createWorker(lang, 1, {
                        logger: (m) => {
                            if (m.status === 'recognizing text') {
                                progress.textContent = `Reading… ${Math.round(m.progress * 100)}%`;
                            }
                        }
                    });
                    const { data: { text } } = await worker.recognize(App.baseImage);
                    result.textContent = text.trim() || '(No text detected)';
                    progress.style.display = 'none';
                } catch (err) {
                    progress.textContent = 'Error: ' + (err.message || err);
                }
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const t = result.textContent;
                if (!t || t === '(No text extracted yet)' || t === '(No text detected)') return;
                navigator.clipboard.writeText(t).then(() => {
                    copyBtn.textContent = '✓ Copied';
                    setTimeout(() => copyBtn.textContent = 'Copy Text', 1800);
                });
            });
        }
    });
})();
