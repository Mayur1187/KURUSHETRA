class NegotiationMessages:
    """
    Generates natural human-like agent negotiation messages for the live Mediation Control Center.
    """

    def get_mediator_initial_message(self, shortage_amount, farmer_names):
        return (
            f"Greetings Farmers ({', '.join(farmer_names)}). I am **JalNyay AI**, your neutral autonomous mediator. "
            f"We are facing a total water shortage of **{shortage_amount:,.0f} Liters** relative to total requested demand. "
            f"I have run the deterministic constraint engine to calculate an equitable initial allocation schedule based on urgency, crop criticality, and temporal fairness."
        )

    def get_farmer_acceptance_message(self, farmer_name, allocated_water, start_time, end_time):
        return (
            f"🤖 **{farmer_name} Agent**: Proposal accepted! Allocated volume of **{allocated_water:,.0f} L** "
            f"and canal delivery window ({start_time} - {end_time}) are within my defined negotiation parameters."
        )

    def get_farmer_objection_message(self, farmer_name, objection_text):
        return (
            f"⚠️ **{farmer_name} Agent**: Raising objection! '{objection_text}'. "
            f"I require a constraint revision before accepting this schedule."
        )

    def get_mediator_renegotiation_message(self, farmer_name, constraint_desc):
        return (
            f"⚖️ **JalNyay AI Mediator**: Processing objection from {farmer_name}. "
            f"Adding hard constraint: *{constraint_desc}*. Recalculating allocations and adjusting canal delivery time slots..."
        )

    def get_mediator_consensus_message(self, total_allocated, fairness_score):
        return (
            f"🎉 **JalNyay AI Mediator**: Consensus reached! All farmer digital agents have accepted the revised proposal. "
            f"Total volume allocated: **{total_allocated:,.0f} L** with a System Fairness Score of **{fairness_score}%**. "
            f"Binding agreement recorded in audit log."
        )

negotiation_messages = NegotiationMessages()
