$(document).ready(function() {
    Client = {
        community_values: [],
        num_values_selected: 0
    };
    
    /**
     * Generate the community values at the
     * beggining of the game and save them.
     * @param {string[]} community_values array with community values
     */
    function set_values(community_values) {
        for (var i = 0; i < community_values.length; i++) {
            $(".values-container-cards").append($("<div class='values'>" + community_values[i] + "</div>"));
        }
        Client.community_values = community_values;
    }
    
    /** 
     * Return the community values.
     * @returns {string[]} return the community values
    */
    function get_values() {
        return Client.community_values;
    }

    /**
     * Updates the text mmessage regarding 
     * community values at startup.
     * @param {string} text the updated text message
     */
    function updateValuesContainerText(text) {
        if (text === '') {
            $('.values-container-text').text('Select exactly 5 community values');
        } else {
            $('.values-container-text').text(text);
        }
    }

    /**
     * Sets up event handlers during startup.
     */
    function event_handlers() {
        $(".values").on('click', function(event) {
            var isSelected = $(event.currentTarget).hasClass('selected-value');
            if (isSelected) {
                $(event.currentTarget).removeClass('selected-value');
                $(event.currentTarget).css({boxShadow: ''});
                Client.num_values_selected--;
                updateValuesContainerText('');
            } else if (Client.num_values_selected < 5) {
                $(event.currentTarget).addClass('selected-value');
                $(event.currentTarget).css({boxShadow: '0 0 0 1px gray'});
                Client.num_values_selected++;
                if (Client.num_values_selected === 5) {
                    updateValuesContainerText('Great!')
                } else {
                    updateValuesContainerText('');   
                }
            } else if (Client.num_values_selected >= 5) {
                updateValuesContainerText('You may not select more than 5 community values.');
            }
        });
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
    event_handlers();
});