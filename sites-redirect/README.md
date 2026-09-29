# Retiring the ChatGPT Sites copy

The old copy at https://dragonfly-titan-gcs-demo.tboy450.chatgpt.site/ is published separately
from ChatGPT and falls behind every update. Publishing `index.html` from this folder there
replaces it with a page that forwards visitors to the GitHub Pages version (the live one).

How to publish it (pick one):
- In ChatGPT, open the Sites project and ask it to replace the site's contents with this
  `index.html` (the site's static directory is `dist`, per `.openai/hosting.json`), then publish.
- Or push it to the Sites git remote (`sites`): the site serves `dist/`, so the redirect goes
  in as `dist/index.html` with the other `dist` files removed.

GitHub Pages is not affected: its workflow publishes the main `dist` folder, not this one.
