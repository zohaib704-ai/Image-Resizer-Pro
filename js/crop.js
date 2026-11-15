/* ============================================================
   crop.js — Cropper.js crop tool
   ============================================================ */
(function () {
    'use strict';
    let cropper = null;

    function initCropper() {
        const img = document.getElementById('cropImage');
        if (!img || !App.baseImage) return;
        if (typeof Cropper === 'undefined') {
            alert('Crop library failed to load. Check your internet connection.');
            return;
        }
        if (cropper) { try { cropper.destroy(); } catch (e) {} cropper = null; }

        // Flush uncommitted effects into the crop source
        const source = document.getElementById('canvas').toDataURL('image/png');
        img.onload = () => {
            img.onload = null;
            cropper = new Cropper(img, {
                aspectRatio: NaN,
                viewMode: 1,
                autoCropArea: 0.85,
                responsive: true,
                background: false
            });
        };
        img.src = source;
    }

    App.registerTool('crop', {
        onActivate: initCropper
    });

    document.addEventListener('DOMContentLoaded', () => {
        const ratioSel = document.getElementById('cropRatio');
        if (ratioSel) {
            ratioSel.addEventListener('change', () => {
                if (!cropper) return;
                const v = parseFloat(ratioSel.value);
                cropper.setAspectRatio(isNaN(v) ? NaN : v);
            });
        }

        const applyCrop = document.getElementById('applyCrop');
        if (applyCrop) {
            applyCrop.addEventListener('click', () => {
                if (!cropper) { alert('Open the Crop tab after loading an image first.'); return; }
                const c = cropper.getCroppedCanvas();
                if (!c) { alert('Nothing selected.'); return; }
                const newImg = new Image();
                newImg.onload = () => {
                    App.setBaseImage(newImg);
                    try { cropper.destroy(); } catch (e) {}
                    cropper = null;
                };
                newImg.src = c.toDataURL('image/png');
            });
        }
    });
})();
