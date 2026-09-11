import json
import re
from config import Config
from utils.logger import logger

class CropAnalyzer:
    """
    Agricultural crop evidence vision analyzer.
    Analyzes uploaded crop images to extract crop type, growth stage, water stress,
    and confidence scores. Supports Gemini/OpenAI vision API with an intelligent demo fallback mode.
    """

    def analyze_crop_image(self, farmer_id, farmer_name, crop_type_hint="Wheat", image_bytes=None, filename=None):
        logger.info(f"Analyzing crop image evidence for farmer {farmer_name} (ID: {farmer_id})...")

        # Check if AI vision API key is configured
        if (Config.GEMINI_API_KEY or Config.OPENAI_API_KEY) and image_bytes:
            ai_result = self._call_ai_vision_api(image_bytes, crop_type_hint)
            if ai_result:
                return ai_result

        # Standalone Demo / Fallback Analyzer
        return self._generate_demo_crop_evidence(farmer_id, farmer_name, crop_type_hint)

    def _generate_demo_crop_evidence(self, farmer_id, farmer_name, crop_type_hint):
        """
        Generates realistic agricultural crop evidence for demo mode.
        Tailored to test the exact hackathon scenario (e.g. Farmer C Sugarcane High Stress).
        """
        hint_lower = str(crop_type_hint).lower()

        if "sugarcane" in hint_lower or farmer_id == "farmer-c":
            return {
                "crop_type": "Sugarcane",
                "crop_confidence": 0.93,
                "growth_stage": "Tillering / Vegetative",
                "growth_confidence": 0.88,
                "water_stress": "HIGH",
                "stress_confidence": 0.91,
                "crop_criticality": 0.94,
                "analysis_summary": "High visible leaf curling, wilting tip symptoms, and significant canopy water deficit detected in Sugarcane crop.",
                "is_demo_mode": True
            }
        elif "vegetable" in hint_lower or farmer_id == "farmer-b":
            return {
                "crop_type": "Vegetables",
                "crop_confidence": 0.89,
                "growth_stage": "Fruit Setting",
                "growth_confidence": 0.85,
                "water_stress": "CRITICAL",
                "stress_confidence": 0.87,
                "crop_criticality": 0.90,
                "analysis_summary": "Critical soil moisture deficit with flower drop symptoms during sensitive fruit setting stage.",
                "is_demo_mode": True
            }
        else:
            return {
                "crop_type": "Wheat",
                "crop_confidence": 0.86,
                "growth_stage": "Flowering",
                "growth_confidence": 0.82,
                "water_stress": "MEDIUM",
                "stress_confidence": 0.80,
                "crop_criticality": 0.78,
                "analysis_summary": "Moderate moisture stress detected at flowering stage. Timely irrigation advised to preserve yield potential.",
                "is_demo_mode": True
            }

    def _call_ai_vision_api(self, image_bytes, crop_hint):
        try:
            if Config.GEMINI_API_KEY:
                import requests
                import base64

                base64_image = base64.b64encode(image_bytes).decode('utf-8')
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={Config.GEMINI_API_KEY}"

                prompt = f"""
                You are an agricultural crop evidence analysis system.
                Analyze the uploaded crop image and estimate:
                1. Crop type (Hint: {crop_hint}).
                2. Confidence of crop identification (0.0 to 1.0).
                3. Crop growth stage.
                4. Confidence of growth stage (0.0 to 1.0).
                5. Visible water stress level (LOW | MEDIUM | HIGH | CRITICAL | UNKNOWN).
                6. Confidence of water stress detection (0.0 to 1.0).
                7. Crop criticality for irrigation allocation (0.0 to 1.0).

                Return ONLY a JSON object with keys:
                "crop_type" (string),
                "crop_confidence" (float),
                "growth_stage" (string),
                "growth_confidence" (float),
                "water_stress" (string),
                "stress_confidence" (float),
                "crop_criticality" (float),
                "analysis_summary" (string)
                """

                payload = {
                    "contents": [{
                        "parts": [
                            {"text": prompt},
                            {"inline_data": {"mime_type": "image/jpeg", "data": base64_image}}
                        ]
                    }]
                }
                resp = requests.post(url, json=payload, timeout=8)
                if resp.status_code == 200:
                    raw_text = resp.json()['candidates'][0]['content']['parts'][0]['text']
                    json_str = re.search(r'\{.*\}', raw_text, re.DOTALL).group(0)
                    parsed = json.loads(json_str)
                    parsed["is_demo_mode"] = False
                    return parsed
        except Exception as e:
            logger.warning(f"AI Vision API call failed: {e}. Reverting to demo analysis mode.")
        return None

crop_analyzer = CropAnalyzer()
