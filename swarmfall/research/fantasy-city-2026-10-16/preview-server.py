"""Local-only preview with fresh resources; no deployment or source mutation.

Serves the site as GitHub Pages publishes it: the simulator's dist/ at / and Swarmfall's
swarmfall/dist/ at /invasion/ (the publish workflow assembles the same layout).
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

REPO = Path(__file__).resolve().parents[3]
SIMULATOR = REPO / "dist"
GAME = REPO / "swarmfall" / "dist"

class PreviewHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        route = urlsplit(path).path
        if route == "/invasion" or route.startswith("/invasion/"):
            self.directory, route = str(GAME), route[len("/invasion"):] or "/"
        else:
            self.directory = str(SIMULATOR)
        return super().translate_path(route)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

server = ThreadingHTTPServer(("127.0.0.1", 4201), PreviewHandler)
print("Environment Lab: http://127.0.0.1:4201/invasion/environments/", flush=True)
print("Swarmfall: http://127.0.0.1:4201/invasion/  Simulator: http://127.0.0.1:4201/", flush=True)
server.serve_forever()
