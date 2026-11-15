/* ============================================================
   enhance.js — Enhance, Filters, Transform tools
   ============================================================ */
(function () {
    'use strict';

    function bindSlider(id, key, suffix, onChange) {
        const el = document.getElementById(id);
        const lbl = document.getElementById('v-' + key);
        if (!el) return;
        el.addEventListener('input', () => {
            const val = parseFloat(el.value);
            App.effects[key] = val;
            if (lbl) lbl.textContent = val + (suffix || '');
            onChange && onChange(val);
            App.render();
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        // ENHANCE
        bindSlider('brightness', 'brightness', '%');
        bindSlider('contrast', 'contrast', '%');
        bindSlider('saturate', 'saturate', '%');
        bindSlider('warmth', 'warmth', '');
        bindSlider('clarity', 'clarity', '');
        bindSlider('denoise', 'denoise', '');

        const applyEnhance = document.getElementById('applyEnhance');
        if (applyEnhance) {
            applyEnhance.addEventListener('click', () => {
                App.commitEffects();
                resetEnhanceUI();
            });
        }
        const resetEnhance = document.getElementById('resetEnhance');
        if (resetEnhance) {
            resetEnhance.addEventListener('click', () => {
                App.resetEffects();
                resetEnhanceUI();
                App.render();
            });
        }

        // FILTERS
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                App.effects.filter = chip.dataset.filter;
                App.render();
            });
        });
        const applyFilter = document.getElementById('applyFilter');
        if (applyFilter) {
            applyFilter.addEventListener('click', () => {
                App.commitEffects();
                document.querySelectorAll('.filter-chip').forEach((c, i) => c.classList.toggle('active', i === 0));
            });
        }

        // TRANSFORM
        document.querySelectorAll('.transform-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.transform;
                if (!App.baseImage) return;
                // Flush any pending effects first
                if (App.hasUncommittedEffects()) App.commitEffects();
                // Need to wait a tick for commit to complete
                setTimeout(() => applyTransform(action), 20);
            });
        });
    });

    function resetEnhanceUI() {
        ['brightness', 'contrast', 'saturate'].forEach(k => {
            const el = document.getElementById(k);
            if (el) el.value = 100;
            const lbl = document.getElementById('v-' + k);
            if (lbl) lbl.textContent = '100%';
        });
        ['warmth', 'clarity', 'denoise'].forEach(k => {
            const el = document.getElementById(k);
            if (el) el.value = 0;
            const lbl = document.getElementById('v-' + k);
            if (lbl) lbl.textContent = '0';
        });
    }

    function applyTransform(action) {
        const img = App.baseImage;
        if (!img) return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let w = img.width, h = img.height;
        if (action === 'rotl' || action === 'rotr') {
            canvas.width = h;
            canvas.height = w;
            if (action === 'rotl') {
                ctx.translate(0, w);
                ctx.rotate(-Math.PI / 2);
            } else {
                ctx.translate(h, 0);
                ctx.rotate(Math.PI / 2);
            }
            ctx.drawImage(img, 0, 0);
        } else {
            canvas.width = w;
            canvas.height = h;
            if (action === 'fliph') {
                ctx.translate(w, 0);
                ctx.scale(-1, 1);
            } else if (action === 'flipv') {
                ctx.translate(0, h);
                ctx.scale(1, -1);
            }
            ctx.drawImage(img, 0, 0);
        }
        const newImg = new Image();
        newImg.onload = () => App.setBaseImage(newImg);
        newImg.src = canvas.toDataURL('image/png');
    }
})();
