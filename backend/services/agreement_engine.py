from datetime import datetime
from utils.logger import logger
from database.mock_db import db

class AgreementEngine:
    """
    Finalizes negotiation proposals, compiles immutable agreement contracts,
    and updates historical temporal fairness credits.
    """

    def finalize_agreement(self, negotiation_id, final_proposal, agent_statuses):
        allocations = final_proposal.get("allocations", [])
        fairness_score = final_proposal.get("fairness_score", 90.0)

        # Update temporal fairness history records
        cycle_num = len(db.get_fairness_history()) // len(allocations) + 1 if allocations else 1

        for alloc in allocations:
            fid = alloc["farmer_id"]
            req_w = float(alloc.get("requested_water", 0))
            alloc_w = float(alloc.get("allocated_water", 0))
            sacrifice = max(0.0, req_w - alloc_w)
            satisfaction = round(alloc_w / req_w, 4) if req_w > 0 else 1.0
            credit = round(sacrifice * 0.3, 2)

            db.fairness_history.append({
                "id": f"fh-{fid}-{cycle_num}",
                "farmer_id": fid,
                "requested_water": req_w,
                "allocated_water": alloc_w,
                "satisfaction_ratio": satisfaction,
                "sacrifice_amount": sacrifice,
                "fairness_credit": credit,
                "allocation_cycle": cycle_num,
                "created_at": datetime.now().isoformat()
            })

        agreement_data = {
            "id": f"agreement-{negotiation_id}",
            "negotiation_id": negotiation_id,
            "final_allocation": allocations,
            "final_schedule": final_proposal.get("schedule", []),
            "final_fairness_score": fairness_score,
            "agreement_status": "FINALIZED",
            "accepted_by": agent_statuses,
            "decision_explanation": final_proposal.get("decision_explanation", ""),
            "created_at": datetime.now().isoformat()
        }

        db.agreements[negotiation_id] = agreement_data

        db.add_audit_log(
            negotiation_id=negotiation_id,
            event_type="AGREEMENT_REACHED",
            event_data={
                "message": "Final binding water-sharing agreement reached by all farmer digital agents.",
                "fairness_score": fairness_score,
                "total_allocated": final_proposal.get("total_allocated", 0)
            }
        )

        logger.info(f"Agreement finalized for negotiation {negotiation_id}.")
        return agreement_data

agreement_engine = AgreementEngine()
