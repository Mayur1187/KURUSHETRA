from utils.logger import logger
from services.constraint_engine import constraint_engine
from services.priority_engine import priority_engine
from database.sqlite_db import db_sqlite

class AllocationEngine:

    def calculate_priority_score(self, farmer, request, fairness_info, crop_evidence=None):
        fid = farmer.get("id")
        if not crop_evidence and fid:
            crop_evidence = db_sqlite.get_active_crop_evidence(fid)

        res = priority_engine.calculate_priority(farmer, request, fairness_info, crop_evidence)
        return res["priority_score"]

    def generate_allocation(self, water_resource, water_requests, farmers_dict, fairness_history_map=None, custom_constraints=None):
        total_available = float(water_resource.get("total_available_water", 0))
        total_requested = sum(float(r.get("requested_water", 0)) for r in water_requests)
        total_minimum = sum(float(r.get("minimum_water", 0)) for r in water_requests)

        if fairness_history_map is None:
            fairness_history_map = {}

        allocations = []
        is_critical_shortage = total_minimum > total_available

        if is_critical_shortage:
            logger.warning("CRITICAL SHORTAGE MODE ACTIVATED: Total minimum water exceeds total available water.")

            # Calculate emergency survival scores
            emergency_scores = {}
            for req in water_requests:
                fid = req["farmer_id"]
                farmer = farmers_dict.get(fid, {})
                f_info = fairness_history_map.get(fid, {})
                p_score = self.calculate_priority_score(farmer, req, f_info)
                emergency_scores[fid] = max(0.1, p_score)

            total_score = sum(emergency_scores.values())

            for req in water_requests:
                fid = req["farmer_id"]
                farmer = farmers_dict.get(fid, {})
                share = emergency_scores[fid] / total_score if total_score > 0 else (1.0 / len(water_requests))
                allocated = round(share * total_available, 2)
                allocations.append({
                    "farmer_id": fid,
                    "farmer_name": farmer.get("farmer_name", fid),
                    "crop_type": farmer.get("crop_type", "Crop"),
                    "requested_water": float(req["requested_water"]),
                    "minimum_water": float(req["minimum_water"]),
                    "allocated_water": allocated,
                    "satisfaction_ratio": round(allocated / float(req["requested_water"]), 4) if float(req["requested_water"]) > 0 else 1.0,
                    "priority_score": emergency_scores[fid],
                    "allocation_status": "CRITICAL_SHORTAGE_SURVIVAL"
                })

        else:
            # Step 1 & 2: Allocate minimum water to every farmer
            temp_allocations = {}
            for req in water_requests:
                fid = req["farmer_id"]
                temp_allocations[fid] = float(req["minimum_water"])

            # Step 3: Remaining water
            remaining_water = total_available - total_minimum

            # Step 4: Calculate Priority Scores
            priority_scores = {}
            for req in water_requests:
                fid = req["farmer_id"]
                farmer = farmers_dict.get(fid, {})
                f_info = fairness_history_map.get(fid, {})
                priority_scores[fid] = self.calculate_priority_score(farmer, req, f_info)

            # Additional water demand above minimum
            additional_demands = {
                req["farmer_id"]: float(req["requested_water"]) - float(req["minimum_water"])
                for req in water_requests
            }

            total_additional_demand = sum(additional_demands.values())

            if remaining_water > 0 and total_additional_demand > 0:
                weighted_scores = {}
                for fid, p_score in priority_scores.items():
                    # Weight priority score by how much additional water they requested
                    weighted_scores[fid] = p_score * additional_demands[fid]

                sum_weighted = sum(weighted_scores.values())

                for req in water_requests:
                    fid = req["farmer_id"]
                    if sum_weighted > 0:
                        extra = (weighted_scores[fid] / sum_weighted) * remaining_water
                        extra = min(extra, additional_demands[fid])
                    else:
                        extra = 0.0
                    temp_allocations[fid] += extra

            for req in water_requests:
                fid = req["farmer_id"]
                farmer = farmers_dict.get(fid, {})
                allocated = round(temp_allocations[fid], 2)
                requested = float(req["requested_water"])
                allocations.append({
                    "farmer_id": fid,
                    "farmer_name": farmer.get("farmer_name", fid),
                    "crop_type": farmer.get("crop_type", "Crop"),
                    "requested_water": requested,
                    "minimum_water": float(req["minimum_water"]),
                    "allocated_water": allocated,
                    "satisfaction_ratio": round(allocated / requested, 4) if requested > 0 else 1.0,
                    "priority_score": priority_scores[fid],
                    "allocation_status": "NORMAL_OPTIMAL"
                })

        # Step 6: Validate against Constraint Engine
        validation = constraint_engine.validate_proposal(allocations, water_resource, water_requests, custom_constraints)

        return {
            "allocations": allocations,
            "total_allocated": sum(a["allocated_water"] for a in allocations),
            "total_available": total_available,
            "is_critical_shortage": is_critical_shortage,
            "constraint_validation": validation
        }

allocation_engine = AllocationEngine()
