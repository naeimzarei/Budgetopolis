$(document).ready(function () {
    Facilitator = {
        session_id: ''
    };
    //prep server connection
    const clientPromise = stitch.StitchClientFactory.create('budgetopolis-jyxch');
    var client;
    var db;
    let stitchClient;
    /**
     * Connects to DB and can retrieve a facilitator's existing id, or create a new one (if name doesnt exist in db)
     * @param {String} name //name to find or insert
     */
    function connect(name){
        clientPromise.then(stitchClient =>{
            client = stitchClient;
            db = client.service('mongodb', 'mongodb-atlas').db('budgetopolis');
            return client.login().then(getFacilitatorID(name))
        });
    }
    function getFacilitatorID(name){
        db.collection('Facilitators').find({ "name": name }).execute().then(result => {
            if(result.length == 0){
                addFacilitator(name, result, callback);
                function callback(result1) {
                    db.collection("Facilitators").find({ "name": name }).execute().then(result1 => {
                        var fullId1 = result1[0]['_id']
                        Facilitator.session_id = fullId1.toString().slice(-4)
                        updateMessageBar("Your session id is: " + Facilitator.session_id)
                    });
                }
            }else{
                var fullId = result[0]['_id']
                Facilitator.session_id = fullId.toString().slice(-4) //says undefined
                updateMessageBar("Your session id is: " + Facilitator.session_id)
            }
        });
    }
    /**
     * Create new facilitator in DB if the name doesn't already exist. Then return their id
     * @param {String} name
     */

    function addFacilitator(name, result, callback) {
        console.log('made it')
        clientPromise.then(stitchClient => {
            db = stitchClient.service('mongodb', 'mongodb-atlas').db('budgetopolis')
            var objToInsert = [{ "name": name }];
            db.collection('Facilitators').insertMany(objToInsert, function (err) {
                Facilitator.session_id = objToInsert._id.toString().slice(-4)
            }).then(function() {
                callback(result);
            });
        })
    }
    

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

    /**
     * Randomly generates a 4-digit session ID.
     * @returns {string} the randomly produced session ID
     */

    function random_session_id() {
        // ASCII characters range: 48 - 57, 65 - 90, 97 - 122
        var random_session_id = '';
        // append random ASCII character four times 
        for (var i = 0; i < 4; i++) {
            // which range of ASCII characters 
            var range = getRandomNumber(1, 3);
            if (range === 1) {
                random_session_id += String.fromCharCode(getRandomNumber(48, 57));
            } else if (range === 2) {
                random_session_id += String.fromCharCode(getRandomNumber(65, 90));
            } else if (range === 3) {
                random_session_id += String.fromCharCode(getRandomNumber(97, 122));
            }
        }
        // Set facilitator session ID   
        set_session_id(random_session_id);
        // Return facilitator's session ID 
        return random_session_id;
    }

    /**
     * Obtain a random number, given minimum and
     * maximum values (inclusive).
     */
    function getRandomNumber(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Event handlers function. Add all event handlers that 
     * need to be run during startup here.
     */
    function event_handlers() {
        // Click event for button that generates session ID 
        $('.generate-session-button').on('click', function (event) {
            // Prevent further generation of session IDs
            //if (get_session_id().length === 4) { return; }
            // Generate the session ID and view it to the user
            
            //$('.session-code-container-id').val(random_session_id());
            
            // Prevent the user from making changes to the code displayed 
            $('.session-code-container-id').attr('disabled', 'disabled');
            // Obtain information from the database 
            //updateMessageBar('Obtaining data from the database. Please wait...');
            connect($("#nameInput").val())
            
            //use nameInput value to query name from DB and return their 4 digit id
            updateMessageBar("Your session id is: ")
        });

        // Input event for sesion ID 
        // $('.session-code-container-id').on('input', function(event) {
        //     // Current length of the session ID
        //     var input_length = $(event.target).val().length;
        //     // Update the session ID on the go
        //     set_session_id($(event.target).val());
        //     if (input_length === 4) {
        //         // Prevent further changes to session ID 
        //         $('.session-code-container-id').attr('disabled', 'disabled');
        //         // Update message bar
        //         updateMessageBar('Updating database. Please wait...');
        //         // TODO: update the database, return initial stats
        //     }
        // });
    }

    /**
     * Updates the message bar text.
     * @param {string} updated_message the message to be displayed 
     */
    function updateMessageBar(updated_message) {
        if (updated_message === '') {
            $('.startup-message-container-text')
            .text('Please generate a session code or enter a previously generated 4-digit session code.');
        } else {
            $('.startup-message-container-text').text(updated_message);
        }
    }

    /**
     * The main function 
     */
    function main() {
        event_handlers();
    }
    main();
});
