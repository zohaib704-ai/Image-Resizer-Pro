/* ============================================================
   main.js — Core app state, upload, tool switching, download
   ============================================================ */
(function () {
    'use strict';

    const App = window.App = {
        baseImage: null,      // current committed image (Image object)
        filename: 'image',
        file: null,
        activeTool: null,
        tools: {},
        effects: {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            warmth: 0,
            clarity: 0,
            denoise: 0,
            filter: 'none',
            text: '',
            tsize: 48,
            tcolor: '#ffffff',
            tx: 50,
            ty: 85
        },

        registerTool(name, config) {
            this.tools[name] = config || {};
        },

        hasUncommittedEffects() {
            const e = this.effects;
            return (
                e.brightness !== 100 || e.contrast !== 100 || e.saturate !== 100 ||
                e.warmth !== 0 || e.clarity !== 0 || e.denoise !== 0 ||
                e.filter !== 'none' || e.text !== ''
            );
        },

        resetEffects() {
            this.effects = {
                brightness: 100, contrast: 100, saturate: 100,
                warmth: 0, clarity: 0, denoise: 0, filter: 'none',
                text: '', tsize: 48, tcolor: '#ffffff', tx: 50, ty: 85
            };
        },

        // Draw base + effects to canvas
        render() {
            const canvas = document.getElementById('canvas');
            if (!canvas || !this.baseImage) return;
            canvas.width = this.baseImage.width;
            canvas.height = this.baseImage.height;
            const ctx = canvas.getContext('2d');

            // Build filter string
            const e = this.effects;
            const filters = [];
            if (e.brightness !== 100) filters.push(`brightness(${e.brightness}%)`);
            if (e.contrast !== 100) filters.push(`contrast(${e.contrast}%)`);
            if (e.saturate !== 100) filters.push(`saturate(${e.saturate}%)`);
            if (e.warmth > 0) filters.push(`sepia(${(e.warmth / 50 * 0.35).toFixed(3)}) saturate(${100 + e.warmth / 50 * 20}%)`);
            if (e.warmth < 0) filters.push(`hue-rotate(-${(-e.warmth / 50 * 12).toFixed(1)}deg)`);
            if (e.filter && e.filter !== 'none') filters.push(e.filter);
            ctx.filter = filters.length ? filters.join(' ') : 'none';
            ctx.drawImage(this.baseImage, 0, 0);
            ctx.filter = 'none';

            // Clarity (unsharp mask) — simple approximation
            if (e.clarity > 0) this._applyClarity(ctx, canvas.width, canvas.height, e.clarity);
            // Denoise
            if (e.denoise > 0) this._applyDenoise(ctx, canvas.width, canvas.height, e.denoise);
            // Text overlay
            if (e.text) this._drawText(ctx, canvas.width, canvas.height);
        },

        _applyClarity(ctx, w, h, amount) {
            const tmp = document.createElement('canvas');
            tmp.width = w; tmp.height = h;
            const tctx = tmp.getContext('2d');
            tctx.filter = 'blur(1.5px)';
            tctx.drawImage(ctx.canvas, 0, 0);
            const orig = ctx.getImageData(0, 0, w, h);
            const blur = tctx.getImageData(0, 0, w, h);
            const o = orig.data, b = blur.data;
            const s = (amount / 100) * 1.5;
            for (let i = 0; i < o.length; i += 4) {
                o[i]   = clamp(o[i]   + (o[i]   - b[i])   * s);
                o[i+1] = clamp(o[i+1] + (o[i+1] - b[i+1]) * s);
                o[i+2] = clamp(o[i+2] + (o[i+2] - b[i+2]) * s);
            }
            ctx.putImageData(orig, 0, 0);
        },

        _applyDenoise(ctx, w, h, strength) {
            const tmp = document.createElement('canvas');
            tmp.width = w; tmp.height = h;
            const tctx = tmp.getContext('2d');
            tctx.filter = `blur(${Math.min(3, strength * 0.6)}px)`;
            tctx.drawImage(ctx.canvas, 0, 0);
            ctx.globalAlpha = Math.min(0.7, strength / 5 * 0.75);
            ctx.drawImage(tmp, 0, 0);
            ctx.globalAlpha = 1;
        },

        _drawText(ctx, w, h) {
            const e = this.effects;
            const size = Math.max(10, e.tsize * (w / 800));
            const x = w * (e.tx / 100);
            const y = h * (e.ty / 100);
            ctx.save();
            ctx.font = `900 ${size}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.lineJoin = 'round';
            ctx.lineWidth = Math.max(2, size * 0.08);
            ctx.strokeStyle = 'rgba(0,0,0,0.75)';
            ctx.strokeText(e.text, x, y);
            ctx.fillStyle = e.tcolor;
            ctx.fillText(e.text, x, y);
            ctx.restore();
        },

        // Take the current canvas (base + effects) and make it the new base
// Returns a Promise that resolves once baseImage is updated
commitEffects() {
    return new Promise((resolve) => {
        const canvas = document.getElementById('canvas');
        if (!canvas) { resolve(null); return; }
        const dataUrl = canvas.toDataURL('image/png');
        const img = new Image();
        img.onload = () => {
            this.baseImage = img;
            this.resetEffects();
            this.render();
            resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
    });
},

        // Replace the base image completely (crop, resize, camera, transform)
        setBaseImage(img) {
            this.baseImage = img;
            this.resetEffects();
            this.render();
            this.updateDimensionsInputs();
        },

        updateDimensionsInputs() {
            const w = document.getElementById('rsWidth');
            const h = document.getElementById('rsHeight');
            if (w && this.baseImage) w.value = this.baseImage.width;
            if (h && this.baseImage) h.value = this.baseImage.height;
        },

        openEditor() {
            document.getElementById('workspace').classList.add('active');
            document.getElementById('toolsSection').style.display = 'none';
            document.getElementById('wsFilename').textContent = this.filename + '.img';
            document.getElementById('workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
        },

        closeEditor() {
            document.getElementById('workspace').classList.remove('active');
            document.getElementById('toolsSection').style.display = '';
            this.activeTool = null;
            document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.tool-card').forEach(c => c.classList.remove('active'));
        },

        activateTool(name) {
            if (!this.baseImage) {
                // Defer activation until image is loaded
                this._pendingTool = name;
                document.getElementById('fileInput').click();
                return;
            }
            this.activeTool = name;
            document.querySelectorAll('.tool-panel').forEach(p => p.classList.toggle('active', p.dataset.tool === name));
            document.querySelectorAll('.tool-card').forEach(c => c.classList.toggle('active', c.dataset.open === name));
            const tool = this.tools[name];
            if (tool && tool.onActivate) tool.onActivate();
            const panel = document.querySelector(`.tool-panel[data-tool="${name}"]`);
            if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        },

        download(filename, mime, quality) {
            const canvas = document.getElementById('canvas');
            if (!canvas || !this.baseImage) return;
            const fmt = mime || 'image/png';
            const q = quality != null ? quality : 0.92;
            // Fill white background for JPEG
            let out = canvas;
            if (fmt === 'image/jpeg') {
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
                const ext = fmt.split('/')[1];
                const a = document.createElement('a');
                a.download = `${filename || this.filename}.${ext}`;
                a.href = URL.createObjectURL(blob);
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 1000);
                return blob.size;
            }, fmt, q);
        }
    };

    function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }

    // ==========================================================
    // UPLOAD
    // ==========================================================
    function loadFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please choose an image file.');
            return;
        }
        App.file = file;
        App.filename = file.name.replace(/\.[^.]+$/, '') || 'image';
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                App.setBaseImage(img);
                App.openEditor();
                if (App._pendingTool) {
                    const t = App._pendingTool;
                    App._pendingTool = null;
                    App.activateTool(t);
                }
            };
            img.onerror = () => alert('Could not load that image.');
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ==========================================================
    // BOOT
    // ==========================================================
    document.addEventListener('DOMContentLoaded', () => {
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const newImageBtn = document.getElementById('newImageBtn');
        const resetBtn = document.getElementById('resetBtn');
        const downloadBtn = document.getElementById('downloadBtn');

        if (uploadBtn && fileInput) uploadBtn.addEventListener('click', () => fileInput.click());
        if (newImageBtn && fileInput) newImageBtn.addEventListener('click', () => fileInput.click());

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                e.target.value = '';
                if (file) loadFile(file);
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (!App.file) return;
                if (confirm('Reset to the original upload?')) loadFile(App.file);
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                App.download(App.filename + '-edited', 'image/png');
            });
        }

        // Tool cards
        document.querySelectorAll('.tool-card[data-open]').forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.closest('.tool-guide-link')) return;
        App.activateTool(card.dataset.open);
    });
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            App.activateTool(card.dataset.open);
        }
    });
});

        // Footer links with data-open
        document.querySelectorAll('a[data-open]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                App.activateTool(a.dataset.open);
            });
        });

        // Panel close buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
                document.querySelectorAll('.tool-card').forEach(c => c.classList.remove('active'));
                App.activeTool = null;
            });
        });

        // Mobile menu
        const mmb = document.getElementById('mobileMenuBtn');
        if (mmb) {
            mmb.addEventListener('click', () => {
                document.getElementById('mobileMenu').classList.toggle('active');
            });
        }
    });
})();
