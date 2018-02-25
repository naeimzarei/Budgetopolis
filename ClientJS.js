$(document).ready(function () {
    Client = {
        // array with all community values 
        community_values: ['Affordable and Safe Housing', 'Clean and Green Environment', 'Financially Conservative', 'High Employment Rate',
            'City infrastructure growth', 'Livable and Well-Maintained Neighborhoods', 'Family-Friendly City',
            'Physically and Culturally Engaged Citizens', 'Safe and Secure Community', 'Well-Maintained Streets', 'Support Cultural Diversity',
            'Support Public Education Growth'],
        // array with selected community values
        selected_community_values: [],
        // the number of values currently selected by the user
        num_values_selected: 0,
        // the number of pages 
        num_pages: 2,
        // the facilitator's session id
        session_id: ''
    };

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
     * @param {string[]} community_values array with community values
     */
    function set_values(community_values) {
        for (var i = 0; i < community_values.length; i++) {
            $(".values-container-cards").append($("<div class='values' title=>" + community_values[i] + "</div>"));
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

    function createGooglePieChart() {
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);
  
        function drawChart() {
          var data = google.visualization.arrayToDataTable([
            ['Category', 'Description'],
            [Client.community_values[0], 1],
            [Client.community_values[1], 1],
            [Client.community_values[2], 1],
            [Client.community_values[3], 1],
            [Client.community_values[4], 1],
            [Client.community_values[5], 1],
            [Client.community_values[6], 1],
            [Client.community_values[7], 1]
          ]);
  
          var options = {
            backgroundColor: 'transparent',
            width: 600,
            height: 300,
            chartArea: {
                width: 600,
                height: 300
            },
            pieSliceText: "label",
            pieSliceTextStyle: {
                fontSize: 14,
                color: 'black',
                bold: false,
                fontName: 'Cookie'
            },
            pieStartAngle: 95,
            legend: 'none',
            tooltip: {
                trigger: "selection",
                isHTML: true,
                text: 'none'
            }
          };
  
          var chart = new google.visualization.PieChart(document.getElementById('game-container-board'));  
          chart.draw(data, options);

          chart.setAction({
            id: 'sample',
            text: 'See description',
            action: function() {
              selection = chart.getSelection();
              switch (selection[0].row) {
                case 0: alert(Client.community_values[0]); break;
                case 1: alert(Client.community_values[1]); break;
                case 2: alert(Client.community_values[2]); break;
                case 3: alert(Client.community_values[3]); break;
                case 4: alert(Client.community_values[4]); break;
                case 5: alert(Client.community_values[5]); break;
                case 6: alert(Client.community_values[6]); break;
                case 7: alert(Client.community_values[7]); break;
              }
            }
          });
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
                    set_values(['Affordable and Safe Housing', 'Clean and Green Environment', 'Financially Conservative', 'High Employment Rate',
                    'City infrastructure growth', 'Livable and Well-Maintained Neighborhoods', 'Family-Friendly City',
                    'Physically and Culturally Engaged Citizens', 'Safe and Secure Community', 'Well-Maintained Streets', 'Support Cultural Diversity',
                    'Support Public Education Growth']);
                    // Check which community value cards have been selected
                    set_values_click_handler();
                    // Update message container text value 
                    updateValuesContainerText('Select exactly 5 community values.');
                }, 400);
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
            // Go to page 2 
            setTimeout(function () {
                $('.page1').hide();
                $('.page2').show();
            }, 500);
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

        // Create the gameboard using canvas
        // createBoard();
        createGooglePieChart();
    }
    main();
});