import json
import re
from config import Config
from utils.logger import logger

class ObjectionParser:
    """
    Parses natural language farmer objection messages into structured machine-enforceable constraints.
    Supports LLM API calls (Gemini/OpenAI) with an instant local rule-based fallback parser.
    """

    def parse_objection(self, farmer_id, farmer_name, objection_text):
        logger.info(f"Parsing natural language objection from {farmer_name}: '{objection_text}'")

        # Try LLM integration if key is provided
        if Config.GEMINI_API_KEY or Config.OPENAI_API_KEY:
            parsed = self._call_llm_parser(farmer_id, farmer_name, objection_text)
            if parsed:
                return parsed

        # Fallback deterministic pattern parser
        return self._fallback_rule_parser(farmer_id, farmer_name, objection_text)

    def _fallback_rule_parser(self, farmer_id, farmer_name, objection_text):
        text_lower = objection_text.lower()
        extracted = {
            "farmer_id": farmer_id,
            "farmer_name": farmer_name,
            "raw_message": objection_text,
            "constraint_type": "GENERAL_PREFERENCE",
            "hard_constraint": True,
            "reason": objection_text,
            "latest_end_time": None,
            "minimum_water_override": None
        }

        # Check for time constraints (e.g., 2 PM, 14:00, after 2)
        if any(kw in text_lower for kw in ["2 pm", "2pm", "14:00", "after 2", "workers", "labor"]):
            extracted["constraint_type"] = "TIME_AVAILABILITY"
            extracted["latest_end_time"] = "14:00"
            extracted["reason"] = "Labor and workers unavailable after 14:00"

        # Check for morning only constraint
        elif any(kw in text_lower for kw in ["morning only", "before 12", "noon"]):
            extracted["constraint_type"] = "TIME_AVAILABILITY"
            extracted["latest_end_time"] = "12:00"
            extracted["reason"] = "Canal access restricted to morning hours"

        # Check for minimum water complaint
        elif any(kw in text_lower for kw in ["minimum", "at least", "crop will die", "dry"]):
            match = re.search(r'(\d+[\d,]*)\s*(liters|litres|l)', text_lower)
            if match:
                extracted["minimum_water_override"] = float(match.group(1).replace(",", ""))
            extracted["constraint_type"] = "MINIMUM_WATER_STRESS"

        logger.info(f"Extracted constraint via fallback parser: {extracted}")
        return extracted

    def _call_llm_parser(self, farmer_id, farmer_name, objection_text):
        # Optional LLM API caller template for Gemini or OpenAI
        try:
            if Config.GEMINI_API_KEY:
                import requests
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={Config.GEMINI_API_KEY}"
                prompt = f"""
                You are a structured parser for an agricultural water mediation platform.
                Extract the exact physical/operational constraint from this farmer's objection:
                Farmer: {farmer_name}
                Objection: "{objection_text}"

                Return ONLY a JSON object with keys:
                "constraint_type" (e.g. TIME_AVAILABILITY, MINIMUM_WATER_STRESS),
                "hard_constraint" (boolean),
                "latest_end_time" (e.g. "14:00" or null),
                "reason" (string)
                """
                resp = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_content = data['candidates'][0]['content']['parts'][0]['text']
                    json_str = re.search(r'\{.*\}', raw_content, re.DOTALL).group(0)
                    parsed = json.loads(json_str)
                    parsed["farmer_id"] = farmer_id
                    parsed["farmer_name"] = farmer_name
                    parsed["raw_message"] = objection_text
                    return parsed
        except Exception as e:
            logger.warning(f"LLM parser failed: {e}. Reverting to rule-based parser.")
        return None

objection_parser = ObjectionParser()
