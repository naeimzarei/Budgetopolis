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
            '#ff0000', '#e69f00', '#56b4e9', 
            '#009e73', '#f0e442', '#0072b2', 
            '#d55e00', '#9e9e9e', '#89882A'
        ],
        // user choices 
        user_choices: {},
        // if increase or decrease checkbox has been selected 
        checkboxes: {
            isDecreaseSelected: false,
            isIncreaseSelected: false
        }
    };

    //prep server connection
    const clientPromise = stitch.StitchClientFactory.create('budgetopolis-jyxch');
    var client;
    var db;
    var budgetChangesSubmitted = false;
    var initial_budget_breakdown = [];
    var gameStarted = false;


    /**
     * Connect to DB and retrieve Community info (name, description, values, values_descriptions, resources,
     * resources_description, scenarios, budget)
     * @param {dict} query //query to execute
     * @param {boolean} city //boolean: true if city, false if county
     * @param {() => void} callback1 the first callback function
     * @param {() => void} callback2 the second callback function
     */
    function connect(query, city, callback1, callback2) {
        clientPromise.then(stitchClient => {
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
    function getCommunityInfo(query, city, callback1, callback2) {
        var collection;
        if (city) {
            collection = db.collection('City')
        } else {
            collection = db.collection('County')
        }
        collection.find(query).execute().then(result => {
            Client.community_name = result[0]['name']
            Client.community_description = result[0]['description']
            //append community name and description to page 2
            $('.community-info-title-container-text').append(Client.community_name.bold())
            set_values(result[0]['values']);
            set_values_description(result[0]['values_descriptions']);
            set_resources(result[0]['resources'], result[0]['resources_description']);
            Client.scenarios = result[0]['scenarios']
            // sets the total budget
            var temp_total_budget = 0;
            for (var property in result[0]['budget']) {
                temp_total_budget += result[0]['budget'][property];
            }
            Client.total_budget = temp_total_budget;
            // Client.total_budget = parseInt(result[0]['budget'].replace(/,/g, ''));
            //set_budget_breakdown(result[0]['resources']);
            set_budget_breakdown(result[0]['budget']);
        }).then(function () {
            callback1();
            callback2();
            getResourceOptions(true);
        });
    }
    /**
     * Get the resources for this community along with the options for budget changes
     * @param {boolean} city //true if city, false if county
     */
    function getResourceOptions(city) {
        var query = {}
        var community_resource_options = []; //array of dictionaries
        if (city) {
            query = { "community": "city" }
        } else {
            query = { "community": "county" }
        }
        clientPromise.then(stitchClient => {
            client = stitchClient;
            db = client.service('mongodb', 'mongodb-atlas').db('budgetopolis');
            collection = db.collection('Resources')
            collection.find(query).execute().then(result => {
                Object.keys(result[0]).forEach(function (key) {
                    Client.resources.forEach(function (resource, index) {
                        if (Client.resources[index][key] !== undefined) {
                            community_resource_options.push({ [key]: result[0][key] })
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
                is_blur_special = true;
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
        is_blur_special = true;
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
    var is_event_set = false;
    // TODO: priority 
    var adjustments_complete = false;
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

        if (is_budget_popup_open) {
            return;
        }
        is_budget_popup_open = true;

        // blur the screen
        blur();
        // show the budget popup
        $('.page2-popup-budget-alt').show();
        // create each row of the popup 
        render_rows();
        // add event handler for each row of the popup
        add_rows();

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
            $('.budget-table-row-name').on('click', function (event) {
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

        // event handler for second budget popup adjustments
        $('.budget-table-2-values-adjustments').on('input', function (event) {
            // check if input is a number
            sanitize_input($(event.target).val());
        });

        /**
         * Event handler for second budget popup adjustments that 
         * prevents '-' or 'e' input 
         */
        $('.budget-table-2-values-adjustments').on('keydown', function(event) {
            if (event.which === 189 || event.which === 69) {
                return false;
            }
        });

        if (is_event_set === false) {
            // event handler for second budget popup button 
            $('.popup-container-alt-2-button').on('click', function (event) {
                is_budget_popup_open = false;
                is_event_set = true;
                // check if number is valid
                if (sanitize_input($('.budget-table-2-values-adjustments').val())) {
                    $('.budget-table-2-header-adjustments').text('Adjustments');

                    // obtain select option value
                    var manual_adjustment = parseFloat($('.budget-table-2-values-adjustments').val());
                    var budget_option = $('.popup-container-select').find(':selected').text().trim();
                    var budget_option_multiplier = parseInt($('.popup-container-select-modifier').val(), 10);
                    var budget_option_value = parseInt(budget_option.substring(budget_option.indexOf('(') + 1, budget_option.indexOf(')') - 1).replace(/,/g, '').replace('$', ''), 10);
                    var previous_budget_value;
                    var resource_name = $('.popup-container-title-alt-2').text();

                    for (var i = 0; i < Client.budget_breakdown.length; i++) {
                        if (Client.budget_breakdown[i].name === resource_name) {
                            previous_budget_value = Client.budget_breakdown[i].value;
                            break;
                        }
                    }

                    var should_analyze_checkboxes = false;
                    // case 1: nothing is adjusted 
                    if (isNaN(manual_adjustment) && isNaN(budget_option_multiplier)) {
                        // do nothing. keep for later on if needed. 
                    }
                    // case 2: manual adjustment 
                    if (isNaN(manual_adjustment) === false && isNaN(budget_option_multiplier) && budget_option === '-') {
                        Client.user_choices['option'] = 'none';
                        Client.user_choices['previous_budget_value'] = previous_budget_value - manual_adjustment;
                        Client.user_choices['new_budget_value'] = previous_budget_value;
                        Client.user_choices['difference'] = manual_adjustment;
                        Client.user_choices['resource'] = resource_name;
                        should_analyze_checkboxes = true;
                        adjustments_complete = true;
                    }
                    // case 3: option selection
                    if (isNaN(manual_adjustment) && isNaN(budget_option_multiplier) === false && budget_option !== '-') {
                        Client.user_choices['option'] = budget_option;
                        Client.user_choices['previous_budget_value'] = previous_budget_value - (budget_option_multiplier * budget_option_value);
                        Client.user_choices['new_budget_value'] = previous_budget_value;
                        Client.user_choices['difference'] = budget_option_multiplier * budget_option_value;
                        Client.user_choices['resource'] = resource_name;
                        should_analyze_checkboxes = true;
                        adjustments_complete = true;
                    };
                    // case 4: both manual adjustment and option selection 
                    if (isNaN(manual_adjustment) === false && isNaN(budget_option_multiplier) === false && budget_option !== '-') {
                        Client.user_choices['option'] = budget_option;
                        Client.user_choices['previous_budget_value'] = (previous_budget_value - manual_adjustment) - (budget_option_multiplier * budget_option_value);
                        Client.user_choices['new_budget_value'] = previous_budget_value;
                        Client.user_choices['difference'] = manual_adjustment + (budget_option_multiplier * budget_option_value);
                        Client.user_choices['resource'] = resource_name;
                        should_analyze_checkboxes = true;
                        adjustments_complete = true;
                    }

                     // Checks if the 'Increase' or 'Decrease' checkboxes
                     // have been selected. Only one checkbox must be selected.
                     // The user must select one checkbox.
                     if (should_analyze_checkboxes) {
                        // make sure user has selected 'Increase' or 'Decrease'
                        var checkbox1 = $('.plus-minus-1');
                        var checkbox2 = $('.plus-minus-2');
                        // none are selected, make sure they make a selection 
                        if ($(checkbox1).is(':checked') === false && $(checkbox2).is(':checked') === false) {
                            $('.popup-container-title-alt-2').text('Please select whether you want to increase or decrease.');
                            return;
                        }
                        // both are selected, return
                        if ($(checkbox1).is(':checked') && $(checkbox2).is(':checked')) {
                            $('.popup-container-title-alt-2').text('Please select only one checkbox.');
                            return;
                        }
                        // increase checkbox selected 
                        if ($(checkbox1).is(':checked')) {
                            // unblur the screen
                            unblur();
                            // hide the second popup 
                            $('.page2-popup-budget-alt-2').hide();
                            // set checkbox global object 
                            Client.checkboxes.isIncreaseSelected = true;
                            Client.checkboxes.isDecreaseSelected = false;
                        // decrease checkbox selected 
                        } else if ($(checkbox2).is(':checked')) {
                            // unblur the screen
                            unblur();
                            // hide the second popup 
                            $('.page2-popup-budget-alt-2').hide();
                            // set checkbox global object 
                            Client.checkboxes.isIncreaseSelected = false;
                            Client.checkboxes.isDecreaseSelected = true;
                        }
                        // adjust budget accordingly
                        perform_budget_logic();
                        createTabularView(true);
                        renderGoalDiv();
                        // TODO: priority - logical error 
                        // budgetChangesSubmitted = true;
                     } else {
                        // unblur the screen
                        unblur();
                        // hide the second popup 
                        $('.page2-popup-budget-alt-2').hide();
                     }

                    // clear adjustment input
                    $('.budget-table-2-values-adjustments').val('');
                    // clear modifier on second popup 
                    $('.popup-container-select-modifier').val('');

                    var current_budget_sum = 0;
                    for (var i = 0; i < Client.budget_breakdown.length; i++) {
                        current_budget_sum += Client.budget_breakdown[i].value;
                    }

                    // new variables for comparison
                    var client_modified = Number(Client.total_budget.toFixed(2));
                    var current_modified = Number(current_budget_sum.toFixed(2));

                    // fixes $0.01 bug
                    var current_string = current_modified.toString();
                    var current_other = client_modified.toString();
                    if (current_string.substring(current_string.length - 2, current_string.length) === '01') {
                        current_modified = Math.floor(current_modified);
                    }
                    if (current_other.substring(current_other.length - 2, current_other.length) === '01') {
                        client_modified = Math.floor(client_modified);
                    }

                    // TODO: priority 
                    // to only 2 places, truncate leading zeros 
                    current_budget_sum = parseFloat(current_budget_sum.toFixed(2));
                    // change adjustment value on first popup
                    if (client_modified > current_modified) {
                        $('.budget-table-2-values-goal').text('Increase by ' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
                        $('.budget-table-2-values-goal').css({ color: 'green' });
                    } else if (client_modified < current_modified) {
                        $('.budget-table-2-values-goal').text('Decrease by ' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
                        $('.budget-table-2-values-goal').css({ color: 'red' });
                        if ($('.budget-table-adjustments').text() === '-$0.00') {
                            if (adjustments_complete) {
                                budgetChangesSubmitted = true;
                                adjustments_complete = false;
                            }
                            $('.budget-table-adjustments').text('No adjustments needed.');
                            $('.budget-table-adjustments').css({ color: 'black' });
                        }
                    } else {
                        if (adjustments_complete) {
                            budgetChangesSubmitted = true;
                            adjustments_complete = false;
                        }
                        $('.budget-table-2-values-goal').text('No adjustments needed.');
                        $('.budget-table-2-values-goal').css({ color: 'black' });
                    }

                    // TODO: rob 
                    // I have consoled it for you so you can see the output and 
                    // get any information you need from there. 
                    // Client.user_choices['option'] --> if the user picked any option (ie 'Close fire station')
                    // previous_budget_value --> the value of the resource before budget was modified 
                    // new_budget_value --> the value of the resource after budget modifications have been made 
                    // difference --> the difference betweeen previous budget value and new budget value 
                    // console.log(Client.user_choices);
                    var selected_values = $(Client.selected_community_values);
                    for (var i = 0; i < selected_values.length; i++) {
                        var current_value = $(selected_values[i]).text();
                        // console.log('current-value', current_value);
                    }
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

                            var mod = 1;
                            // if increase checkbox is selected 
                            if (Client.checkboxes.isIncreaseSelected) {
                                mod = 1;
                            // if decrease checkbox is selected 
                            } else if (Client.checkboxes.isDecreaseSelected) {
                                mod = -1;
                            }

                            // no values set for multiplier or budget breakdown
                            if (selected_value === '-' || isNaN(multiplier)) {
                                // change budget without further modification
                                Client.budget_breakdown[i].value += resource_value * mod;
                            } else {
                                if (isNaN(adjustment)) {
                                    Client.budget_breakdown[i].value = initial + (multiplier * selected_value * mod);
                                } else {
                                    Client.budget_breakdown[i].value = initial + ((adjustment + (multiplier * selected_value)) * mod);
                                    var choice = $('.popup-container-select').find(':selected').text().trim();
                                }
                            }
                        }
                    }
                }
            });
        } 

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

            // fixes $0.01 bug
            var current_string = current_modified.toString();
            var current_other = client_modified.toString();
            if (current_string.substring(current_string.length - 2, current_string.length) === '01') {
                current_modified = Math.floor(current_modified);
            }
            if (current_other.substring(current_other.length - 2, current_other.length) === '01') {
                client_modified = Math.floor(client_modified);
            }

            // change adjustment value on first popup
            if (client_modified > current_modified) {
                $('.budget-table-adjustments').text('+' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
                $('.budget-table-adjustments').css({ color: 'green' });
            } else if (client_modified < current_modified) {
                $('.budget-table-adjustments').text('-' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
                $('.budget-table-adjustments').css({ color: 'red' });
                if ($('.budget-table-adjustments').text() === '-$0.00') {
                    $('.budget-table-adjustments').text('No adjustments needed.');
                    $('.budget-table-adjustments').css({ color: 'black' });
                }
            } else {
                $('.budget-table-adjustments').text('No adjustments needed.');
                $('.budget-table-adjustments').css({ color: 'black' });
            }
        }

        /**
         * Given an input, sanitizes the input accordingly.
         * @param {string | number} input the input value
         * @returns {boolean} if input is sanitized prior to sanitization
         */
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
                if (isNaN(multiplier) === false && isNaN(selected_value) === false) { } else {
                    $('budget-table-2-values-current').text(initial_resource_budget);
                    return;
                }
            }

            // $('.budget-table-2-values-current').text(sanitize_budget(new_current));

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

        // change goal value on first popup
        $('.budget-table-2-values-goal').text(sanitize_budget(Client.total_budget));

        // new variables for comparison
        var client_modified = Number(Client.total_budget.toFixed(2));
        var current_modified = Number(current_budget_sum.toFixed(2));

        // fixes $0.01 bug
        var current_string = current_modified.toString();
        var current_other = client_modified.toString();
        if (current_string.substring(current_string.length - 2, current_string.length) === '01') {
            current_modified = Math.floor(current_modified);
        }
        if (current_other.substring(current_other.length - 2, current_other.length) === '01') {
            client_modified = Math.floor(client_modified);
        }

        // to only 2 places, truncate leading zeros 
        current_budget_sum = parseFloat(current_budget_sum.toFixed(2));
        // change adjustment value on first popup
        if (client_modified > current_modified) {
            $('.budget-table-2-values-goal').text('Increase by ' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
            $('.budget-table-2-values-goal').css({ color: 'green' });
        } else if (client_modified < current_modified) {
            $('.budget-table-2-values-goal').text('Decrease by ' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
            $('.budget-table-2-values-goal').css({ color: 'red' });
            if ($('.budget-table-adjustments').text() === '-$0.00') {
                $('.budget-table-adjustments').text('No adjustments needed.');
                $('.budget-table-adjustments').css({ color: 'black' });
            }
        } else {
            $('.budget-table-2-values-goal').text('No adjustments needed.');
            $('.budget-table-2-values-goal').css({ color: 'black' });
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
        var ind = budget.toString().indexOf('.');
        var temp;
        if (ind === -1) {
            var temp = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            }).format(Math.ceil(budget).toString());
        } else {
            var decimal_digits = budget.toString().substring(ind + 1, ind + 3);
            var integer_digits = budget.toString().substring(0, budget.toString().indexOf('.'));
            var refined_budget = integer_digits + '.' + decimal_digits;
            if (refined_budget.substring(refined_budget.length - 2, refined_budget.length) === '01') {
                // remove $0.01
                refined_budget = integer_digits;   
            } else {
                refined_budget = integer_digits + '.' + decimal_digits;
            }
            var temp = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            }).format(refined_budget);
        }
        return temp;
    }

    /**
     * Adds event handlers to select option boxes in budget popup
     */
    function makeSelectHandlers() {
        var eventClass = this.className;
        var resource_name = eventClass.split("-").pop();
        $("#resource-budget-" + resource_name).append("<br><input type = 'number' placeholder = 'Include +/-' id = 'resource-budget-box-" + resource_name + "'></input>");
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

    var is_blur_special = false;

    /**
     * Blurs the second page.
     */
    function blur() {
        if (is_blur_special) {
            $('.page2').css({filter: 'blur(10px)'});
            return;
        }

        var children = $('.page2').children();
        for (var i = 0; i < children.length; i++) {
            if ($(children[i]).attr('class') !== 'game-container' && $(children[i]).attr('class') !== 'media-container') {
                $(children[i]).css({ filter: 'blur(10px)' });
            }
        }
        $('#goal').css({ filter: 'blur(10px)' });
        $('.radio-buttons-form').css({ filter: 'blur(10px)' });
        $('#startButton').css({ filter: 'blur(10px)'});
        $('.media-container-box').css({
            left: '1%',
            top: '1%',
            marginLeft: '0px'
        });
    }

    /**
     * Unblurs the second page.
     */
    function unblur() {
        if (is_blur_special) {
            $('.page2').css({filter: 'blur(0px)'});
            is_blur_special = false;
            return;
        }

        var children = $('.page2').children();
        for (var i = 0; i < children.length; i++) {
            if ($(children[i]).attr('class') !== 'game-container' && $(children[i]).attr('class') !== 'media-container') {
                $(children[i]).css({ filter: 'blur(0px)' });
            }
        }
        $('#goal').css({ filter: 'blur(0px)' });
        $('.radio-buttons-form').css({ filter: 'blur(0px)' });
        $('#startButton').css({ filter: 'blur(0px)'});
        $('.media-container-box').css({
            left: '55%',
            top: '275px',
            marginLeft: '-175px'
        });
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
    function sendDecisions(decisionsArray, session_id) {
        clientPromise.then(stitchClient => {
            client = stitchClient;
            db = client.service('mongodb', 'mongodb-atlas').db('budgetopolis');
            collection = db.collection('Facilitators')
            var dict = [{ _id: new RegExp('*' + session_id) }, { decisions: decisionsArray }];
            collection.update(dict).execute().then(result => {
                console.log(result)
            });
        });
    }

    /**
     * Create a Google Pie Chart
     */
    function createGooglePieChart() {
        var community_resources = Client.budget_breakdown;
        google.charts.load('current', { 'packages': ['corechart'] });
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            var data_values = [];
            data_values.push(['Category', 'Description']);

            for (var i = 0; i < community_resources.length; i++) {
                data_values.push([community_resources[i].name, community_resources[i].value]);
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
                fontSize: 20,
                pieSliceText: "percentage",
                pieSliceTextStyle: {
                    fontSize: 20,
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
                is3D: false,
                colors: Client.chart_colors,
            };

            var chart = new google.visualization.PieChart(document.getElementById('game-container-board'));

            //below is creating a description array for each community resource, and attaching event handlers 
            //to each section of the pie chart in order to show their description if clicked

            function selectHandler() {
                var selectedItem = chart.getSelection()[0];
                if (selectedItem) {
                    var resourceClick = data.getValue(selectedItem.row, 0);
                    Client.resources.forEach(function (resource) {
                        for (var j in resource)
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
        for (var property in community_resources) {
            budget_breakdown.push({
                name: property,
                value: community_resources[property]
            });
            initial_budget_breakdown.push({
                name: property,
                value: community_resources[property]
            });
        }
        Client.budget_breakdown = budget_breakdown;
        return budget_breakdown;
    }
    var changesCheck;
    var event_handler_exists = false;
    var is_budget_popup_open = false;
    /**
     * Creates tabular view for the game board using global variables for current budget breakdown and initial
     * @param show (boolean) indicates whether the tabular div should be hidden or shown 
     */
    function createTabularView(show) {
        var name;
        if(show === undefined){
            show = false;
        }
        $('#tabular').empty();
       
        var html = "<div class = 'container-fluid'><table class = 'table' id = 'tabularView'> <thead class = 'thead-dark'> <tr> <th scope = 'col' style = 'width: 30%'>Resource</th> <th scope = 'col' style = 'width: 27%'> Start</th><th scope = 'col' style = 'width: 27%'>Current</th><th scope = 'col' style = 'width: 15%'>Change</th>";
        html += "</tr></thead> <tbody>";
        changesCheck = [];
        for (var i = 0; i < initial_budget_breakdown.length; i++){
            name = initial_budget_breakdown[i]["name"]
            html += "<tr id = " + initial_budget_breakdown[i]["name"] + " class = 'd-flex'><th scope = 'row'>"+initial_budget_breakdown[i]["name"] + "</th>"; //Resource name
            // html += "<td id = '"+name+"'>$" + initial_budget_breakdown[i]["value"].toFixed(2) + "</td>"; // data value for start
            // html += "<td id = '"+name+"'>$" + Client.budget_breakdown[i]["value"].toFixed(2) + "</td>"; //data for current

            html += "<td id = '"+name+"'>" + sanitize_budget(initial_budget_breakdown[i]["value"]) + "</td>"; // data value for start
            html += "<td id = '"+name+"'>" + sanitize_budget(Client.budget_breakdown[i]["value"]) + "</td>"; //data for current

            var change = (Client.budget_breakdown[i]["value"] - initial_budget_breakdown[i]['value']) / initial_budget_breakdown[i]['value'] * 100;
            change = Math.round(change);
            changeAbs = Math.abs(change);
            changesCheck.push(change);
            if(changeAbs <= 35){
                html += "<td class = 'lowChange' id = '"+name+"'>" + change + "% </td></tr>"; //data for change

            } else if (changeAbs > 35 && changeAbs < 60){
                html += "<td class = 'medChange' id = '"+name+"'>" + change + "% </td></tr>"; //data for change

            }else if(changeAbs >= 60){
                html += "<td class = 'highChange' id ='"+name+"'>" + change + "% </td></tr>";//data for change
            }
        }

        html+= "</tbody></table></div>";
        $("#tabular").html(html);
        if(show){
            $('#tabular').show();
        }else{
            $('#tabular').hide();
        }
        
        renderGoalDiv();
        if (event_handler_exists === false) {
            $('#tabular').on('click', '#tabularView tr', function (e) {
                var resourceName = $(this).attr("id");
                console.log(resourceName + ' row clicked')
                if (!gameStarted) {
                    if ($('.temp-startup-message').length) {
                        return;
                    } else {
                        var message = $(`<p class='temp-startup-message' style='text-align: center; color: red;'> Press the start button to begin! </p>`);
                        $('.media-container-box').append($('<br/><br/>'));
                        $('.media-container-box').append(message);
                        return;   
                    }
                }
                openBudgetPopupAlt($(event.target).text());
                $('#tabular').show();
            });
            event_handler_exists = true;
        }
    }

    function renderGoalDiv(){
        var currentBudget = 0;
        for (var i = 0; i < Client.budget_breakdown.length; i++) {
            currentBudget += Client.budget_breakdown[i].value;
        }
        var client_modified = Number(Client.total_budget.toFixed(2));
        var current_modified = Number(currentBudget.toFixed(2));

        // fixes $0.01 bug
        var current_string = current_modified.toString();
        var current_other = client_modified.toString();
        if (current_string.substring(current_string.length - 2, current_string.length) === '01') {
            current_modified = Math.floor(current_modified);
        }
        if (current_other.substring(current_other.length - 2, current_other.length) === '01') {
            client_modified = Math.floor(client_modified);
        }

        // to only 2 places, truncate leading zeros 
        current_budget_sum = parseFloat(currentBudget.toFixed(2));
        // change adjustment value on first popup
        if (client_modified > current_modified) {
            $('#goal').html('<b>Increase by ' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
            $('#goal').css({color: 'green'});
        } else if (client_modified < current_modified) {
            $('#goal').html('<b>Decrease by ' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
            $('#goal').css({color: 'red'});
            if ($('#goal').text() === '-$0.00') {
                $('#goal').text('No adjustments needed.');
                $('#goal').css({ color: 'black' });
            }
        } else {
            if(gameStarted){

            $('#goal').text('No adjustments needed.');
            $('#goal').css({color: 'black'});
            }
        }
    }



    var generateHappiness = function (happiness) {
        if (happiness >= 81) {
            //display super happy face
            console.log("super Happy");
            $('#face').attr("src", "./images/superHappy.png");
            createHappyPopup(happiness);
        } else if (happiness >= 61 && happiness < 81) {
            //display happy face
            $('#face').attr("src", "./images/happy.png");
            createHappyPopup(happiness);
        } else if (happiness >= 41 && happiness < 61) {
            //display neutral face
            $('#face').attr("src", "./images/neutral.png");
            createHappyPopup(happiness);
        } else if (happiness >= 21 && happiness < 41) {
            //display sad face
            $('#face').attr("src", "./images/sad.png");
            createHappyPopup(happiness);
        } else {
            //display super sad face
            $('#face').attr("src", "./images/superSad.png");
            createHappyPopup(happiness);
        }
    }

    var createHappyPopup = function (happiness) {
        $('.hText').empty();
        $('.hText').text("Your approval rating is " + happiness + "%. Make decisions supporting your values to make your citizens happy!");
        $('.hText').css({ "display": "block" });
    }

    function fillAssocations(values) {

        var associations = []

        for (i = 0; i < values.length; i++) {
            if (values[i] == "Preservation of Neighborhoods")
                associations[i] = "Housing";
            else if (values[i] == "Affordable Housing")
                associations[i] = "Housing"
            else if (values[i] == "Family-Friendly City")
                associations[i] = "Parks and Rec"
            else if (values[i] == "Safe and Secure Community")
                associations[i] = "Police"
            else if (values[i] == "Support Cultural Diversity")
                associations[i] = "Police"
            else if (values[i] == "City Infrascruture Growth")
                associations[i] = "Streets"
            else if (values[i] == "Support Local Businesses")
                associations[i] = "Capital"
            else if (values[i] == "Financially Conservative")
                associations[i] = "Capital"
            else if (values[i] == "Low Unemployment Rate")
                associations[i] = "Planning and Economic Development"
            else if (values[i] == "Public Education")
                associations[i] = "Planning and Economic Development"
            else
                associations[i] = "Solid Waste"
        }



    }

    /**
     * Sets up event handlers during startup.
     */
    function event_handlers() {
        var count = 1;
        $('#startButton').click(function () {
            if ($('#startButton').text() === ' Start ') {
                console.log('div hidden')
                $('#tabular').hide()
                gameStarted = true;
            }

            if (!budgetChangesSubmitted && (count > 1)) {
                if (!$('.media-container-box').text().includes('Please')) {
                    var message = $(`<p style='color: red; text-align: center;'> Please adjust the budget before continuing </p>`);
                    $('.media-container-box').append(message);
                }
                return;
            }
            if(changesCheck != undefined){
                const allEqual = arr => arr.every( v => v === arr[0] )
                var allSame = allEqual(changesCheck);
            }
            

            if(allSame && count >1 ){
                if (!$('.media-container-box').text().includes('Please')) {
                    var message = $(`<p style='color: red; text-align: center;'> Please adjust the budget before continuing </p>`);
                    $('.media-container-box').append(message);
                }
                return;
            }

            // TODO: rob
            if($('#startButton').text().includes('Next')){
                generateHappiness(64);
                var tweet1 = $(`<p style='color: black; text-align: left; padding: 3px; border: thin solid black; background-color: #99ceff; border-radius: 3px;'> <strong>Sally L:</strong> Our local government is finally making good choices! </p>`); 
                var tweet2 = $(`<p style='color: black; text-align: left; padding: 3px; border: thin solid black; background-color: #99ceff; border-radius: 3px;'> <strong>Brandon W:</strong> exciting changes are happening in our local government! </p>`); 
                var tweet3 = $(`<p style='color: black; text-align: left; padding: 3px; border: thin solid black; background-color: #99ceff; border-radius: 3px;'> <strong>Paul S:</strong> but her emails! </p>`); 

                $('.social-media-box').empty();
                $('.social-media-box').append(`<p style='font-weight: bold;'>Twitter Feed</p>`);
                $('.social-media-box').append(tweet1, tweet2, tweet3);
            }
            
            $('#startButton').text("Next")

            var scenario = Client.scenarios[Math.floor(Math.random() * Client.scenarios.length)];

            if (Client.scenarios.length === 0) {
                $(".media-container-box").html("<h1> Game Over </h1> <br> Want to play again? Click 'Play Again' below!")
                $("#startButton").remove();
                $('#playAgain').show();
                return;
            }
            $(".media-container-box").html("<h2 style='display:inline;'>Scenario " + count + "</h2> <br>" + "<h3>" + scenario + "</h3>")
            count += 1;
            var index = Client.scenarios.indexOf(scenario)
            Client.scenarios.splice(index, 1)
            budgetChangesSubmitted = false;
            if($('#game-container-board').is(':visible')){
                createTabularView(false);
            }else{
                createTabularView(true)
            }
            

            // make sure they have made proper adjustments before closing
            var unsanitized_budget = unsanitize_budget($('.budget-table-adjustments').text());
            if (isNaN(unsanitized_budget) === false) {
                $('.popup-container-title-alt').text('Please make some adjustments first.');
                return;
            } else {
                $('.popup-container-title-alt').text('Resources Budgeting');
            }
            // close the budget popup
            $('.page2-popup-budget-alt').hide();
            // unblur the screen
            unblur();

            // check if number is valid 
            if (sanitize_input($('.budget-table-2-values-adjustments').val())) {
                // hide second popup. do not show first popup!
                $('.page2-popup-budget-alt-2').hide();
                // change adjustment title 
                $('.budget-table-2-header-adjustmnets').text('Adjustments');
                // adjust budget accordingly 
                perform_budget_logic();
                // clear adjustment input 
                $('.budget-table-2-values-adjustments').val('');
                // clear modifier on second popup 
                $('.popup-container-select-modifier').val('');
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
                        // no values set for multiplier or budget breakdown
                        if (selected_value === '-' || isNaN(multiplier)) {
                            // change budget without further modification
                            Client.budget_breakdown[i].value += resource_value;
                        } else {
                            if (isNaN(adjustment)) {
                                Client.budget_breakdown[i].value = initial + (multiplier * selected_value);
                            } else {
                                Client.budget_breakdown[i].value = initial + adjustment + (multiplier * selected_value);
                                var choice = $('.popup-container-select').find(':selected').text().trim();
                            }
                        }
                    }
                }
            }
            // unblur the screen
            unblur();
            // check if number is valid 
            if (sanitize_input($('.budget-table-2-values-adjustments').val())) {
                // hide second popup. do not show first popup!
                $('.page2-popup-budget-alt-2').hide();
                // change adjustment title 
                $('.budget-table-2-header-adjustmnets').text('Adjustments');
                // adjust budget accordingly 
                perform_budget_logic();
                // clear adjustment input 
                $('.budget-table-2-values-adjustments').val('');
                // clear modifier on second popup 
                $('.popup-container-select-modifier').val('');
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
                        // no values set for multiplier or budget breakdown
                        if (selected_value === '-' || isNaN(multiplier)) {
                            // change budget without further modification
                            Client.budget_breakdown[i].value += resource_value;
                        } else {
                            if (isNaN(adjustment)) {
                                Client.budget_breakdown[i].value = initial + (multiplier * selected_value);
                            } else {
                                Client.budget_breakdown[i].value = initial + adjustment + (multiplier * selected_value);
                                var choice = $('.popup-container-select').find(':selected').text().trim();
                            }
                        }
                    }
                }
            }

            /**
              * Given an input, sanitizes the input accordingly.
              * @param {string | number} input the input value
              * @returns {boolean} if input is sanitized prior to sanitization
              */
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
                    if (isNaN(multiplier) === false && isNaN(selected_value) === false) { } else {
                        $('budget-table-2-values-current').text(initial_resource_budget);
                        return;
                    }
                }

                // $('.budget-table-2-values-current').text(sanitize_budget(new_current));

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

                // fixes $0.01 bug
                var current_string = current_modified.toString();
                var current_other = client_modified.toString();
                if (current_string.substring(current_string.length - 2, current_string.length) === '01') {
                    current_modified = Math.floor(current_modified);
                }
                if (current_other.substring(current_other.length - 2, current_other.length) === '01') {
                    client_modified = Math.floor(client_modified);
                }

                // change adjustment value on first popup
                if (client_modified > current_modified) {
                    $('.budget-table-adjustments').text('+' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
                    $('.budget-table-adjustments').css({ color: 'green' });
                } else if (client_modified < current_modified) {
                    $('.budget-table-adjustments').text('-' + sanitize_budget(Math.abs(Client.total_budget - current_budget_sum)));
                    $('.budget-table-adjustments').css({ color: 'red' });
                    if ($('.budget-table-adjustments').text() === '-$0.00') {
                        $('.budget-table-adjustments').text('No adjustments needed.');
                        $('.budget-table-adjustments').css({ color: 'black' });
                    }
                } else {
                    $('.budget-table-adjustments').text('No adjustments needed.');
                    $('.budget-table-adjustments').css({ color: 'black' });
                }
            }


            /**
             * Adds event handler for the popup 
             * rows on the table. 
             */
            function add_row_handler() {
                // event handler for budget popup rows
                $('.budget-table-row-name').on('click', function (event) {
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
        });

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

            $('.values').on('mouseenter', function (event) {
                current_timeout = setTimeout(function () {
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
            $('.values').on('mouseleave', function (event) {
                clearTimeout(current_timeout);
            });
        }

        // set click handler for continue button 
        $('.play-game-container-button').on('click', function (event) {
            // Set gameboard values on page 2
            set_gameboard_values($(".selected-value").toArray());
            // Makes associations array that are tied to the selected values
            fillAssocations(get_values())
            // Go to page 2 
            $('.page1').hide();
            $('.page2').show();
        });

        //Shows community description when clicked.
        $('.community-info-title-container').on('click', function () {
            console.log('name div clicked')
            openPopup(Client.community_name, Client.community_description);
        });

        // Shows value description after it has been clicked
        $(".values-container-cards-2").on('click', ".values-2", showValueDescription);

        // Close the popup dialogue after the button has been clicked
        $('.popup-button').on('click', function () {
            closePopup();
        });
        //Send decisions to decisions text-area TODO, not registering
        $('.popup-button-submit').on('click', function () {
            console.log('submit clicked')
            //get resource name from class name
            var resource = this.className.split('-').pop();

            var decision = $('.inputBudgetChange').val();
            Client.budget_decisions.push({ resource: decision })

            // console.log(JSON.stringify(Client.budget_decisions))
            //sendDecisions(Client.budget_decisions, Client.session_id)

            closePopup();
        })

        // Shows community value descriptions when clicked on the first page
        $('.popup-1 button').on('click', function (event) {
            var val = $(event.target).text();
            var length = Client.selected_community_values.length;
            if (val.toLowerCase() === 'select') {
                // Give selected community value a selected-value CSS class
                $(Client.selected_community_values[length - 1]).addClass('selected-value');
                // Add an outline to selected community value so user knows it has been selected 
                $(Client.selected_community_values[length - 1]).css({ boxShadow: '0 0 0 1px blue' });
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
        $('.popup-container-select-modifier').on('input', function (event) {
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

        // prevents user from inputting '-' or 'e' values in modifier input box 
        $('.popup-container-select-modifier').on('keydown', function(event) {
            if (event.which === 189 || event.which === 69) {
                return false;
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

            // $('.budget-table-2-values-current').text(sanitize_budget(new_current));
        })

        // Event handler for radio buttons 
        $('.radio-buttons').on('click', function (event) {
            var radio = $(event.target);
            // check which radio button was selected 
            if (radio.hasClass('radio1')) {
                $('#game-container-board').show(0, function () {

                    $('#goal').hide();
                        
                });
                $('#tabular').hide()
            } else if (radio.hasClass('radio2')) {
                // hide the pie chart
                
                $('#game-container-board').hide(1, function () {
                    $('#goal').show();
                });
                createTabularView(true);
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