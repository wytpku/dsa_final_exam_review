"""Serve the practice site at its fixed, browser-local address."""

from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
from urllib.error import URLError
from urllib.request import Request, urlopen
import webbrowser

HOST = "127.0.0.1"
PORT = 8787
URL = f"http://{HOST}:{PORT}/"
SITE = Path(__file__).resolve().parent / "dist"


class PracticeHandler(SimpleHTTPRequestHandler):
    server_version = "DSAFinalPractice/1"

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def already_running():
    try:
        with urlopen(Request(URL, method="HEAD"), timeout=1) as response:
            return response.headers.get("Server", "").startswith(PracticeHandler.server_version)
    except (URLError, TimeoutError, OSError):
        return False


def main():
    parser = ArgumentParser(description="启动本地 DSA 期末刷题网站")
    parser.add_argument("--no-browser", action="store_true", help="仅启动网站")
    args = parser.parse_args()
    try:
        server = ThreadingHTTPServer((HOST, PORT), partial(PracticeHandler, directory=str(SITE)))
    except OSError as error:
        if not already_running():
            parser.exit(1, f"无法启动刷题网站。请确认端口 {PORT} 可用。\n{error}\n")
        print(f"刷题网站已运行在 {URL}", flush=True)
        if not args.no_browser:
            webbrowser.open(URL)
        return

    with server:
        print(f"刷题网站已启动 {URL}\n按 Ctrl+C 可关闭网站。", flush=True)
        if not args.no_browser:
            opener = Timer(0.2, webbrowser.open, args=(URL,))
            opener.daemon = True
            opener.start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
