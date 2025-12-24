VALID_TRANSITIONS = {
    "created": ["picked_up", "cancelled"],
    "picked_up": ["in_transit", "cancelled"],
    "in_transit": ["delivered"],
    "delivered": [],
    "cancelled": [],
}


def is_valid_transition(old_status, new_status):
    return new_status in VALID_TRANSITIONS.get(old_status, [])
