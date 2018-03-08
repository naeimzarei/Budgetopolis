$(document).ready(function () {
    Client = {
        // array with all community values 
        community_values: [],
        // array with all community values descriptions 
        community_values_description: [],
        // array with selected community values
        selected_community_values: [],
        // value and description of resources
        resources: [{}],
        //resources descriptions
        resources_descriptions: [],
        //Budget change options for each resource
        resources_options: [{}],
        //Scenarios for a given community to be used in game
        scenarios: [],
        // the number of values currently selected by the user
        num_values_selected: 0,
        // the number of pages 
        num_pages: 2,
        // the facilitator's session id
        session_id: '',
        //Community Name
        community_name: '',
        //Community description
        community_description: '',
        // the total budget
        total_budget: 0,
        // the budget breakdown by value
        budget_breakdown: [{}],
        //Decisions players made dict - {'resource':'decision'}
        budget_decisions: [{}],
        // array with colors of chart
        chart_colors: [
            '#89882A', '#e69f00', '#56b4e9', 
            '#009e73', '#f0e442', '#0072b2', 
            '#d55e00', '#cc79a7', '#5E60B1'
        ]
    };

    //prep server connection
    const clientPromise = stitch.StitchClientFactory.create('budgetopolis-jyxch');
    var client;
    var db;

    /**
     * Connect to DB and retrieve Community info (name, description, values, values_descriptions, resources,
     * resources_description, scenarios, budget)
     * @param {dict} query //query to execute
     * @param {boolean} city //boolean: true if city, false if county
     * @param {() => void} callback1 the first callback function
     * @param {() => void} callback2 the second callback function
     */
    function connect(query, city, callback1, callback2){
        clientPromise.then(stitchClient =>{
            client = stitchClient;
            db = client.service('mongodb', 'mongodb-atlas').db('budgetopolis');
          
            return client.login().then(getCommunityInfo(query, city, callback1, callback2));
        });
    }

    /**
     * Sets the community resources in Client object 
     * @param {string[]} resources 
     * @param {string[]} resources_descriptions 
     */
    function set_resources(resources, resources_descriptions) {
        var temp = [];
        for (var i = 0; i < resources.length; i++) {
            temp.push({
                [resources[i]]: resources_descriptions[i]
            });
        }
        Client.resources = temp;
    }

    /**
     * Saves community information after information is obtained 
     * from the database 
     * @param {string} query the query to be done
     * @param {boolean} city the city type
     * @param {() => void} callback1 first callback function
     * @param {() => void} callback2 second callback function
     */
    function getCommunityInfo(query, city, callback1, callback2){
        var collection;
        if(city){
            collection = db.collection('City')
        }else{
            collection = db.collection('County')
        }
        collection.find(query).execute().then(result => {
            Client.community_name = result[0]['name']
            Client.community_description = result[0]['description']
            //append community name and description to page 2
            $('.community-info-container-element').append(Client.community_name)
            // console.log(JSON.stringify(result))
            set_values(result[0]['values']);
            set_values_description(result[0]['values_descriptions']);
            set_resources(result[0]['resources'], result[0]['resources_description']);
            Client.scenarios = result[0]['scenarios'] 
            Client.total_budget = parseInt(result[0]['budget'].replace(/,/g, ''));
            set_budget_breakdown(result[0]['resources']);
        }).then(function() {
            callback1();
            callback2();
            getResourceOptions(true);
        });
    }
    /**
     * Get the resources for this community along with the options for budget changes
     * @param {boolean} city //true if city, false if county
     */
    function getResourceOptions(city){
        var query = {}
        var community_resource_options = []; //array of dictionaries
        if(city){
            query = {"community": "city"}
        }else{
            query = {"community": "county"}
        }
        clientPromise.then(stitchClient =>{
            client = stitchClient;
            db = client.service('mongodb', 'mongodb-atlas').db('budgetopolis');
            collection = db.collection('Resources')
            collection.find(query).execute().then(result =>{            
                Object.keys(result[0]).forEach(function(key){
                    Client.resources.forEach(function(resource, index) {
                        if (Client.resources[index][key] !== undefined) {
                            community_resource_options.push({[key]:result[0][key]})
                        }
                    });
                })
                Client.resources_options = community_resource_options;
                return community_resource_options;
            });
        });
    }
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
        for (var i = 0; i < Client.community_values.length; i++) {
            if (Client.community_values[i].replace(/\s/g, '') == this.id) {
                openPopup(Client.community_values[i], Client.community_values_description[i]);
            }
        }
    }

    /**
     * Helper function to open popup with description of the selected value.
     * This is for the second page.
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

    function openBudgetPopup(resource, budget) {
        // blur the rest of the screen
        blur();
        // populate popup with value and description
        $('.popup-description').text('Current budget: $'+budget + '.');
        //TODO add the resource options dropdown
        for (var i = 0; i < Client.budget_breakdown.length; i++) {
            var original_resource_name = Client.budget_breakdown[i]["name"];
            var new_resource_name = Client.budget_breakdown[i]["name"].replace(/ /g, '');

            var temp = $("<select class = 'select-resource-option-" + new_resource_name + "' ></select >");

            $('.popup-resources').append("<div id = 'resource-budget-" + new_resource_name + "'>" + original_resource_name + "  budget: $" + Client.budget_breakdown[i]["value"].toFixed(2));
            // $("#resource-budget-" + new_resource_name).append("<select class = 'select-resource-option-" + new_resource_name + "' ></select >")
            $(".page2-popup-budget").on('change', '.select-resource-option-'+new_resource_name, makeSelectHandlers)
            var resourceOptions = Client.resources_options[i];
            for (var key in resourceOptions) {
                for (var j = 0; j < resourceOptions[key].length; j++) {
                    for (var key2 in resourceOptions[key][j]) {
                        $(temp).append($('<option>', {
                            value: key2 + " ($" + resourceOptions[key][j][key2] + ")",
                            // text: resourceOptions[key][j][key2]
                            text: key2 + " ($" + resourceOptions[key][j][key2] + ")"
                        }));
                    }
                }
            }
            $("#resource-budget-" + new_resource_name).append(temp);
        }

        // show the popup dialogue
        $('.page2-popup-budget').show();
    }
    /**
     * Adds event handlers to select option boxes in budget popup
     */
    function makeSelectHandlers(){
        var eventClass = this.className;
        console.log('class name' + eventClass)
        var resource_name = eventClass.split("_").pop()
        if($(eventClass).length != 0){
            return;
        }
        //TODO, input not showing up
        $("#resource-budget-"+resource_name).append("<br><input type = 'number' id = 'resource-budget-box-"+resource_name+"'></input>")
       
    }

    /**
     * Helper function to close popup with description of the selected value.
     * This is for the second page.
     */
    function closePopup() {
        // unblur the rest of the screen
        unblur();
        // hide the popup dialogue
        $('.page2-popup').hide();
        $('.page2-popup-budget').hide();
    }

    /**
     * Helper function to open popup with description of the selected value.
     * This is for the first page.
     * @param {string} value the community value
     * @param {string} description the description of the community value 
     */
    function openPopup_1(value, description) {
        // blur the rest of the screen
        blur_1();
        // populate popup with value and description
        $('.popup-1-value').text(value);
        $('.popup-1-description').text(description);
        // show the popup dialogue 
        $('.page1-popup').show();
    }

    /**
     * Helper function to close popup with description of the selected value.
     * This is for the first page.
     */
    function closePopup_1() {
        // unblur the rest of the screen
        unblur_1();
        // hide the popup dialogue
        $('.page1-popup').hide();
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
     * Blurs the first page.
     */
    function blur_1() {
        $('.page1').css({ filter: 'blur(10px)' })
    }

     /**
      * Unblurs the first page.
      */
     function unblur_1() {
        $('.page1').css({ filter: 'blur(0px)' })
     }

    /**
     * Generate the community values at the
     * begining of the game and save them.
     * @param {string[]} community_values array with community values
     */
    function set_values(community_values) {
        for (var i = 0; i < community_values.length; i++) {
            $(".values-container-cards").append($("<div class='values' title=>" + community_values[i] + "</div>"));
        }
        Client.community_values = community_values;
    }

    /**
     * Save the community value descriptions. 
     * @param {string[]} community_values_description array with descriptions 
     */
    function set_values_description(community_values_description) {
        Client.community_values_description = community_values_description;
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
     * Function for sending group's decisions each round
     * @param {[{}]} decisions //global variable
     * @param {String} session_id //TODO or name for facilitator?s
     */
    function sendDecisions(decisionsArray, session_id){
        clientPromise.then(stitchClient =>{
            client = stitchClient;
            db = client.service('mongodb', 'mongodb-atlas').db('budgetopolis');
            collection = db.collection('Facilitators')
            var dict = [{_id: new RegExp('*'+ session_id)}, {decisions : decisionsArray}];
            collection.update(dict).execute().then(result =>{
                console.log(result)
            });     
        });
    }
    
    /**
     * Create a Google Pie Chart
     */
    function createGooglePieChart() {
        var community_resources = Client.budget_breakdown;
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
            tooltip: {
                trigger: "focus",
                isHTML: true,
                text: 'none'
            },
            legend: 'none',
            is3D: true,
            colors: Client.chart_colors
          };
  
          var chart = new google.visualization.PieChart(document.getElementById('game-container-board'));

          //below is creating a description array for each community resource, and attaching event handlers 
          //to each section of the pie chart in order to show their description if clicked
            
        function selectHandler() {
              var selectedItem = chart.getSelection()[0];
              if (selectedItem) {
                  var resourceClick = data.getValue(selectedItem.row, 0);
                  Client.resources.forEach(function(resource) {
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
        var shiftX = 0;
        for (var i = 0; i < Client.budget_breakdown.length; i++) {
            var relative_width = find_relative_width(Client.budget_breakdown[i]);

            var measured_text_width = ctx.measureText(Client.budget_breakdown[i].value);

            ctx.fillStyle = Client.chart_colors[i];
            ctx.fillRect(shiftX, 0, beginX + relative_width, ctx.canvas.height);
            ctx.fillStyle = 'black';
            ctx.font = "16px EB Garamond";
            ctx.fillText(Client.budget_breakdown[i].name, shiftX + (ctx.canvas.width / 35), ctx.canvas.height / 2);
            ctx.fillText(
                "$" + parseInt(Client.budget_breakdown[i].value, 10).toString(), 
                shiftX + (ctx.canvas.width / 35), 
                (ctx.canvas.height / 2) + 20
            );
            beginX += relative_width;
            shiftX += relative_width;
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
     * Helper function to obtain the index of community value description.
     * @param {string} value the community value 
     * @returns {number} the index at which the value occurs in Client.community_values_description 
     */
    function get_description_index(value) {
        for (var i = 0; i < Client.community_values.length; i++) { 
            if (Client.community_values[i] === value) { 
                return i;
            } 
        }
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

    /**
     * Sets up event handlers during startup.
     */
    function event_handlers() {
        // Check session ID values inputted by the user
        $(".session-container-id").on('input', function (event) {
            var input_length = $(event.target).val().length;
            if (input_length === 4) {
                // Save the session ID
                set_session_id($(event.target).val());
                // Hide the session ID icon
                $('.session-container').hide();
                // Obtain information from database and save 
                connect({}, true, set_values_click_handler, createGooglePieChart);
                // Update message container text value 
                updateValuesContainerText('Select exactly 5 community values.');
            }
        });

        function set_values_click_handler() {
            $(".values").on('click', function (event) {
                var isSelected = $(event.currentTarget).hasClass('selected-value');
                var value = $(event.target).text();
                var description = Client.community_values_description[get_description_index(value)];
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
                    // Save selected community values
                    Client.selected_community_values.push($(event.currentTarget));
                    // Display popup with correct value and description 
                    openPopup_1(value, description);
                } else if (get_num_values_selected() >= 5) {
                    // Update the message container text value
                    updateValuesContainerText('You may not select more than 5 community values.');
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

         //Shows community description when clicked.
        $('.community-info-title-container-text').on('click',function(){
            console.log('name div clicked')
            openPopup(Client.community_name, Client.community_description);
        });

        // Shows value description after it has been clicked
        $(".values-container-cards-2").on('click', ".values-2", showValueDescription);
        
        // Close the popup dialogue after the button has been clicked
        $('.popup-button').on('click', function() {
            closePopup();
        });
        //Send decisions to decisions text-area TODO, not registering
        $('.popup-button-submit').on('click', function(){
            console.log('submit clicked')
            //get resource name from class name
            var resource = this.className.split('-').pop(); 
           
            var decision = $('.inputBudgetChange').val();
            Client.budget_decisions.push({resource: decision})

            console.log(JSON.stringify(Client.budget_decisions))
            //sendDecisions(Client.budget_decisions, Client.session_id)

            closePopup();
        })

        // Shows community value descriptions when clicked on the first page
        $('.popup-1 button').on('click', function(event) {
            var val = $(event.target).text();
            var length = Client.selected_community_values.length;
            if (val.toLowerCase() === 'select') {
                // Give selected community value a selected-value CSS class
                $(Client.selected_community_values[length - 1]).addClass('selected-value');
                // Add an outline to selected community value so user knows it has been selected 
                $(Client.selected_community_values[length - 1]).css({ boxShadow: '0 0 0 1px gray' });
                // Increment number of values currently selected 
                increment_num_values_selected();
                // Close the popup after selection
                closePopup_1();
                // Show continue button
                if (get_num_values_selected() === 5) {
                    // Update message container
                    updateValuesContainerText('Great! Click the button below to continue.');
                    // Show play game button
                    $('.play-game-container').show();
                }
            } 
            // Close the popup
            closePopup_1();
        });

        $('#budget-container-bar').on('click', function(event) {
            // dynamically sized canvas size
            var window_width = 0.8 * window.innerWidth;
            // where the client X mouse made the click event
            var cx = event.clientX;
            // where the client Y mouse made the click event
            var cy = event.clientY;
            // range of widths for each componetn of budget bar
            var ranges = [];

            var beginX = parseInt((window.innerWidth * 0.5) - (window.innerWidth * 0.4), 10);
            for (var i = 0; i < Client.budget_breakdown.length; i++) {
                var relative_width = find_relative_width(Client.budget_breakdown[i]);
                ranges.push({
                    x1: beginX,
                    x2: beginX + relative_width
                });
                beginX += relative_width;
            }

            ranges.forEach(function(i, index) {
                if (cx >= ranges[index].x1 && cx <= ranges[index].x2) {
                    console.log(Client.budget_breakdown[index].name);
                    openBudgetPopup(Client.budget_breakdown[index].name, Client.budget_breakdown[index].value.toFixed(2))
                }
            });

            function find_relative_width(budget_value) {
                return window_width * (budget_value.value / Client.total_budget);
            }
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

        // TODO
        // getResourceOptions(true)

        // Hide other pages besides startup page
        for (var i = 2; i <= get_num_pages(); i++) {
            var current_page = 'page' + i;
            $('.page' + i).hide();
        }
    }
    main();
});