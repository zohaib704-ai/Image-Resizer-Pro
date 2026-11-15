<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>About — ImageResizer Pro</title>
<meta name="description" content="Why ImageResizer Pro exists and how it keeps your photos private.">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231c1a15'/%3E%3Ctext x='50' y='68' font-family='Georgia, serif' font-size='56' font-weight='bold' text-anchor='middle' fill='%23f6f1e7'%3EIR%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<header>
<nav>
<div class="logo"><a href="index.html"><h1>ImageResizer<em>Pro</em></h1></a></div>
<div class="nav-links">
<a href="index.html">Tools</a>
<a href="blog.html">Blog</a>
<a href="about.html" class="active">About</a>
<a href="contact.html">Contact</a>
</div>
<button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu"><span></span><span></span><span></span></button>
<div class="mobile-menu" id="mobileMenu">
<a href="index.html">Tools</a>
<a href="blog.html">Blog</a>
<a href="about.html">About</a>
<a href="contact.html">Contact</a>
<a href="privacy.html">Privacy</a>
<a href="terms.html">Terms</a>
</div>
</nav>
</header>

<main class="page">
<div class="container">
<div class="page-header">
<span class="section-num">ABOUT</span>
<h1>A small workshop for your pixels.</h1>
<p>ImageResizer Pro is a set of ten free tools that run entirely in your browser. No servers, no accounts, no uploads.</p>
</div>
<div class="content">
<h2>Why this exists</h2>
<p>Most online image tools ask you to upload photos to a server, wait for processing, and hand over personal data in the process. Some charge for the features that matter. ImageResizer Pro does the opposite: every operation — from cropping and compressing to reading text with OCR — happens locally in your browser using JavaScript and WebAssembly.</p>
<p>Your images never leave your device. Close the tab and there is nothing to delete.</p>

<h2>What you can do</h2>
<ul>
<li><strong>Enhance</strong> photos with brightness, contrast, warmth, clarity, and denoise.</li>
<li><strong>Filter</strong> with ten presets from B&amp;W to fade to invert.</li>
<li><strong>Rotate and flip</strong> to fix orientation.</li>
<li><strong>Crop</strong> with draggable handles and ratio presets.</li>
<li><strong>Resize</strong> to exact pixel dimensions with aspect lock.</li>
<li><strong>Compress</strong> to JPEG, WEBP, or PNG at the quality you choose.</li>
<li><strong>Add text</strong> — captions, watermarks, titles.</li>
<li><strong>Read text</strong> from images in eight languages using Tesseract.js.</li>
<li><strong>Capture</strong> from your camera with 1×–10× zoom.</li>
<li><strong>Hand off</strong> to Google Lens with a clean download step.</li>
</ul>

<h2>The stack</h2>
<p>Everything is static HTML, CSS, and vanilla JavaScript. Two libraries do heavy lifting: <strong>Cropper.js</strong> for crop handles and <strong>Tesseract.js</strong> for OCR. Everything else uses the Canvas API directly — no frameworks, no build step.</p>

<h2>Privacy</h2>
<p>No image is uploaded. No account is required. The only outbound requests are CDN scripts (Cropper, Tesseract), the OCR language model download (once, from Tesseract's CDN), and — if you use it — Google Lens (via your own browser session). Read the full <a href="privacy.html">privacy policy</a>.</p>

<h2>Feedback</h2>
<p>Found a bug or want a new tool? <a href="contact.html">Send a message</a> — I read every one.</p>
</div>
</div>
</main>

<footer>
<div class="container">
<div class="footer-grid">
<div class="footer-brand">
<h3>ImageResizer<em>Pro</em></h3>
<p>Ten free tools for image editing, compression, and OCR. All local, all private.</p>
</div>
<div class="footer-col">
<h4>Tools</h4>
<a href="index.html">Enhance</a>
<a href="index.html">Crop</a>
<a href="index.html">Compress</a>
<a href="index.html">OCR</a>
</div>
<div class="footer-col">
<h4>Site</h4>
<a href="blog.html">Blog</a>
<a href="about.html">About</a>
<a href="contact.html">Contact</a>
</div>
<div class="footer-col">
<h4>Legal</h4>
<a href="privacy.html">Privacy</a>
<a href="terms.html">Terms</a>
</div>
</div>
<div class="footer-bottom">© 2026 ImageResizer Pro · Built in the browser</div>
</div>
</footer>

<script>
document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('active');
});
</script>
</body>
</html>
