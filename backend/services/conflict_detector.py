from utils.logger import logger

class ConflictDetector:
    def detect_conflicts(self, water_resource, water_requests, farmers_dict):
        """
        Detects water supply shortages, minimum requirement impossibilities,
        time overlaps, and canal flow rate bottlenecks.
        Returns a list of structured conflict objects.
        """
        conflicts = []
        total_available = float(water_resource.get("total_available_water", 0))
        canal_capacity = float(water_resource.get("canal_capacity", 2500))

        total_requested = sum(float(r.get("requested_water", 0)) for r in water_requests)
        total_minimum = sum(float(r.get("minimum_water", 0)) for r in water_requests)

        affected_farmer_ids = [r.get("farmer_id") for r in water_requests]
        affected_names = [farmers_dict.get(fid, {}).get("farmer_name", fid) for fid in affected_farmer_ids]

        # 1. Critical Minimum Requirement Conflict
        if total_minimum > total_available:
            conflicts.append({
                "conflict_type": "minimum_requirement_conflict",
                "severity": "CRITICAL",
                "title": "Critical Minimum Requirement Deficit",
                "description": f"Total minimum water needed ({total_minimum:.0f} L) exceeds available supply ({total_available:.0f} L). Emergency survival mode activated.",
                "shortage": total_minimum - total_available,
                "affected_farmers": affected_names,
                "affected_farmer_ids": affected_farmer_ids
            })

        # 2. Water Shortage Conflict
        elif total_requested > total_available:
            conflicts.append({
                "conflict_type": "water_shortage",
                "severity": "HIGH",
                "title": "Water Supply Shortage",
                "description": f"Total demand ({total_requested:.0f} L) exceeds available supply ({total_available:.0f} L) by {total_requested - total_available:.0f} L.",
                "shortage": total_requested - total_available,
                "affected_farmers": affected_names,
                "affected_farmer_ids": affected_farmer_ids
            })

        # 3. Time Overlap & Canal Capacity Conflicts
        # Check overlapping requested time windows
        time_windows = []
        for r in water_requests:
            fid = r.get("farmer_id")
            fname = farmers_dict.get(fid, {}).get("farmer_name", fid)
            start_str = r.get("preferred_start", "06:00")
            end_str = r.get("preferred_end", "12:00")
            time_windows.append({"farmer_id": fid, "farmer_name": fname, "start": start_str, "end": end_str})

        overlaps = []
        for i in range(len(time_windows)):
            for j in range(i + 1, len(time_windows)):
                w1 = time_windows[i]
                w2 = time_windows[j]
                # Check overlap between HH:MM strings
                if max(w1["start"], w2["start"]) < min(w1["end"], w2["end"]):
                    overlaps.append((w1, w2))

        if overlaps:
            overlapping_names = list(set([o[0]["farmer_name"] for o in overlaps] + [o[1]["farmer_name"] for o in overlaps]))
            conflicts.append({
                "conflict_type": "time_overlap",
                "severity": "MEDIUM",
                "title": "Irrigation Time Overlap",
                "description": f"Multiple farmers ({', '.join(overlapping_names)}) requested overlapping canal delivery windows.",
                "affected_farmers": overlapping_names,
                "affected_farmer_ids": [o[0]["farmer_id"] for o in overlaps] + [o[1]["farmer_id"] for o in overlaps]
            })

        logger.info(f"Detected {len(conflicts)} conflict(s).")
        return conflicts

conflict_detector = ConflictDetector()
