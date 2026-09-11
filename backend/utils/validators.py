def validate_farmer_payload(data):
    required = ["farmer_name", "land_area", "crop_type", "crop_stage"]
    for field in required:
        if field not in data or data[field] is None:
            return False, f"Missing required field: {field}"
    try:
        if float(data["land_area"]) <= 0:
            return False, "land_area must be greater than 0"
    except (ValueError, TypeError):
        return False, "land_area must be a valid number"
    return True, None

def validate_water_resource_payload(data):
    required = ["total_available_water", "canal_capacity"]
    for field in required:
        if field not in data or data[field] is None:
            return False, f"Missing required field: {field}"
    try:
        if float(data["total_available_water"]) < 0:
            return False, "total_available_water cannot be negative"
        if float(data["canal_capacity"]) <= 0:
            return False, "canal_capacity must be greater than 0"
    except (ValueError, TypeError):
        return False, "Water figures must be valid numbers"
    return True, None

def validate_water_request_payload(data):
    required = ["farmer_id", "requested_water", "minimum_water", "urgency", "preferred_start", "preferred_end"]
    for field in required:
        if field not in data or data[field] is None:
            return False, f"Missing required field: {field}"
    try:
        req = float(data["requested_water"])
        mini = float(data["minimum_water"])
        if req <= 0 or mini <= 0:
            return False, "Water quantities must be positive"
        if mini > req:
            return False, "minimum_water cannot exceed requested_water"
        urgency = int(data["urgency"])
        if urgency < 1 or urgency > 5:
            return False, "urgency must be between 1 and 5"
    except (ValueError, TypeError):
        return False, "Invalid numeric fields in water request"
    return True, None
