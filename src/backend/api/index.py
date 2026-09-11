"""
Vercel serverless entrypoint.

Vercel's Python runtime auto-detects a WSGI application named `app`
in this file and wraps it as a serverless function. This lets the
exact same Flask app (backend/app/) run locally with `python run.py`
and on Vercel with zero code changes.

NOTE ON FIT: Vercel functions are stateless and have a request timeout
(10s on the Hobby plan, up to 60s on Pro). That's fine for typical
hackathon AI calls, but if your domain module does long-running
processing, consider Render/Railway/Fly.io for the backend instead
(see ../../DEPLOYMENT.md) and keep this file for a fast demo deploy.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv  # noqa: E402

load_dotenv()

from app import create_app  # noqa: E402

app = create_app()
