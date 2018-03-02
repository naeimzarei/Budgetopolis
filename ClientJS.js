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
            var currentValId = current_value.replace(/\s/g, '');
            var cardDiv = $("<div class='values-2' id = " + currentValId + " > " + current_value + "</div > ")
            $(".values-container-cards-2").append(cardDiv)
            //$(".values-container-cards-2").on('click', ".values-2", showValueDescription);
        }
    }

    /**
     * Opens popup with description of the selected value
     */

    function showValueDescription() {
        var values = ['Affordable and Safe Housing', 'Clean and Green Environment', 'Financially Conservative', 'High Employment Rate',
            'City infrastructure growth', 'Livable and Well-Maintained Neighborhoods', 'Family-Friendly City',
            'Physically and Culturally Engaged Citizens', 'Safe and Secure Community', 'Well-Maintained Streets', 'Support Cultural Diversity',
            'Support Public Education Growth'];
        var valueDescriptions = ['Support bills, policies, and other measures to ensure every citizen has access to affordable and safe public housing', 'Support bills, and work with lobbyists and other organizations to foster a clean community with an eco friendly mindset',
            'Financially conservative economic mindset. Smaller government expenditures ', 'Support bills and organizations who help individuals without a job find one. A high employment rate gives more confidence to the community',
            'Support legislation to increase funding for public works projects. Roadwork, construction for buildings, restoration, etc', 'Support bills and policies to increase funding on local community beautifying initiatives, along with other residential projects',
            'Foster activities, increase funding for public parks, beautiiying projects, and increase police crackdown on violent crimes', 'Support initiatives to build more parks, recreation centers, and courts for citizens. Also increase attention to arts programs',
            'Support strict surveillance of criminal activity. Heavy support for law enforcement ', 'Support public road and infrastructure projects to ensure roads, bridges, etc are working properly', 'Support initiatives for education on various cultures and their relevance to a productive society',
            'Support bills, legislation, etc for public education (schools , daycares, etc)'];

        for (var i = 0; i < values.length; i++) {
            if (values[i].replace(/\s/g, '') == this.id) {
                openPopup(values[i], valueDescriptions[i]);
                return;
            }
        }
    }

    /**
     * Helper function to open popup with description of the selected value.
     * @param {string} value the community value
     * @param {string} description the description of the community value 
     */
    function openPopup(value, description) {
        // blur the rest of the screen
        blur();
        // populate popup with value and description
        $('.popup-value').text(value);
        $('.popup-description').text(description);
        // show the popup dialogue
        $('.page2-popup').show();
    }

    /**
     * Helper function to close popup with description of the selected value.
     */
    function closePopup() {
        // unblur the rest of the screen
        unblur();
        // hide the popup dialogue
        $('.page2-popup').hide();
    }

    /**
     * Blurs the second page.
     */
    function blur() {
        $('.page2').css({ filter: 'blur(10px)' });
    }

    /**
     * Unblurs the second page.
     */
    function unblur() {
        $('.page2').css({ filter: 'blur(0px)' })
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
    
    /**
     * Create a Google Pie Chart
     * @param {string[]} community_resources the resource values 
     */
    function createGooglePieChart(community_resources) {
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
          var data_values = [];
          data_values.push(['Category', 'Description']);
          
          for (var i = 0; i < community_resources.length; i++) {
            data_values.push([ community_resources[i].name, community_resources[i].value ]);
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

          //below is creating a description array for each community resource, and attaching event handlers 
          //to each section of the pie chart in order to show their description if clicked

        var resourcesDescriptions = []
        resourcesDescriptions.push({ 'Fire': 'Expenditures for fire stations, inspectors, and medic training (first responders)' })
        resourcesDescriptions.push({ 'Parks and Rec': 'Expenditures for athletic programs, recreation centers, and parks' })
        resourcesDescriptions.push({ 'Police': 'Funding for patrol officers, detectives, school safety personnel, etc' })
        resourcesDescriptions.push({ 'Housing': 'Funding for housing developments and their maintenance' })
        resourcesDescriptions.push({ 'Streets': 'Expenditures for the upkeep and development of public roads. E.g. sidewalk repair, repaving, street cleaning' })
        resourcesDescriptions.push({ 'Capital': 'Expenditures on utilities, construction, and government equipment' })
        resourcesDescriptions.push({ 'Planning and Economic Development': 'Planning for economic development assistance, and planning with other governments' })
        resourcesDescriptions.push({ 'Reserves': 'Allocated funds for savings' })
        resourcesDescriptions.push({ 'Solid Waste': 'Funding for garbage collection services, recycling facilities, landfills, etc' })
            
        function selectHandler() {
              var selectedItem = chart.getSelection()[0];
              if (selectedItem) {
                  var resourceClick = data.getValue(selectedItem.row, 0);
                  resourcesDescriptions.forEach(function(resource) {
                      for(var j in resource)
                      if (j == resourceClick) {
                          openPopup(j, resource[j]);
                      }
                  })

              }
          }

          google.visualization.events.addListener(chart, 'select', selectHandler);
          chart.draw(data, options);
        }
    }

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
                    set_values(['Affordable and Safe Housing', 'Clean and Green Environment', 'Financially Conservative', 'High Employment Rate',
                    'City infrastructure growth', 'Livable and Well-Maintained Neighborhoods', 'Family-Friendly City',
                    'Physically and Culturally Engaged Citizens', 'Safe and Secure Community', 'Well-Maintained Streets', 'Support Cultural Diversity',
                    'Support Public Education Growth']);
                    // Check which community value cards have been selected
                    set_values_click_handler();
                    // Create the initial gameboard using canvas
                    set_budget_breakdown([
                        'Fire', 'Parks and Rec', 'Police', 'Housing',
                        'Streets', 'Capital', 'Planning and Economic Development',
                        'Reserves', 'Solid Waste'
                    ]);
                    createGooglePieChart(Client.budget_breakdown);
                    // Update message container text value 
                    updateValuesContainerText('Select exactly 5 community values.');
                }, 150);
            }

            function set_budget_breakdown(community_resources) {
                var budget_breakdown = [];
                for (var i = 0; i < community_resources.length; i++) {
                    budget_breakdown.push({
                        name: community_resources[i],
                        value: Client.total_budget / community_resources.length
                    });
                }
                Client.budget_breakdown = budget_breakdown;
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

        // Shows value description after it has been clicked
        $(".values-container-cards-2").on('click', ".values-2", showValueDescription);
        
        // Close the popup dialogue after the button has been clicked
        $('.popup-button').on('click', function() {
            closePopup();
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