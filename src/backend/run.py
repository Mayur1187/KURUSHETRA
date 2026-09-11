import os

from dotenv import load_dotenv

load_dotenv()

from app import create_app  # noqa: E402
from app.config.settings import settings  # noqa: E402

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=settings.PORT, debug=settings.DEBUG)
