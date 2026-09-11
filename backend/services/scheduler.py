from datetime import datetime, timedelta
from utils.logger import logger

class Scheduler:
    """
    Translates allocated water quantities into exact, non-overlapping canal delivery time slots.
    Enforces time availability constraints and canal flow rate limits.
    """

    def generate_schedule(self, allocations, water_requests, canal_capacity=2500.0, custom_constraints=None):
        if not custom_constraints:
            custom_constraints = []

        req_map = {r["farmer_id"]: r for r in water_requests}
        scheduled_slots = []

        # Check for farmer specific time constraints (e.g. latest end time for Farmer B)
        hard_end_map = {}
        for cc in custom_constraints:
            fid = cc.get("farmer_id")
            if cc.get("constraint_type") in ["TIME_AVAILABILITY", "NO_AFTER_2PM"] or cc.get("latest_end_time"):
                hard_end_map[fid] = cc.get("latest_end_time", "14:00")

        # Sort allocations by priority score (descending) & urgency
        sorted_allocations = sorted(
            allocations,
            key=lambda x: x.get("priority_score", 0),
            reverse=True
        )

        current_time_dt = datetime.strptime("06:00", "%H:%M")

        for alloc in sorted_allocations:
            fid = alloc["farmer_id"]
            allocated_water = float(alloc.get("allocated_water", 0))

            if allocated_water <= 0:
                continue

            # Compute duration in hours based on canal flow capacity
            duration_hours = round(allocated_water / float(canal_capacity), 2)
            duration_minutes = int(duration_hours * 60)

            # Check if this farmer has a hard end time constraint
            hard_end_str = hard_end_map.get(fid)

            # Check preferred start time
            req = req_map.get(fid, {})
            pref_start_str = req.get("preferred_start", "06:00")
            pref_start_dt = datetime.strptime(pref_start_str, "%H:%M")

            start_dt = max(current_time_dt, pref_start_dt)

            # If assigning at start_dt causes end_dt to breach hard_end_str, shift earlier if possible
            if hard_end_str:
                hard_end_dt = datetime.strptime(hard_end_str, "%H:%M")
                if start_dt + timedelta(minutes=duration_minutes) > hard_end_dt:
                    # Shift start time back so it finishes by hard_end_dt
                    start_dt = hard_end_dt - timedelta(minutes=duration_minutes)
                    if start_dt < datetime.strptime("06:00", "%H:%M"):
                        start_dt = datetime.strptime("06:00", "%H:%M")

            end_dt = start_dt + timedelta(minutes=duration_minutes)

            start_time_str = start_dt.strftime("%H:%M")
            end_time_str = end_dt.strftime("%H:%M")

            # Update current_time_dt for next slot to prevent overlap
            current_time_dt = end_dt

            # Update the original allocation dict with schedule details
            alloc["start_time"] = start_time_str
            alloc["end_time"] = end_time_str
            alloc["duration_hours"] = duration_hours

            scheduled_slots.append({
                "farmer_id": fid,
                "farmer_name": alloc["farmer_name"],
                "crop_type": alloc["crop_type"],
                "allocated_water": allocated_water,
                "start_time": start_time_str,
                "end_time": end_time_str,
                "duration_hours": duration_hours
            })

        logger.info(f"Generated irrigation schedule for {len(scheduled_slots)} farmers.")
        return scheduled_slots

scheduler = Scheduler()
