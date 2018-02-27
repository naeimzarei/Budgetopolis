$(document).ready(function () {
    Client = {
        // array with all community values 
        community_values: [],
        // array with selected community values
        selected_community_values: [],
        // the number of values currently selected by the user
        num_values_selected: 0,
        // the number of pages 
        num_pages: 2,
        // the facilitator's session id
        session_id: '',
        // the total budget
        total_budget: 50000000,
        // the budget breakdown by value
        budget_breakdown: [{}]
    };

    /**
     * Gets the amount of budget left
     * @returns {number} the budget
     */
    function get_total_budget() {
        return Client.budget;
    }

    /**
     * Sets the amount of budget left
     * @param {number} total_budget the budget left
     */
    function set_total_budget(total_budget) {
        Client.budget = budget;
    }

    /**
     * Sets the gameboard values on page 2.
     * @param {array({})} values array of selected community values 
     */
    function set_gameboard_values(values) {
        for (var i = 0; i < values.length; i++) {
            var current_value = $(values[i]).text();
            $(".values-container-cards-2").append($("<div class='values-2'>" + current_value + "</div>"));
        }
    }

    /**
     * Returns the selected community values 
     * @returns {string[]} array with selected community values 
     */
    function get_gameboard_values() {
        return Client.selected_community_values;
    }

    /**
     * Generate the community values at the
     * beggining of the game and save them.
     * In addition, sets the initial community value
     * budget.
     * @param {string[]} community_values array with community values
     */
    function set_values(community_values) {
        var budget_breakdown = [];
        for (var i = 0; i < community_values.length; i++) {
            $(".values-container-cards").append($("<div class='values' title=>" + community_values[i] + "</div>"));
            budget_breakdown.push({
                name: community_values[i],
                value: Client.total_budget / community_values.length
            });
        }
        Client.community_values = community_values;
        Client.budget_breakdown = budget_breakdown;
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
     * Sets the session id given by the facilitator.
     * @param {string} session_id the session id given by facilitator
     */
    function set_session_id(session_id) {
        Client.session_id = session_id;
    }

    /**
     * Returns the session id given by the facilitator
     * @returns {string} the session id given by facilitator
     */
    function get_session_id() {
        return Client.session_id;
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
     * Create gameboard circle function
     */

    function createBoard() {
        var canvas = document.getElementById("game-canvas");
        var ctx = canvas.getContext("2d");
        // Colors
        var colors = ['#4CAF50', '#00BCD4', '#E91E63', '#FFC107', '#9E9E9E', '#CDDC39', '#42f4f1', '#f49d41'];
        // List of Angles
        var angles = [
            Math.PI * 0.25, Math.PI * 0.25, Math.PI * 0.25, Math.PI * 0.25, 
            Math.PI * 0.25, Math.PI * 0.25, Math.PI * 0.25, Math.PI * 0.25
        ];
        // Temporary variables, to store each arc angles
        var beginAngle = 0;
        var endAngle = 0;
        // Iterate through the angles
        for (var i = 0; i < angles.length; i++) {
            // Begin where we left off
            beginAngle = endAngle;
            // End Angle
            endAngle = endAngle + angles[i];
            ctx.beginPath();
            // Fill color
            ctx.fillStyle = colors[i % colors.length];
            ctx.moveTo(200, 200);
            ctx.arc(200, 200, 120, beginAngle, endAngle);
            ctx.lineTo(200, 200);
            ctx.stroke();
            // Fill
            ctx.fill();
        }
    }

    /**
     * Create a Google Pie Chart
     */
    function createGooglePieChart() {
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);
  
        function drawChart() {
          var data_values = [];
          data_values.push(['Category', 'Description']);
          for (var i = 0; i < Client.budget_breakdown.length; i++) {
            data_values.push([ Client.community_values[i], Client.budget_breakdown[i].value ]);
          }  
          var data = google.visualization.arrayToDataTable(data_values);
  
          var options = {
            backgroundColor: 'transparent',
            width: 600,
            height: 300,
            chartArea: {
                width: 600,
                height: 300
            },
            fontSize: 14,
            pieSliceText: "percentage",
            pieSliceTextStyle: {
                fontSize: 18,
                color: 'black',
                bold: false,
                fontName: 'Didot'
            },
            pieStartAngle: 95,
            tooltip: {
                trigger: "focus",
                isHTML: true,
                text: 'none'
            },
            legend: 'none'
          };
  
          var chart = new google.visualization.PieChart(document.getElementById('game-container-board'));  
          chart.draw(data, options);
        }
    }

    // TODO
    /**
     * Updates the size and the values of the budget bar
     * dynamically.
     */
    function updateBudgetBar() {
        // Obtain reference to canvas from DOM
        var ctx = document.getElementById("budget-container-bar").getContext("2d");
        // Adjust canvas size as the window size changes horizontally
        ctx.canvas.width = 0.8 * window.innerWidth;
        // Do not continue if community values have not been set yet
        if (Client.community_values.length === 0) { return; }
        // Draw the rectangles
        var beginX = 0;
        for (var i = 0; i < Client.budget_breakdown.length; i++) {
            var relative_width = find_relative_width(Client.budget_breakdown[i]);
            ctx.rect(0, 0, beginX + relative_width, ctx.canvas.height);
            beginX += relative_width;
            ctx.stroke();
        }

        /**
         * Helper function to find relative width of budget component on canvas
         * @param {{}} budget_value object with value's name and budget amount
         * @returns {number} the relative width of budget component 
         */
        function find_relative_width(budget_value) {
            return ctx.canvas.width * (budget_value.value / Client.total_budget);
        }
    }

    /**
     * Sets up event handlers during startup.
     */
    function event_handlers() {
        // Check session ID values inputted by the user
        $(".session-container-id").on('input', function (event) {
            var input_length = $(event.target).val().length;
            if (input_length === 4) {
                setTimeout(function() {
                    // Save the session ID
                    set_session_id($(event.target).val());
                    // Hide the session ID icon
                    $('.session-container').hide();
                    // Show the community values, obtained from the database
                    set_values([
                        'Fire', 'Parks and Rec', 'Police',
                        'Housing', 'Streets', 'Capital',
                        'Planning and Economic Development', 'Debt Services', 'Solid Waste'
                    ]);
                    // Check which community value cards have been selected
                    set_values_click_handler();
                    // Create the initial gameboard using canvas
                    createGooglePieChart();
                    // Update message container text value 
                    updateValuesContainerText('Select exactly 5 community values.');
                }, 150);
            }
        });

        function set_values_click_handler() {
            $(".values").on('click', function (event) {
                var isSelected = $(event.currentTarget).hasClass('selected-value');
                if (isSelected) {
                    // Remove CSS class of now unselected value 
                    $(event.currentTarget).removeClass('selected-value');
                    $(event.currentTarget).css({ boxShadow: '' });
                    // Decrease number of values selected by 1
                    decrement_num_values_selected();
                    // Set message container to default text value
                    updateValuesContainerText('');
                    // Hide the continue button 
                    $('.play-game-container').hide();
                } else if (get_num_values_selected() < 5) {
                    // Selecting a particular value gives it a particular class
                    $(event.currentTarget).addClass('selected-value');
                    // Selecting a particular value it a border outline 
                    $(event.currentTarget).css({ boxShadow: '0 0 0 1px gray' });
                    // Increase the number of values selected by 1
                    increment_num_values_selected();
                } else if (get_num_values_selected() >= 5) {
                    // Update the message container text value
                    updateValuesContainerText('You may not select more than 5 community values.');
                }
                // Show continue button
                if (get_num_values_selected() === 5) {
                    // Update message container
                    updateValuesContainerText('Great! Click the button below to continue.');
                    // Show play game button
                    $('.play-game-container').show();
                }
            });
        }

        // set click handler for continue button 
        $('.play-game-container-button').on('click', function(event) {
            // Set gameboard values on page 2
            set_gameboard_values($(".selected-value").toArray());
            // Initial update of the budget bar
            updateBudgetBar();
            // Go to page 2 
            setTimeout(function () {
                $('.page1').hide();
                $('.page2').show();
            }, 150);
        });

        // Resize the budget bar as window width changes
        $(window).on('resize', function() {
            // Updates the budget bar dynamically
            updateBudgetBar();
        });
    }

    /**
     * Main Method
     * Run any and all initiation code in the main
     * function below. 
     */
    function main() {
        // Add event handlers. Note: add more event handlers
        // as needed in event_handlers() function
        event_handlers();

        // Hide other pages besides startup page
        for (var i = 2; i <= get_num_pages(); i++) {
            var current_page = 'page' + i;
            $('.page' + i).hide();
        }
    }
    main();
});