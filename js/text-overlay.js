/* ============================================================
   text-overlay.js — Add Text tool
   ============================================================ */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('txtInput');
        const size = document.getElementById('txtSize');
        const color = document.getElementById('txtColor');
        const x = document.getElementById('txtX');
        const y = document.getElementById('txtY');

        function sync() {
            App.effects.text = input.value;
            App.effects.tsize = parseInt(size.value, 10);
            App.effects.tcolor = color.value;
            App.effects.tx = parseInt(x.value, 10);
            App.effects.ty = parseInt(y.value, 10);
            document.getElementById('v-tsize').textContent = size.value + 'px';
            document.getElementById('v-tx').textContent = x.value + '%';
            document.getElementById('v-ty').textContent = y.value + '%';
            App.render();
        }

        [input, size, color, x, y].forEach(el => {
            if (el) el.addEventListener('input', sync);
        });

        const applyText = document.getElementById('applyText');
        if (applyText) {
            applyText.addEventListener('click', () => {
                if (!App.effects.text) { alert('Type some text first.'); return; }
                App.commitEffects();
                input.value = '';
            });
        }
    });
})();
