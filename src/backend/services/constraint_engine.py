from utils.logger import logger

class ConstraintEngine:
    """
    Validates allocation proposals and irrigation schedules against strict physical,
    operational, negotiation, and dynamically extracted objection constraints.
    """

    def validate_proposal(self, proposal_allocations, water_resource, water_requests, custom_constraints=None):
        violations = []
        total_available = float(water_resource.get("total_available_water", 0))

        total_allocated = sum(float(alloc.get("allocated_water", 0)) for alloc in proposal_allocations)

        # Rule 1: Total allocated water must not exceed available water
        if total_allocated > total_available + 0.001:  # small epsilon for floating precision
            violations.append({
                "type": "CAPACITY_EXCEEDED",
                "severity": "CRITICAL",
                "description": f"Total allocated water ({total_allocated:.0f} L) exceeds total available water ({total_available:.0f} L)."
            })

        req_map = {r["farmer_id"]: r for r in water_requests}

        for alloc in proposal_allocations:
            fid = alloc.get("farmer_id")
            farmer_name = alloc.get("farmer_name", fid)
            allocated_water = float(alloc.get("allocated_water", 0))
            req = req_map.get(fid, {})
            requested_water = float(req.get("requested_water", 0))
            minimum_water = float(req.get("minimum_water", 0))

            # Rule 2: Allocation cannot exceed requested water
            if allocated_water > requested_water + 0.001:
                violations.append({
                    "type": "REQUEST_EXCEEDED",
                    "severity": "HIGH",
                    "farmer_id": fid,
                    "description": f"{farmer_name} allocated ({allocated_water:.0f} L) which exceeds their requested amount ({requested_water:.0f} L)."
                })

            # Rule 3: Minimum water requirement check (if available supply permits)
            total_min_all = sum(float(r.get("minimum_water", 0)) for r in water_requests)
            if total_min_all <= total_available and allocated_water < minimum_water - 0.001:
                violations.append({
                    "type": "MINIMUM_NOT_MET",
                    "severity": "HIGH",
                    "farmer_id": fid,
                    "description": f"{farmer_name} allocated ({allocated_water:.0f} L) which is below their minimum requirement of {minimum_water:.0f} L."
                })

            # Rule 4: Custom / Extracted Objection Constraints (e.g. latest end time)
            if custom_constraints:
                for cc in custom_constraints:
                    if cc.get("farmer_id") == fid or cc.get("farmer_id") is None:
                        ctype = cc.get("constraint_type")
                        if ctype == "TIME_AVAILABILITY" or ctype == "NO_AFTER_2PM":
                            latest_end = cc.get("latest_end_time", "14:00")
                            end_slot = alloc.get("end_time")
                            if end_slot and end_slot > latest_end:
                                violations.append({
                                    "type": "TIME_AVAILABILITY_VIOLATION",
                                    "severity": "CRITICAL",
                                    "farmer_id": fid,
                                    "description": f"{farmer_name} cannot receive water after {latest_end} (Scheduled end: {end_slot}). Reason: {cc.get('reason', 'Labor constraint')}."
                                })

        is_valid = len(violations) == 0
        logger.info(f"Constraint validation complete. Valid: {is_valid}. Violations count: {len(violations)}")
        return {
            "valid": is_valid,
            "violations": violations
        }

constraint_engine = ConstraintEngine()
