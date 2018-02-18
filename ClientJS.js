$(document).ready(function() {
    Client = {
        community_values: []
    };
    
    /**
     * Generate the community values at the
     * beggining of the game and save them.
     * @param {string[]} community_values array with community values
     */
    function set_values(community_values) {
        for (var i = 0; i < community_values.length; i++) {
            $(".values-container-inner").append($("<div class='values'>" + community_values[i] + "</div>"));
        }
        Client.community_values = community_values;
    }
    
    /** 
     * Return the community values
     * @returns {string[]} 
    */
    function get_values() {
        return Client.community_values;
    }
    
    /**
     * Test
     */
     set_values([
        'Value 1', 'Value 2', 'Value 3', 
        'Value 4', 'Value 5', 'Value 6',
        'Value 7', 'Value 8', 'Value 9',
        'Value 10'
    ]);
});