Facilitator = {
    session_id = ''
};

/**
 * Sets the facilitator's session id.
 * @param {string} session_id the session id
 */
function set_session_id(session_id) {
    Facilitator.session_id = session_id;
}

/**
 * Gets the facilitator's session id.
 * @returns {string} returns the session id 
 */
function get_session_id() {
    return Facilitator.session_id;
}

