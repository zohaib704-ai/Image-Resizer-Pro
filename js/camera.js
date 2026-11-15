/* ============================================================
   camera.js — getUserMedia capture with 1×–10× zoom
   ============================================================ */
(function () {
    'use strict';

    let stream = null;
    let zoom = 1;

    function updateZoomUI() {
        const v = document.getElementById('camVideo');
        const badge = document.getElementById('camZoomBadge');
        const slider = document.getElementById('camSlider');
        if (v) v.style.transform = `scale(${zoom})`;
        if (badge) badge.textContent = zoom.toFixed(1) + '×';
        if (slider) slider.value = zoom;
        document.querySelectorAll('.zoom-pill').forEach(p => {
            const z = parseFloat(p.dataset.zoom);
            p.classList.toggle('active', Math.abs(z - zoom) < 0.05);
        });
    }

    async function openCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Camera not supported in this browser.');
            return;
        }
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });
            const v = document.getElementById('camVideo');
            v.srcObject = stream;
            await v.play();
            zoom = 1;
            updateZoomUI();
            document.getElementById('cameraModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        } catch (err) {
            alert('Camera access failed: ' + (err.message || 'Permission denied.'));
        }
    }

    function closeCamera() {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }
        const v = document.getElementById('camVideo');
        if (v) v.srcObject = null;
        document.getElementById('cameraModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    function capture() {
        const video = document.getElementById('camVideo');
        if (!video || !video.videoWidth) { alert('Camera not ready yet.'); return; }
        const w = video.videoWidth, h = video.videoHeight;
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        // Apply zoom by cropping the source region
        const sw = w / zoom, sh = h / zoom;
        const sx = (w - sw) / 2, sy = (h - sh) / 2;
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
        const dataUrl = c.toDataURL('image/png');
        closeCamera();
        const img = new Image();
        img.onload = () => {
            App.setBaseImage(img);
            App.openEditor();
            App.activateTool('enhance');
        };
        img.src = dataUrl;
    }

    App.registerTool('camera', {
        onActivate: () => { /* panel with button; user clicks it */ }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const heroBtn = document.getElementById('cameraBtn');
        if (heroBtn) heroBtn.addEventListener('click', openCamera);

        const panelBtn = document.getElementById('openCameraBtn');
        if (panelBtn) panelBtn.addEventListener('click', openCamera);

        const closeBtn = document.getElementById('camClose');
        if (closeBtn) closeBtn.addEventListener('click', closeCamera);

        const shootBtn = document.getElementById('camShoot');
        if (shootBtn) shootBtn.addEventListener('click', capture);

        const slider = document.getElementById('camSlider');
        if (slider) slider.addEventListener('input', () => {
            zoom = parseFloat(slider.value);
            updateZoomUI();
        });

        document.querySelectorAll('.zoom-pill').forEach(p => {
            p.addEventListener('click', () => {
                zoom = parseFloat(p.dataset.zoom);
                updateZoomUI();
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('cameraModal').classList.contains('active')) {
                closeCamera();
            }
        });
    });
})();
