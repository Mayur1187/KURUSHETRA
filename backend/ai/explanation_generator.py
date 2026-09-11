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

explanation_generator = ExplanationGenerator()
