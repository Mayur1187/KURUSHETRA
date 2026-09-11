import uuid
from datetime import datetime
from utils.logger import logger
from database.mock_db import db
from services.conflict_detector import conflict_detector
from services.allocation_engine import allocation_engine
from services.fairness_engine import fairness_engine
from services.scheduler import scheduler
from services.agreement_engine import agreement_engine
from ai.objection_parser import objection_parser
from ai.explanation_generator import explanation_generator
from ai.negotiation_messages import negotiation_messages
from agents.farmer_agent import FarmerAgent

class MediatorAgent:
    """
    JalNyay AI: Neutral Autonomous Digital Mediator.
    Orchestrates conflict detection, initial proposal generation, agent evaluations,
    objection parsing, dynamic constraint injection, renegotiation, and final agreements.
    """

    def start_mediation(self):
        logger.info("JalNyay AI: Starting mediation workflow...")

        water_resource = db.get_water_resource()
        water_requests = db.get_water_requests()
        farmers = db.get_farmers()
        farmers_dict = {f["id"]: f for f in farmers}
        pref_dict = {p["farmer_id"]: p for p in db.negotiation_preferences.values()}
        history = db.get_fairness_history()

        # Step 1: Detect Conflicts
        conflicts = conflict_detector.detect_conflicts(water_resource, water_requests, farmers_dict)

        negotiation_id = f"neg-{uuid.uuid4().hex[:6]}"
        db.negotiations[negotiation_id] = {
            "id": negotiation_id,
            "status": "in_progress",
            "current_round": 1,
            "mediator_status": "active",
            "created_at": datetime.now().isoformat()
        }

        db.add_audit_log(
            negotiation_id=negotiation_id,
            event_type="CONFLICT_DETECTED",
            event_data={"conflicts": conflicts}
        )

        # Step 2: Compute Historical Fairness Map
        fairness_map = {}
        for f in farmers:
            fid = f["id"]
            fairness_map[fid] = fairness_engine.calculate_farmer_fairness_metrics(fid, history)

        # Step 3: Run Deterministic Allocation Engine
        custom_constraints = db.custom_constraints
        alloc_result = allocation_engine.generate_allocation(
            water_resource, water_requests, farmers_dict, fairness_map, custom_constraints
        )

        allocations = alloc_result["allocations"]

        # Step 4: Generate Canal Time Schedule
        schedule_slots = scheduler.generate_schedule(
            allocations, water_requests, float(water_resource.get("canal_capacity", 2500)), custom_constraints
        )

        # Step 5: Compute Overall Fairness Score
        fairness_score = fairness_engine.compute_system_fairness_score(allocations)

        # Step 6: Generate Factual Decision Explanation
        explanation = explanation_generator.generate_explanation(
            allocations, alloc_result["is_critical_shortage"], custom_constraints
        )

        proposal_id = f"prop-{negotiation_id}-r1"
        proposal = {
            "id": proposal_id,
            "negotiation_id": negotiation_id,
            "proposal_round": 1,
            "allocations": allocations,
            "schedule": schedule_slots,
            "total_allocated": alloc_result["total_allocated"],
            "total_available": alloc_result["total_available"],
            "fairness_score": fairness_score,
            "constraint_score": 100.0 if alloc_result["constraint_validation"]["valid"] else 70.0,
            "agreement_score": 0.0,
            "is_critical_shortage": alloc_result["is_critical_shortage"],
            "constraint_validation": alloc_result["constraint_validation"],
            "decision_explanation": explanation,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }

        db.proposals[proposal_id] = proposal

        db.add_audit_log(
            negotiation_id=negotiation_id,
            event_type="PROPOSAL_GENERATED",
            event_data={"proposal_id": proposal_id, "round": 1, "allocations": allocations}
        )

        # Step 7: Digital Farmer Agents Evaluate Initial Proposal
        agent_responses = {}
        for alloc in allocations:
            fid = alloc["farmer_id"]
            farmer_data = farmers_dict.get(fid, {})
            pref_data = pref_dict.get(fid, {})

            agent = FarmerAgent(fid, farmer_data, pref_data)
            eval_res = agent.evaluate_proposal(alloc, custom_constraints)
            agent_responses[fid] = {
                "farmer_name": alloc["farmer_name"],
                "decision": eval_res["decision"],
                "reason": eval_res["reason"]
            }

            db.add_audit_log(
                negotiation_id=negotiation_id,
                event_type="FARMER_ACCEPTED" if eval_res["decision"] == "ACCEPT" else "FARMER_REJECTED",
                event_data={"farmer_id": fid, "farmer_name": alloc["farmer_name"], "reason": eval_res["reason"]}
            )

        # Initial Mediator Message
        farmer_names = [f["farmer_name"] for f in farmers]
        shortage = sum(float(r["requested_water"]) for r in water_requests) - float(water_resource["total_available_water"])

        initial_msg = negotiation_messages.get_mediator_initial_message(max(0, shortage), farmer_names)

        return {
            "negotiation_id": negotiation_id,
            "conflicts": conflicts,
            "proposal": proposal,
            "agent_responses": agent_responses,
            "mediator_message": initial_msg,
            "custom_constraints": custom_constraints
        }

    def process_objection_and_renegotiate(self, negotiation_id, farmer_id, objection_text):
        logger.info(f"Processing objection for negotiation {negotiation_id} from farmer {farmer_id}...")

        farmers_dict = {f["id"]: f for f in db.get_farmers()}
        farmer = farmers_dict.get(farmer_id, {})
        farmer_name = farmer.get("farmer_name", farmer_id)

        # Step 1: Parse objection into structured constraint
        extracted = objection_parser.parse_objection(farmer_id, farmer_name, objection_text)

        # Save objection
        obj_id = f"obj-{uuid.uuid4().hex[:6]}"
        db.objections[obj_id] = {
            "id": obj_id,
            "negotiation_id": negotiation_id,
            "farmer_id": farmer_id,
            "farmer_name": farmer_name,
            "objection_message": objection_text,
            "extracted_constraint": extracted,
            "created_at": datetime.now().isoformat()
        }

        # Step 2: Inject extracted constraint into system constraints
        db.custom_constraints.append(extracted)

        db.add_audit_log(
            negotiation_id=negotiation_id,
            event_type="OBJECTION_ANALYZED",
            event_data={"farmer_id": farmer_id, "objection": objection_text, "extracted_constraint": extracted}
        )

        db.add_audit_log(
            negotiation_id=negotiation_id,
            event_type="CONSTRAINT_ADDED",
            event_data=extracted
        )

        # Step 3: Trigger Renegotiation Workflow
        db.add_audit_log(
            negotiation_id=negotiation_id,
            event_type="RENEGOTIATION_STARTED",
            event_data={"round": 2, "triggered_by": farmer_name}
        )

        water_resource = db.get_water_resource()
        water_requests = db.get_water_requests()
        pref_dict = {p["farmer_id"]: p for p in db.negotiation_preferences.values()}
        history = db.get_fairness_history()

        fairness_map = {f["id"]: fairness_engine.calculate_farmer_fairness_metrics(f["id"], history) for f in db.get_farmers()}

        # Recalculate allocation with updated constraints
        alloc_result = allocation_engine.generate_allocation(
            water_resource, water_requests, farmers_dict, fairness_map, db.custom_constraints
        )

        allocations = alloc_result["allocations"]

        # Recalculate schedule with updated constraints
        schedule_slots = scheduler.generate_schedule(
            allocations, water_requests, float(water_resource.get("canal_capacity", 2500)), db.custom_constraints
        )

        fairness_score = fairness_engine.compute_system_fairness_score(allocations)
        explanation = explanation_generator.generate_explanation(
            allocations, alloc_result["is_critical_shortage"], db.custom_constraints
        )

        revised_proposal_id = f"prop-{negotiation_id}-r2"
        revised_proposal = {
            "id": revised_proposal_id,
            "negotiation_id": negotiation_id,
            "proposal_round": 2,
            "allocations": allocations,
            "schedule": schedule_slots,
            "total_allocated": alloc_result["total_allocated"],
            "total_available": alloc_result["total_available"],
            "fairness_score": fairness_score,
            "constraint_score": 100.0 if alloc_result["constraint_validation"]["valid"] else 70.0,
            "agreement_score": 100.0,
            "is_critical_shortage": alloc_result["is_critical_shortage"],
            "constraint_validation": alloc_result["constraint_validation"],
            "decision_explanation": explanation,
            "status": "revised_accepted",
            "created_at": datetime.now().isoformat()
        }

        db.proposals[revised_proposal_id] = revised_proposal

        db.add_audit_log(
            negotiation_id=negotiation_id,
            event_type="PROPOSAL_REVISED",
            event_data={"proposal_id": revised_proposal_id, "round": 2, "allocations": allocations}
        )

        # Re-evaluate with agents
        agent_responses = {}
        for alloc in allocations:
            fid = alloc["farmer_id"]
            fdata = farmers_dict.get(fid, {})
            pdata = pref_dict.get(fid, {})

            agent = FarmerAgent(fid, fdata, pdata)
            eval_res = agent.evaluate_proposal(alloc, db.custom_constraints)
            agent_responses[fid] = {
                "farmer_name": alloc["farmer_name"],
                "decision": eval_res["decision"],
                "reason": eval_res["reason"]
            }

        # Finalize Agreement since consensus is reached
        final_agreement = agreement_engine.finalize_agreement(negotiation_id, revised_proposal, agent_responses)

        renegotiation_msg = negotiation_messages.get_mediator_renegotiation_message(
            farmer_name, extracted.get("reason", "Labor window constraint")
        )
        consensus_msg = negotiation_messages.get_mediator_consensus_message(
            alloc_result["total_allocated"], fairness_score
        )

        return {
            "negotiation_id": negotiation_id,
            "extracted_constraint": extracted,
            "revised_proposal": revised_proposal,
            "agent_responses": agent_responses,
            "final_agreement": final_agreement,
            "mediator_renegotiation_message": renegotiation_msg,
            "mediator_consensus_message": consensus_msg,
            "audit_logs": db.get_audit_logs(negotiation_id)
        }

mediator_agent = MediatorAgent()
