"""Local-only preview with fresh resources; no deployment or source mutation."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

dist = Path(__file__).resolve().parents[2] / "dist"
server = ThreadingHTTPServer(("127.0.0.1", 4201), partial(PreviewHandler, directory=str(dist)))
print("Environment Lab: http://127.0.0.1:4201/invasion/environments/", flush=True)
server.serve_forever()
