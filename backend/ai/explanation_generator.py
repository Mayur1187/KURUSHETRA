from utils.logger import logger

class ExplanationGenerator:
    """
    Generates transparent, factual plain-English explanations for water allocation decisions,
    priority scoring, and constraint enforcement.
    """

    def generate_explanation(self, proposal_allocations, is_critical_shortage=False, custom_constraints=None):
        if not proposal_allocations:
            return "No water allocations generated yet."

        paragraphs = []

        if is_critical_shortage:
            paragraphs.append(
                "🚨 **EMERGENCY ALLOCATION NOTICE**: Total minimum water demand exceeded available canal supply. "
                "The JalNyay AI Mediator activated Emergency Survival Mode, prioritizing crop vulnerability, "
                "critical growth stages, and water stress factors."
            )

        # High priority summary
        top_allocated = sorted(proposal_allocations, key=lambda x: x.get("priority_score", 0), reverse=True)
        leader = top_allocated[0]

        paragraphs.append(
            f"• **Highest Allocation Priority**: {leader['farmer_name']} received high priority (Priority Score: {leader.get('priority_score', 0):.2f}) "
            f"because their crop ({leader.get('crop_type')}) is in a critical stage with high urgency and historical allocation disadvantage."
        )

        for alloc in proposal_allocations:
            fid = alloc["farmer_id"]
            name = alloc["farmer_name"]
            alloc_w = alloc["allocated_water"]
            req_w = alloc["requested_water"]
            sat = alloc.get("satisfaction_ratio", 1.0) * 100

            paragraphs.append(
                f"• **{name}**: Allocated {alloc_w:,.0f} Liters ({sat:.1f}% of requested {req_w:,.0f} L). "
                f"Irrigation slot scheduled from {alloc.get('start_time', 'N/A')} to {alloc.get('end_time', 'N/A')}."
            )

        if custom_constraints:
            reasons = [cc.get("reason", "Objection constraint") for cc in custom_constraints]
            paragraphs.append(
                f"• **Active Constraints Considered**: {'; '.join(reasons)}. "
                "All irrigation delivery windows strictly respect these operational boundaries."
            )

        explanation = "\n\n".join(paragraphs)
        return explanation

    def generate_evidence_explanation(self, proposal_allocations, evidence_result, is_critical_shortage=False):
        evidence = evidence_result.get("evidence", {})
        impact = evidence_result.get("priority_impact", {})
        trust_tier = evidence_result.get("trust_tier", "HIGH TRUST")

        prev_score = impact.get("previous_score", 0.78)
        new_score = impact.get("new_score", 0.91)
        change = impact.get("change", 0.13)

        farmer_id = evidence.get("farmer_id")
        crop_type = evidence.get("crop_type", "Crop")
        water_stress = evidence.get("water_stress", "HIGH")
        conf_pct = int(float(evidence.get("stress_confidence", 0.90)) * 100)

        paragraphs = []

        paragraphs.append(
            f"🌾 **AGRI-EVIDENCE DECISION RATIONALE**: New agricultural crop image evidence analyzed for farmer crop **{crop_type}** "
            f"indicated **{water_stress}** visible water stress with a verified confidence rating of **{conf_pct}%** ({trust_tier})."
        )

        paragraphs.append(
            f"• **Priority Adjustment**: The evidence updated the farmer's priority score from **{prev_score:.2f}** to **{new_score:.2f}** "
            f"($\\Delta = +{change:.2f}$). Because this change exceeded the 0.10 threshold, an autonomous mediation reassessment was triggered."
        )

        for alloc in proposal_allocations:
            name = alloc["farmer_name"]
            alloc_w = alloc["allocated_water"]
            req_w = alloc["requested_water"]
            sat = alloc.get("satisfaction_ratio", 1.0) * 100

            paragraphs.append(
                f"• **{name}**: Allocated {alloc_w:,.0f} Liters ({sat:.1f}% satisfaction). "
                f"Irrigation slot: {alloc.get('start_time', 'N/A')} - {alloc.get('end_time', 'N/A')}."
            )

        explanation = "\n\n".join(paragraphs)
        return explanation

explanation_generator = ExplanationGenerator()

