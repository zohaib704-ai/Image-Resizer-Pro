/* ============================================================
   compress.js — Compress + Resize tools
   ============================================================ */
(function () {
    'use strict';

    // ---------- COMPRESS ----------
    document.addEventListener('DOMContentLoaded', () => {
        const q = document.getElementById('cmpQuality');
        const qLbl = document.getElementById('v-quality');
        if (q) {
            q.addEventListener('input', () => {
                qLbl.textContent = q.value + '%';
            });
        }

        const applyCompress = document.getElementById('applyCompress');
        if (applyCompress) {
            applyCompress.addEventListener('click', () => {
                if (!App.baseImage) return;
                const quality = parseFloat(document.getElementById('cmpQuality').value) / 100;
                const format = document.getElementById('cmpFormat').value;
                const canvas = document.getElementById('canvas');
                let out = canvas;
                if (format === 'image/jpeg') {
                    const tmp = document.createElement('canvas');
                    tmp.width = canvas.width;
                    tmp.height = canvas.height;
                    const tctx = tmp.getContext('2d');
                    tctx.fillStyle = '#ffffff';
                    tctx.fillRect(0, 0, tmp.width, tmp.height);
                    tctx.drawImage(canvas, 0, 0);
                    out = tmp;
                }
                out.toBlob((blob) => {
                    if (!blob) return;
                    const kb = Math.round(blob.size / 1024);
                    document.getElementById('cmpInfo').textContent =
                        `Compressed to ${kb} KB · quality ${Math.round(quality * 100)}% · ${format.split('/')[1].toUpperCase()}`;
                    const ext = format.split('/')[1];
                    const a = document.createElement('a');
                    a.download = `${App.filename}-compressed.${ext}`;
                    a.href = URL.createObjectURL(blob);
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
                }, format, quality);
            });
        }

        // ---------- RESIZE ----------
        const wInput = document.getElementById('rsWidth');
        const hInput = document.getElementById('rsHeight');
        const lock = document.getElementById('rsLock');
        let ratio = 1;

        function syncRatio() {
            if (App.baseImage) {
                ratio = App.baseImage.width / App.baseImage.height;
                wInput.value = App.baseImage.width;
                hInput.value = App.baseImage.height;
            }
        }

        App.registerTool('resize', { onActivate: syncRatio });

        if (wInput && hInput) {
            wInput.addEventListener('input', () => {
                if (lock.value === '1' && ratio) hInput.value = Math.round(parseFloat(wInput.value) / ratio);
            });
            hInput.addEventListener('input', () => {
                if (lock.value === '1' && ratio) wInput.value = Math.round(parseFloat(hInput.value) * ratio);
            });
        }

        const applyResize = document.getElementById('applyResize');
        if (applyResize) {
            applyResize.addEventListener('click', () => {
                if (!App.baseImage) return;
                const w = Math.max(1, Math.min(8000, parseInt(wInput.value, 10) || 0));
                const h = Math.max(1, Math.min(8000, parseInt(hInput.value, 10) || 0));
                if (!w || !h) { alert('Enter valid width and height.'); return; }
                // Flush effects first
                const src = document.getElementById('canvas');
                const c = document.createElement('canvas');
                c.width = w;
                c.height = h;
                const ctx = c.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(src, 0, 0, w, h);
                const newImg = new Image();
                newImg.onload = () => App.setBaseImage(newImg);
                newImg.src = c.toDataURL('image/png');
            });
        }
    });
})();
