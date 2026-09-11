"""
Sample data for demo mode - lets the app run and be demoed end-to-end
with zero backend configuration. Never used once Supabase is wired up
for a real user (routes check `get_supabase()` first).
"""

SAMPLE_PROJECTS = [
    {
        "id": "demo-project-1",
        "title": "Sample Project",
        "description": "A placeholder project shown when Supabase isn't configured yet.",
        "status": "active",
        "created_at": "2026-01-01T00:00:00Z",
    }
]

SAMPLE_RESULTS = [
    {
        "id": "demo-result-1",
        "request_id": "demo-request-1",
        "result_data": {
            "summary": "This is a sample AI result shown in demo mode.",
            "confidence": 0.92,
            "tags": ["demo"],
        },
        "metadata": {"provider": "mock", "model": "mock-v1", "processing_time": 0.5},
        "created_at": "2026-01-01T00:05:00Z",
    }
]

SAMPLE_INPUT = {"text": "This is a sample input used for local UI development."}
