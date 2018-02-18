$(document).ready(function() {
    Client = {
        // array with all community values 
        community_values: [],
        // the number of values currently selected by the user
        num_values_selected: 0,
        // the number of pages 
        num_pages: 2
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
     * Gets the number of values currently selected. 
     * @returns {number} the number of values selected
     */
    function get_num_values_selected() {
        return Client.num_values_selected;
    }

    /**
     * Increases the number of values currently selected by 1.
     */
    function increment_num_values_selected() {
        Client.num_values_selected++;
    }

    /**
     * Decreases the number of values currently selected by 1. 
     */
    function decrement_num_values_selected() {
        Client.num_values_selected--;
    }

    /**
     * Returns the number of pages in ClientHTML.html
     * @returns {number} the number of pages
     */
    function get_num_pages() {
        return Client.num_pages;
    }

    /**
     * Sets the number of pages the ClientHTML.html has. 
     * @param {number} num_pages the number of pages to be set
     */
    function set_num_pages(num_pages) {
        Client.num_pages = num_pages;
    }

    /**
     * Updates the text mmessage regarding 
     * community values at startup.
     * @param {string} text the updated text message
     */
    function updateValuesContainerText(text) {
        if (text === '') {
            $('.startup-message-container-text').text('Select exactly 5 community values.');
        } else {
            $('.startup-message-container-text').text(text);
        }
    }

    /**
     * Sets up event handlers during startup.
     */
    function event_handlers() {
        // Check which community value cards have been selected
        $(".values").on('click', function(event) {
            var isSelected = $(event.currentTarget).hasClass('selected-value');
            if (isSelected) {
                $(event.currentTarget).removeClass('selected-value');
                $(event.currentTarget).css({boxShadow: ''});
                decrement_num_values_selected();
                updateValuesContainerText('');
                $('.session-container').hide();
            } else if (get_num_values_selected() < 5) {
                $(event.currentTarget).addClass('selected-value');
                $(event.currentTarget).css({boxShadow: '0 0 0 1px gray'});
                increment_num_values_selected();
                if (get_num_values_selected() === 5) {
                    updateValuesContainerText('Great! Enter four-digit the session code given to you by the facilitator to continue.')
                    $('.session-container').show();
                } else {
                    updateValuesContainerText('');   
                }
            } else if (get_num_values_selected() >= 5) {
                updateValuesContainerText('You may not select more than 5 community values.');
            }
        });

        // Check session ID values inputted by the user
        $(".session-container-id").on('input', function(event) {
            var input_length = $(event.target).val().length;
            if (input_length === 4) {
                // Go to page 2
                setTimeout(function() {
                    $('.page1').hide();
                    $('.page2').show();
                }, 250);
            }
        });
    }

    /**
     * Main Method
     * Run any and all initiation code in the main
     * function below. 
     */
     function main() {
        // Populate community value cards using set_values.
        // It is given an array of strings, each string 
        // being a particular community value. 
        set_values([
            'Police', 'Fire', 'Solid Waste', 
            'Streets', 'Recreation', 'Capital',
            'Housing', 'Planning', 'Reserves',
            'Property Taxes'
        ]);

        // Hide session ID container
        $('.session-container').hide();

        // Add event handlers. Note: add more event handlers
        // as needed in event_handlers() function
        event_handlers();

        // Hide other pages besides startup page
        for (var i = 2; i <= Client.num_pages; i++) {
            var current_page = 'page' + i;
            $('.page' + i).hide();
        }
    }

    // Run the main function 
     main();
});