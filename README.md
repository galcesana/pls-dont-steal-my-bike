# Please Don’t Steal My Bike

A tiny static site for your bike’s QR code. Scan → page opens → it’s clearly your bike and shows how to reach you. Humor included.

## Features

- Single-page static site (HTML/CSS/JS), perfect for GitHub Pages.
- “Found Mode”: opening with `?found=1` auto-scrolls and highlights the instructions for returning the bike.
- Copy-to-clipboard buttons for **ownership proof** and a **canonical found link**.
- Responsive design and dark/light theme toggle.

## How to use

1. Replace details in **index.html** (bike name/color/serial/phone/email).
2. Replace `assets/images/owner.jpg` with your own photo (or bike photo).
3. Deploy to GitHub Pages from the repository settings (branch: `main`, folder: `/`).
4. Generate a QR code that points to your page URL with `?found=1`, e.g.  
   `https://<your-username>.github.io/please-dont-steal-my-bike/?found=1`

## Local preview

Just open `index.html` in a browser. No build step.

## License

MIT
