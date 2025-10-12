# Please Don’t Steal My Bike

A tiny static site for GitHub Pages. Lists your bikes and provides a big-button **Found Mode** when someone scans a QR attached to a bike.

**Demo flow**
- Home: `#/`
- Bike detail: `#/b/<bike-id>`
- Found Mode: `#/b/<bike-id>?found=1` or `#/found/<bike-id>`

## Quick start

```bash
git clone <your-repo-url>
cd <repo>
# edit bikes.json with your bikes (see format below)
