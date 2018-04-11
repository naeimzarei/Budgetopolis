$(document).ready(function () {
    Client = {
        // array with all community values 
        community_values: [],
        // array with all community values descriptions 
        community_values_description: [],
        // array with selected community values
        selected_community_values: [],
        // links the selected community values to resources/areas
        associations: [],
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
            '#d55e00', '#474747', '#5E60B1'
        ],
        // TODO: dictionary with user choices
        user_choices: {}
    };

    //prep server connection
    const clientPromise = stitch.StitchClientFactory.create('budgetopolis-jyxch');
    var client;
    var db;
    var budgetChangesSubmitted = false;
    var initial_budget_breakdown = [];
   
    
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
            $('.community-info-title-container-text').append(Client.community_name)
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
    	var colors = ["#FF3333", "#0080FF", "#7F00FF", "#009900", "#CC00CC"];

        for (var i = 0; i < values.length; i++) {
            var current_value = $(values[i]).text();
            var currentValId = current_value.replace(/\s/g, '');
            var cardDiv = $("<div class='values-2' id = " + currentValId + " > " + current_value + "</div > ")
            $(".values-container-cards-2").append(cardDiv)
            $("#" + currentValId).css("background-color", colors[i])
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

    /**
     * Opens a popup, allowing the user to make 
     * changes to the budget of each resource. 
     * @param {string} resource_name 
     */
    var previous_resource_name;
    var initial_resource_budget;
    function openBudgetPopupAlt(resource_name) {
        // check if value is in resources name
        var shouldReturn = true;
        for (var i = 0; i < Client.resources.length; i++) {
            for (name in Client.resources[i]) {
                if (name === resource_name) {
                    shouldReturn = false;
                    break;
                }
            }
        }
        // return if value is not in Client.resources 
        if (shouldReturn) {
            return;
        }
        // blur the screen
        blur();
        // show the budget popup
        $('.page2-popup-budget-alt').show();
        // create each row of the popup 
        render_rows();
        // add event handler for each row of the popup
        // TODO
        // add_row_handler();
        // todo
        add_rows();

        // $('#submitBudgetButton').click(function(){
        //     //TODO get array of budget changes and send to DB
        //     // make sure they have made proper adjustments before closing
        //     var unsanitized_budget = unsanitize_budget($('.budget-table-adjustments').text());
        //     if (isNaN(unsanitized_budget) === false) {
        //         $('.popup-container-title-alt').text('Please make some adjustments first.');
        //         console.log('must be here?');
        //         return;
        //     } else {
        //         $('.popup-container-title-alt').text('Resources Budgeting');
        //     }
        //     // close the budget popup
        //     $('.page2-popup-budget-alt').hide();
        //     // unblur the screen
        //     unblur();
        //     budgetChangesSubmitted = true;

        //     // check if number is valid 
        //     if (sanitize_input($('.budget-table-2-values-adjustments').val())) {
        //         // hide second popup. do not show first popup!
        //         $('.page2-popup-budget-alt-2').hide();
        //         // change adjustment title 
        //         $('.budget-table-2-header-adjustmnets').text('Adjustments');
        //         // adjust budget accordingly 
        //         perform_budget_logic();
        //         // clear adjustment input 
        //         $('.budget-table-2-values-adjustments').val('');
        //         // clear modifier on second popup 
        //         $('.popup-container-select-modifier').val('');
        //     }

        //     /**
        //      * Adjusts the budget by applying some mathematical logic.
        //      */
        //     function perform_budget_logic() {
        //         // obtain adjustment 
        //         var adjustment = Number($('.budget-table-2-values-adjustments').val());
        //         // name of resource that was changed 
        //         var adjusted_resource_name = previous_resource_name;
        //         // update budget breakdown
        //         update_budget_breakdown(adjusted_resource_name, adjustment);
        //         // update the rows on the popup table
        //         render_rows();
        //         // remove previous event handler for the rows
        //         remove_row_handler();
        //         // add event handlers for the new rows
        //         add_row_handler();
        //         // update google pie chart
        //         createGooglePieChart();
        //     }

        //     /**
        //      * Updates the budget breakdown variable
        //      * as needed. Updates the graph and budget
        //      * bar as well. 
        //      * @param {string} resource_name the resource to be modified
        //      * @param {number} resource_value the modifier value 
        //      */
        //     function update_budget_breakdown(resource_name, resource_value) {
        //         for (var i = 0; i < Client.budget_breakdown.length; i++) {
        //             if (Client.budget_breakdown[i].name === resource_name) {
        //                 var selected_budget_option = $('.popup-container-select').find(':selected').text().trim();
        //                 var selected_value = selected_budget_option.substring(
        //                     selected_budget_option.indexOf('(') + 2,
        //                     selected_budget_option.length - 2
        //                 ).replace(/,/g, '').replace('$', '');
        //                 var initial = parseFloat(Client.budget_breakdown[i].value.toFixed(2));
        //                 var multiplier = parseInt($('.popup-container-select-modifier').val(), 10);
        //                 var adjustment = parseFloat($('.budget-table-2-values-adjustments').val());
        //                 Client.user_choices['resource_name'] = Client.budget_breakdown[i].name;
        //                 // no values set for multiplier or budget breakdown
        //                 if (selected_value === '-' || isNaN(multiplier)) {
        //                     // change budget without further modification
        //                     Client.budget_breakdown[i].value += resource_value;
        //                     Client.user_choices['option'] = 'none';
        //                     Client.user_choices['budget_change'] = (resource_value).toString();
        //                 } else {
        //                     if (isNaN(adjustment)) {
        //                         Client.budget_breakdown[i].value = initial + (multiplier * selected_value);
        //                         Client.user_choices['option'] = 'none';
        //                         Client.user_choices['budget_change'] = (multiplier * selected_value).toString();
        //                     } else {
        //                         Client.budget_breakdown[i].value = initial + adjustment + (multiplier * selected_value);
        //                         var choice = $('.popup-container-select').find(':selected').text().trim();
        //                         Client.user_choices['option'] = choice.substring(0, choice.indexOf('(') - 1);
        //                         Client.user_choices['budget_change'] = (adjustment + (multiplier * selected_value)).toString();
        //                     }
        //                 }
        //                 Client.user_choices['combined_budget'] = Client.budget_breakdown[i].value.toFixed(2);
        //             }
        //         }
        //     }
            
        //     // remove previous event handler to prevent multiple event handlers from being attached 
        //     // to submitBudgetButton. Multiple event handlers means that this function will be called x many 
        //     // times, depending on how many times the event handler is being registered each time the event is called. 
        //     $('#submitBudgetButton').off();

        
        // });

        // TODO: now
        // show the second budget popup
        function add_rows() {
            // hide first popup
            $('.page2-popup-budget-alt').hide();
            // show the second popup 
            $('.page2-popup-budget-alt-2').show();
            // add title to second popup
            $('.popup-container-title-alt-2').text(resource_name);
            // save title to variable 
            previous_resource_name = $('.popup-container-title-alt-2').text();
            // add current budget value 
            $('.budget-table-2-values-current').text(sanitize_budget(find_current_value()));
            // add dropdowns for budget 
            add_dropdowns();

            function add_dropdowns() {
                // the selected resource 
                var selected_resource;
                // the selected resource index
                var selected_index;
                // remove previous select options
                $('.popup-container-select').empty();
                // find which resource was selected 
                for (var i = 0; i < Client.resources_options.length; i++) {
                    if (Client.resources_options[i][$(event.target).text()]) {
                        selected_resource = $(event.target).text();
                        selected_index = i;
                        break;
                    }
                }
                // add initial budgeting option: none
                $('.popup-container-select').append(`<option value='none'> - </option>`);
                // add budgeting options for that resource
                var budget_options_array = Client.resources_options[selected_index][selected_resource];
                for (var i = 0; i < budget_options_array.length; i++) {
                    for (option in budget_options_array[i]) {
                        var option_value = budget_options_array[i][option];
                        var modified_option_value = sanitize_budget(option_value).substring(0, sanitize_budget(option_value).indexOf('.'));
                        $('.popup-container-select').append(
                            `<option value=${option}> 
                                ${option + ' ( ' + modified_option_value + ' )'} 
                            </option>`
                        );
                    }
                }
                
            }

            /**
             * Finds the current value from Client.budget_breakdown
             * @returns the current value 
             */
            function find_current_value() {
                for (var i = 0; i < Client.budget_breakdown.length; i++) {
                    if (Client.budget_breakdown[i].name === $(event.target).text()) {
                        initial_resource_budget = Client.budget_breakdown[i].value;
                        return Client.budget_breakdown[i].value;
                    }
                }
            }
        }

        /**
         * Adds event handler for the popup 
         * rows on the table. 
         */
        function add_row_handler() {
            // event handler for budget popup rows
            $('.budget-table-row-name').on('click', function(event) {
                // hide first popup
                $('.page2-popup-budget-alt').hide();
                // show the second popup 
                $('.page2-popup-budget-alt-2').show();
                // add title to second popup
                $('.popup-container-title-alt-2').text($(event.target).text());
                // save title to variable
                previous_resource_name = $('.popup-container-title-alt-2').text();
                // add current budget value 
                $('.budget-table-2-values-current').text(sanitize_budget(find_current_value()));
                // add dropdowns for budget
                add_dropdowns();

                /**
                 * Adds the dropdown for the budget
                 * decisions by obtaining it from the database.
                 */
                function add_dropdowns() {
                    // the selected resource 
                    var selected_resource;
                    // the selected resource index
                    var selected_index;
                    // remove previous select options
                    $('.popup-container-select').empty();
                    // find which resource was selected 
                    for (var i = 0; i < Client.resources_options.length; i++) {
                        if (Client.resources_options[i][$(event.target).text()]) {
                            selected_resource = $(event.target).text();
                            selected_index = i;
                            break;
                        }
                    }
                    // add initial budgeting option: none
                    $('.popup-container-select').append(`<option value='none'> - </option>`);
                    // add budgeting options for that resource
                    var budget_options_array = Client.resources_options[selected_index][selected_resource];
                    for (var i = 0; i < budget_options_array.length; i++) {
                        for (option in budget_options_array[i]) {
                            var option_value = budget_options_array[i][option];
                            var modified_option_value = sanitize_budget(option_value).substring(0, sanitize_budget(option_value).indexOf('.'));
                            $('.popup-container-select').append(
                                `<option value=${option}> 
                                    ${option + ' ( ' + modified_option_value + ' )'} 
                                </option>`
                            );
                        }
                    }
                    
                }

                /**
                 * Finds the current value from Client.budget_breakdown
                 * @returns the current value 
                 */
                function find_current_value() {
                    for (var i = 0; i < Client.budget_breakdown.length; i++) {
                        if (Client.budget_breakdown[i].name === $(event.target).text()) {
                            initial_resource_budget = Client.budget_breakdown[i].value;
                            return Client.budget_breakdown[i].value;
                        }
                    }
                }
            });
        }

        /**
         * Removes the event handler for the popup
         * rows on the table. 
         */
        function remove_row_handler() {
            $('.budget-table-row-name').off();
        }

        // TODO: now
        // event handler for second budget popup adjustments
        $('.budget-table-2-values-adjustments').on('input', function(event) {
            // check if input is a number
            sanitize_input($(event.target).val());
        });

        // event handler for second budget popup button 
        // TODO: now
        $('.popup-container-alt-2-button').on('click', function(event) {
            // check if number is valid
            if (sanitize_input($('.budget-table-2-values-adjustments').val())) {
                // hide second popup
                $('.page2-popup-budget-alt-2').hide();
                // change adjustment title 
                $('.budget-table-2-header-adjustments').text('Adjustments');
                // adjust budget accordingly
                perform_budget_logic();
                // clear adjustment input
                $('.budget-table-2-values-adjustments').val('');
                // clear modifier on second popup 
                $('.popup-container-select-modifier').val('');
                // unblur screen
                unblur();
            }
            

            /**
             * Adjusts the budget by applying some mathematical logic.
             */
            function perform_budget_logic() {
                // obtain adjustment 
                var adjustment = Number($('.budget-table-2-values-adjustments').val());
                // name of resource that was changed 
                var adjusted_resource_name = previous_resource_name;
                // update budget breakdown
                update_budget_breakdown(adjusted_resource_name, adjustment);
                // update the rows on the popup table
                render_rows();
                // remove previous event handler for the rows
                remove_row_handler();
                // add event handlers for the new rows
                add_row_handler();
                // udpate budget bar
                // TODO: remove
                // updateBudgetBar();
                // update google pie chart
                createGooglePieChart();
            }

            /**
             * Updates the budget breakdown variable
             * as needed. Updates the graph and budget
             * bar as well. 
             * @param {string} resource_name the resource to be modified
             * @param {number} resource_value the modifier value 
             */
            function update_budget_breakdown(resource_name, resource_value) {
                for (var i = 0; i < Client.budget_breakdown.length; i++) {
                    if (Client.budget_breakdown[i].name === resource_name) {
                        var selected_budget_option = $('.popup-container-select').find(':selected').text().trim();
                        var selected_value = selected_budget_option.substring(
                            selected_budget_option.indexOf('(') + 2, 
                            selected_budget_option.length - 2
                        ).replace(/,/g, '').replace('$', '');
                        var initial = parseFloat(Client.budget_breakdown[i].value.toFixed(2));
                        var multiplier = parseInt($('.popup-container-select-modifier').val(), 10);
                        var adjustment = parseFloat($('.budget-table-2-values-adjustments').val());
                        Client.user_choices['resource_name'] = Client.budget_breakdown[i].name;
                        // no values set for multiplier or budget breakdown
                        if (selected_value === '-' || isNaN(multiplier)) {
                            // change budget without further modification
                            Client.budget_breakdown[i].value += resource_value;
                            Client.user_choices['option'] = 'none';
                            Client.user_choices['budget_change'] = (resource_value).toString();
                        } else {
                            if (isNaN(adjustment)) {
                                Client.budget_breakdown[i].value = initial + (multiplier * selected_value);
                                Client.user_choices['option'] = 'none';
                                Client.user_choices['budget_change'] = (multiplier * selected_value).toString();
                            } else {
                                Client.budget_breakdown[i].value = initial + adjustment + (multiplier * selected_value);
                                var choice = $('.popup-container-select').find(':selected').text().trim();
                                Client.user_choices['option'] = choice.substring(0, choice.indexOf('(') - 1);
                                Client.user_choices['budget_change'] = (adjustment + (multiplier * selected_value)).toString();
                            }
                        }
                        Client.user_choices['combined_budget'] = Client.budget_breakdown[i].value.toFixed(2);
                    }
                }
            }
        });

        /**
         * Creates new child nodes for the popup
         * table element. 
         */
        function render_rows() {
            // sum variable for total current budget
            var current_budget_sum = 0;
            // empty child nodes
            $('.budget-table').empty();
            // create new child nodes
            for (var i = 0; i < Client.budget_breakdown.length; i++) {
                current_budget_sum += Client.budget_breakdown[i].value;
                var table_row = $(
                    `<tr class='budget-table-row-" + ${i} + " budget-table-row'>
                        <td class='budget-table-row-name'>${Client.budget_breakdown[i].name}<td> 
                        <td class='budget-table-row-value'>${sanitize_budget(Client.budget_breakdown[i].value)}<td> 
                    </tr>`
                );
                $('.budget-table').append(table_row);
            }  
            // change current value on first popup
            $('.budget-table-current').text(sanitize_budget(current_budget_sum));
            // change goal value on first popup
            $('.budget-table-2-values-goal').text(sanitize_budget(Client.total_budget));
            // new variables for comparison
            var client_modified = Number(Client.total_budget.toFixed(2));
            var current_modified = Number(current_budget_sum.toFixed(2));
            // to only 2 places, truncate leading zeros 
            current_budget_sum = parseFloat(current_budget_sum.toFixed(2));
            // change adjustment value on first popup
            if (client_modified > current_modified) {
                $('.budget-table-adjustments').text('+' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
                $('.budget-table-adjustments').css({color: 'green'});
            } else if (client_modified < current_modified) {
                $('.budget-table-adjustments').text('-' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
                $('.budget-table-adjustments').css({color: 'red'});
            } else {
                $('.budget-table-adjustments').text('No adjustments needed.');
                $('.budget-table-adjustments').css({color: 'black'});
            }
        }

        /**
         * Given an input, sanitizes the input accordingly.
         * @param {string | number} input the input value
         * @returns {boolean} if input is sanitized prior to sanitization
         */
        // TODO: now
        function sanitize_input(input) {
            // convert input to number
            var formatted_input = unsanitize_budget(input);

            // if input is empty, then set initial resource budget 
            if (input.length === 0) {
                $('.budget-table-2-values-current').text(sanitize_budget(initial_resource_budget));
                $('.budget-table-2-header-adjustments').text('Adjustments');
            }

            // if input is not a proper value 
            if (formatted_input === 'NaN' || formatted_input == '0') {
                // if input is the number zero, do nothing
                if (input == '0') {
                    $('.budget-table-2-values-current').text(sanitize_budget(initial_resource_budget));
                // otherwise, ask user to enter proper input and disregard code below
                } else if (input.length !== 0) {
                    $('.popup-container-title-alt-2').text('Please input a valid number.');
                    return false;   
                }
            } 
            // convert to currency and display continously
            $('.budget-table-2-header-adjustments').text(sanitize_budget(formatted_input));
            // new value after modifier 
            var new_current = initial_resource_budget + unsanitize_budget($('.budget-table-2-header-adjustments').text());
            // set current value
            var selected_budget_option = $('.popup-container-select').find(':selected').text().trim();
            var selected_value = selected_budget_option.substring(
                selected_budget_option.indexOf('(') + 2, 
                selected_budget_option.length - 2
            ).replace(/,/g, '').replace('$', '');
            var multiplier = parseInt($('.popup-container-select-modifier').val(), 10);
            var adjustment = parseFloat($('.budget-table-2-values-adjustments').val());
            // current resource value before modification
            var current_resource_value;
            for (var i = 0; i < Client.budget_breakdown.length; i++) {
                if (Client.budget_breakdown[i].name === previous_resource_name) {
                    current_resource_value = parseFloat(Client.budget_breakdown[i].value.toFixed(2));
                    break;
                }
            }
            // values set for multipler and selected option 
            if (selected_value !== '-' && isNaN(multiplier) === false) {
                if (isNaN(adjustment)) {
                    adjustment = 0;
                }
                // change budget without further modification
                new_current = initial_resource_budget + adjustment + (multiplier * selected_value);
            }

            if (isNaN(new_current)) {
                // if multiplier and option are selected 
                if (isNaN(multiplier) === false && isNaN(selected_value) === false) {} else {
                    $('budget-table-2-values-current').text(initial_resource_budget);
                    return;
                }
            }
            $('.budget-table-2-values-current').text(sanitize_budget(new_current));
            
            // new current cannot exceed total budget 
            if (new_current > Client.total_budget) {
                $('.popup-container-title-alt-2').text('Resource budget cannot exceed total budget.');
                return false;
            }

            // new current cannot be negative 
            if (new_current < 0) {
                $('.popup-container-title-alt-2').text('Resource budget cannot be negative.');
                return false;
            } else {
                // set title of second popup
                $('.popup-container-title-alt-2').text(previous_resource_name);
            }
            return true;
        }

        // sum variable for total current budget
        var current_budget_sum = 0;

        for (var i = 0; i < Client.budget_breakdown.length; i++) {
            current_budget_sum += Client.budget_breakdown[i].value;
            var table_row = $(
                `<tr class='budget-table-row-" + ${i} + " budget-table-row'>
                    <td class='budget-table-row-name'>${Client.budget_breakdown[i].name}<td> 
                    <td class='budget-table-row-value'>${sanitize_budget(Client.budget_breakdown[i].value)}<td> 
                </tr>`
            );
            $('.budget-table').append(table_row);
        }  

        // TODO: now
        // change goal value on first popup
        $('.budget-table-2-values-goal').text(sanitize_budget(Client.total_budget));

        // new variables for comparison
        var client_modified = Number(Client.total_budget.toFixed(2));
        var current_modified = Number(current_budget_sum.toFixed(2));


        console.log('total budget', client_modified);
        console.log('current budget', current_modified);

        // to only 2 places, truncate leading zeros 
        current_budget_sum = parseFloat(current_budget_sum.toFixed(2));
        // change adjustment value on first popup
        if (client_modified > current_modified) {
            $('.budget-table-2-values-goal').text('+' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
            $('.budget-table-2-values-goal').css({color: 'green'});
        } else if (client_modified < current_modified) {
            $('.budget-table-2-values-goal').text('-' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
            $('.budget-table-2-values-goal').css({color: 'red'});
        } else {
            $('.budget-table-2-values-goal').text('No adjustments needed.');
            $('.budget-table-2-values-goal').css({color: 'black'});
        }
    }

    /**
     * Remove currency formatting.
     * @param {string} budget
     * @returns {number} the unsanitized budget value
     */
    function unsanitize_budget(budget) {
        return Number(budget.replace('$', '').replace(/,/g, ''));
    }

    /**
     * Adds a dollar sign and makes the budget readable.
     * @param {number} budget the budget value to be sanitized 
     * @returns {string} the sanitized budget value
     */
    function sanitize_budget(budget) {
        // Converts to US currency, with 2 decimal places 
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(budget.toString());
    }

    /**
     * Adds event handlers to select option boxes in budget popup
     */
    function makeSelectHandlers(){
        var eventClass = this.className;
        var resource_name = eventClass.split("-").pop();
        $("#resource-budget-"+resource_name).append("<br><input type = 'number' placeholder = 'Include +/-' id = 'resource-budget-box-"+resource_name+"'></input>");
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
    // TODO: remove
    // function updateBudgetBar() {
    //     // Obtain reference to canvas from DOM
    //     var ctx = document.getElementById("budget-container-bar").getContext("2d");
    //     // Adjust canvas size as the window size changes horizontally
    //     ctx.canvas.width = 0.8 * window.innerWidth;
    //     // Do not continue if community values have not been set yet
    //     if (Client.community_values.length === 0) { return; }
    //     // Draw the rectangles
    //     var beginX = 0;
    //     var shiftX = 0;
    //     for (var i = 0; i < Client.budget_breakdown.length; i++) {
    //         // length of budget, value of budget 
    //         var length = Math.round(Client.budget_breakdown[i].value).toString().length;
    //         var budget = Client.budget_breakdown[i].value;
    //         var relative_width = find_relative_width(Client.budget_breakdown[i]);
    //         var measured_text_width = ctx.measureText(Client.budget_breakdown[i].value);

    //         ctx.fillStyle = Client.chart_colors[i];
    //         ctx.fillRect(shiftX, 0, beginX + relative_width, ctx.canvas.height);
    //         ctx.fillStyle = 'black';
    //         ctx.font = "16px EB Garamond";
    //         ctx.fillText(Client.budget_breakdown[i].name, shiftX + (ctx.canvas.width / 35), ctx.canvas.height / 2);
    //         var modifier;
    //         // million
    //         if (length === 7) {
    //             modifier = 
    //                 budget.toString().substring(0, 1) + '.' + 
    //                 budget.toString().substring(2, 4) + ' M';
    //         // ten million
    //         } else if (length === 8) {
    //             modifier = 
    //                 budget.toString().substring(0,2) + '.' + 
    //                 budget.toString().substring(2,4) + ' M';
    //         } else {
    //             modifier = sanitize_budget(Client.budget_breakdown[i].value);
    //         }
    //         ctx.fillText(
    //             modifier, 
    //             shiftX + (ctx.canvas.width / 35), 
    //             (ctx.canvas.height / 2) + 20
    //         );
    //         beginX += relative_width;
    //         shiftX += relative_width;
    //     }

    //     /**
    //      * Helper function to find relative width of budget component on canvas
    //      * @param {{}} budget_value object with value's name and budget amount
    //      * @returns {number} the relative width of budget component 
    //      */
    //     function find_relative_width(budget_value) {
    //         return ctx.canvas.width * (budget_value.value / Client.total_budget);
    //     }
    // }

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
            initial_budget_breakdown.push({
                name: community_resources[i],
                value: Client.total_budget / community_resources.length
            })
        }
        Client.budget_breakdown = budget_breakdown;
       return budget_breakdown;
    }
   /**
    * Creates tabular view for the game board using global variables for current budget breakdown and initial
    */
    function createTabularView(){
        $('#tabular').empty();
        console.log(JSON.stringify(initial_budget_breakdown))
        var html = "<table class = 'table' id = 'tabularView'> <thead class = 'thead-dark'> <tr> <th scope = 'col'>Resource</th> <th scope = 'col'> Start</th><th scope = 'col'>Current</th><th scope = 'col'>Change</th>"
        html+= "</tr></thead> <tbody>"
        for(var i =0; i <initial_budget_breakdown.length; i++){
            html += "<tr id = " + initial_budget_breakdown[i]["name"] + "><th scope = 'row'>"+initial_budget_breakdown[i]["name"] + "</th>"; //Resource name
            html += "<td>" + initial_budget_breakdown[i]["value"] + "</td>"; // data value for start 
            html+= "<td>" + Client.budget_breakdown[i]["value"] + "</td>" //data for current
            var change = (Client.budget_breakdown[i]["value"]-initial_budget_breakdown[i]['value'])/initial_budget_breakdown[i]['value']
            change = Math.round(change * 100) / 100
            change= change*100
            html+= "<td>"+change+"% </td></tr>" //data for change
        }
        html+= "</tbody></table>";
        $("#tabular").html(html);
        $("#tabular").click(function(event){
            // send community resource name as argument 
            // TODO: now
            openBudgetPopupAlt($(event.target).text());
            $('#tabular').show();
        })
        $('#tabular').on('click', '#tabularView tr', function(e){
            var resourceName = $(this).attr("id");
            console.log(resourceName  + ' row clicked')
            //TODO-- open popup for the clicked resource
        })
    }


    var generateHappiness = function(happiness){
        if(happiness >= 81){
            //display super happy face
            console.log("super Happy");
            $('#face').attr("src", "./images/superHappy.png");
            createHappyPopup(happiness);
        } else if(happiness >= 61 && happiness < 81){
            //display happy face
            $('#face').attr("src", "./images/happy.png");
            createHappyPopup(happiness);
        } else if(happiness >= 41 && happiness < 61){
            //display neutral face
            $('#face').attr("src", "./images/neutral.png");
            createHappyPopup(happiness);
        } else if(happiness >= 21 && happiness < 41){
            //display sad face
            $('#face').attr("src", "./images/sad.png");
            createHappyPopup(happiness);
        } else{
            //display super sad face
            $('#face').attr("src", "./images/superSad.png");
            createHappyPopup(happiness);
        }
    }

    var createHappyPopup = function(happiness){
        $('.hText').empty();
        $('.hText').text("Your approval rating is " + happiness + "%. Make decisions supporting your values to make your citizens happy!");
        $('.hText').css({"display" : "block"});
    }
    
    function fillAssocations(values) {

        var associations = []

        for(i = 0; i < values.length; i++) {
            if(values[i] == "Preservation of Neighborhoods")
                associations[i] = "Housing";
            else if(values[i] == "Affordable Housing")
                associations[i] = "Housing"
            else if(values[i] == "Family-Friendly City")
                associations[i] = "Parks and Rec"
            else if(values[i] == "Safe and Secure Community")
                associations[i] = "Police"
            else if(values[i] == "Support Cultural Diversity")
                associations[i] = "Police"
            else if(values[i] == "City Infrascruture Growth")
                associations[i] = "Streets"
            else if(values[i] == "Support Local Businesses")
                associations[i] = "Capital"
            else if(values[i] == "Financially Conservative")
                associations[i] = "Capital"
            else if(values[i] == "Low Unemployment Rate")
                associations[i] = "Planning and Economic Development"
            else if(values[i] == "Public Education")
                associations[i] = "Planning and Economic Development"
            else
                associations[i] = "Solid Waste"
        }

        

    }

    /**
     * Sets up event handlers during startup.
     */
    function event_handlers() {
        //Starts scenarios TODO, not showing all scenarios, missing one of them
        var count = 1;
        $('#startButton').click(function(){
            
            if(!budgetChangesSubmitted && (count > 1)){
                $('.media-container-box').append('Please adjust the budget before continuing')
                
                return;
            }   
            $('#startButton').text("Next")
            
            var scenario = Client.scenarios[Math.floor(Math.random()*Client.scenarios.length)];
            
            
            if(Client.scenarios.length === 0){
                $(".media-container-box").html("<h1> Game Over </h1> <br> Want to play again? Click 'Play Again' below!")
                $("#startButton").remove();
                $('#playAgain').show();
                return;
            }
            $(".media-container-box").html("<h2 style='display:inline;'>Scenario " + count + "</h2> <br>" + "<h3>"+scenario +"</h3>" )
            count +=1;   
            var index = Client.scenarios.indexOf(scenario)
            Client.scenarios.splice(index, 1)
            budgetChangesSubmitted = false;
            createTabularView();
            
        })

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

        var current_timeout = undefined;
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
                    // length of selected should not be longer than 5
                    if ($('.selected-value').length === 5) {
                        return;
                    }
                    // Save selected community values
                    Client.selected_community_values.push($(event.currentTarget));
                    // length of selected community values array
                    var length = Client.selected_community_values.length;
                    $(Client.selected_community_values[length - 1]).addClass('selected-value');
                    // Add an outline to selected community value so user knows it has been selected 
                    $(Client.selected_community_values[length - 1]).css({ boxShadow: '0 0 0 1px blue' });
                    // Increment number of values currently selected 
                    increment_num_values_selected();
                    // Show continue button
                    if (get_num_values_selected() === 5) {
                        // Update message container
                        updateValuesContainerText('Great! Click the button below to continue.');
                        // Show play game button
                        $('.play-game-container').show();
                    }
                } else if (get_num_values_selected() >= 5) {
                    // Update the message container text value
                    updateValuesContainerText('You may not select more than 5 community values.');
                }
            });

            $('.values').on('mouseenter', function(event) {
                current_timeout = setTimeout(function() {
                    // no more than 5 selected
                    if ($('.selected-value').length === 5) {
                        return;
                    }
                    // check if already in selected community values 
                    if ($(event.currentTarget).hasClass('selected-value')) {
                        return;
                    }
                    Client.selected_community_values.push($(event.currentTarget));
                    openPopup_1($(event.target).text(), Client.community_values_description[get_description_index($(event.target).text())]);
                }, 700);
            });

            // do not open popup if user leaves the value 
            $('.values').on('mouseleave', function(event) {
                clearTimeout(current_timeout);
            });
        }

        // set click handler for continue button 
        $('.play-game-container-button').on('click', function(event) {
            // Set gameboard values on page 2
            set_gameboard_values($(".selected-value").toArray());
            // Initial update of the budget bar
            // TODO: remove
            // updateBudgetBar();
            // Makes associations array that are tied to the selected values
            fillAssocations(get_values())
            // Go to page 2 
            $('.page1').hide();
            $('.page2').show();
        });

        // TODO: remove
        // // Resize the budget bar as window width changes
        // $(window).on('resize', function() {
        //     // Updates the budget bar dynamically
        //     updateBudgetBar();
        // });

         //Shows community description when clicked.
        $('.community-info-title-container').on('click',function(){
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

        var current_resource_value;
        $('.popup-container-select-modifier').on('input', function(event) {
            // parsed multiplier value 
            var parsed_value = parseInt($(event.target).val(), 10);
            // obtain reference to selected budgeting option
            var selected_option = $('.popup-container-select').find(':selected').text().trim();
            // find how much to modify the value by
            var budget_modifier = parseFloat(selected_option.substring(
                selected_option.indexOf('(') + 2, 
                selected_option.length - 2).replace('$', '').replace(/,/g, ''
            ));
            // obtain value of adjustment
            var adjustment_value = parseFloat(parseFloat($('.budget-table-2-values-adjustments').val()).toFixed(2));
            if (isNaN(adjustment_value)) {
                adjustment_value = 0;
            }
            // current resource value before modification
            var current_resource_value;
            for (var i = 0; i < Client.budget_breakdown.length; i++) {
                if (Client.budget_breakdown[i].name === previous_resource_name) {
                    current_resource_value = parseFloat(Client.budget_breakdown[i].value.toFixed(2));
                    break;
                }
            }
            // add modifier value to adjustment value 
            var pre_sanitized = current_resource_value + adjustment_value + (parsed_value * budget_modifier);
            var sanitized = sanitize_budget(pre_sanitized);
            if (isNaN(pre_sanitized)) {
                $('.budget-table-2-values-current').text(sanitize_budget(current_resource_value + adjustment_value));
            } else {
                $('.budget-table-2-values-current').text(sanitized);
            }
        });

        $('.popup-container-select').on('change', function (event) {
            // set current value
            var selected_budget_option = $('.popup-container-select').find(':selected').text().trim();
            var selected_value = selected_budget_option.substring(
                selected_budget_option.indexOf('(') + 2,
                selected_budget_option.length - 2
            ).replace(/,/g, '').replace('$', '');
            var multiplier = parseInt($('.popup-container-select-modifier').val(), 10);
            var adjustment = parseFloat($('.budget-table-2-values-adjustments').val());
            // current resource value before modification
            var current_resource_value;
            for (var i = 0; i < Client.budget_breakdown.length; i++) {
                if (Client.budget_breakdown[i].name === previous_resource_name) {
                    current_resource_value = parseFloat(Client.budget_breakdown[i].value.toFixed(2));
                    break;
                }
            }
            var new_current = current_resource_value + adjustment;
            if (isNaN(new_current)) {
                $('budget-table-2-values-current').text(current_resource_value);
                return;
            }
            // values set for multipler and selected option 
            if (selected_value !== '-' && isNaN(multiplier) === false) {
                // change budget without further modification
                new_current = initial_resource_budget + adjustment + (multiplier * selected_value);
            }

            $('.budget-table-2-values-current').text(sanitize_budget(   new_current    ));
        })

        // TODO: add event handler for radio buttons
        $('.radio-buttons').on('click', function(event) {
            var radio = $(event.target);
            // check which radio button was selected 
            if (radio.hasClass('radio1')) {
                $('#game-container-board').show();
                $('#tabular').hide()
            } else if (radio.hasClass('radio2')) {  
                // hide the pie chart
                createTabularView();
                $('#game-container-board').hide();
                $('#tabular').show();
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
        generateHappiness(50)

        // Hide other pages besides startup page
        for (var i = 2; i <= get_num_pages(); i++) {
            var current_page = 'page' + i;
            $('.page' + i).hide();
        }

        // Used to look at first page first instead of having to select values each time.
        //var current_page = 'page2'
        //$('.page1').hide()
    }
    main();
});