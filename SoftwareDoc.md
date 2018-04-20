# Software Design Document

## Architecture

[Budgetopolis Diagram](https://imgur.com/a/rU43O)

* Budgetopolis consists primarily of a JavaScript (jQuery) front-end with a MongoDB Atlas database on the back-end. 
* jQuery component: consists of game logic and the global Client object that holds most variables for the game to function properly. It also takes care of budget allocation, randomization, and it connects the game logic with that of the database. It obtains values from the database and sets the community resources and their respective values. In addition, it sets the description of those resources as well. 
* MangoDB Atlas: provides the total budget, the budget breakdown per resource, and the description of values. It provides the data necessary to ensure the game runs properly. It allows the game to be dynamically rendered. The individual budget resource values and the total budget values can be set. In addition, the name of the values and their respective descriptions can be dynamically modified without having to recode the whole Budgetopolis application. With that said, continuity was kept in mind by implementing this approach. By letting the data be set by the database, one does not have to change much code to accomodate new gameplay. 
* There are 5 major components: budget resources, community values, scenarios, social media, and approval rating. 
* Budget resources (community resources): the budget resources are what is displayed on the pie chart and the budget table, which can be viewed by clicking on either radio button on the upper left side of the screen. The budget resources correspond to the community resources and their respective values, which are updated throughout the course of the game as the users input their choices. 
* Community values: the community values are the values that a particular group chooses to emphasize. By selecting five specific values, the group focuses on making important budgeting decisions in favor of those values. In terms of code, this translates to users inputting their budgeting choices via input boxes to change budget resources. As a result of these choices, the values of community values reflect on the screen as a function of the user choices. 
* Scenarios: the scenarios are the randomly chosen events that occur that influence the user's budget decisions. Randomization is used to output a particular scenario. 
* Social media: the social media component is the dynamically produced response to user actions. This translates to how the users make budget choices and how the social media reflects on these choices. In terms of code, the social media component requires analysis of budget values and a dynamic rendering of social media responses. 
* Approval rating: the approval rating is a dynamically rendered component as well, just like the social media. It relies on how well the users maintain their community values. It depends on user budget choices. This dynamic component keeps track of user input and calculates the approval rating in terms of the overall budget. 

## Decomposition

### Modules

* There are two main webpages in Budgetopolis, the __ClientHTML__ and __FacilitatorHTML__.

##### Client Files

* __ClientHTML:__ This is the webpage that players of the game will see. It begins with a title screen where players can enter a 4 digit code to synchronize with a facilitator's game. This HTML file consists of two pages: A community values page, and the game page. 

* __ClientCSS:__ Adds styling to the ClientHTML page.

* __ClientJS:__ This file holds the game logic and adds the functionality to the ClientHTML page. It also connects the game logic with data from the database, which is obtained by using MangoDB Atlas. 


##### Facilitator Files
* __FacilitatorHTML:__ This page is what the facilitator sees when starting a game. This page allows the facilitator to generate a game code for players to enter to join the facilitator's session.

* __FacilitatorCSS:__ Adds styling to the FacilitatorHTML page.

* __FacilitatorJS:__ Includes logic for generating game codes and adds functionality to the FacilitatorHTML page.


### Processes
* Although JavaScript is a single-threaded programming language, a note should be made regarding the use of event handlers. 
* In JavaScript, event handlers need and should be registered only once or errors will occur. If multiple handlers are registered on DOM elements, then redundant code will run and cause issues with game logic. 
* In order to prevent multiple click or input handlers from being registered, a main function has been used along with a single event handler function. This function is only run once in the main function to prevent multiple event handlers from being fired off. 

### Data
##### MongoDB Atlas Back-end
* The database is powered by MongoDB atlas and contains the following schemas: 
* facilitator: a dictionary with the id and name of the facilitator 
* city: a dictionary with all properties of the city being represented. The name ofthe city, along with its description, possible community values, resoures, and the budget are all defined here. 
* decisions: a dictionary with the budget choices the users have made during each round of scenario. 

```
	facilitator = {
		"_id" references facilitator\_id
		"name"
	}

	decisions = {
		"facilitator_id"
		"budget +/-"
		"decision_made"
	}

	city = {
		"name"
		"description"
		"values"
		"values_description"
		"resources"
		"resources_description"
		"scenarios"
		"budget"
	}
```

## Detailed Module Definitions

* JSDoc has been used to give more detailed descriptions for individual functions in __ClientJS__ and __FacilitatorJS__

* [Link to ClientJS](https://github.com/naeimzarei/Budgetopolis/blob/master/ClientJS.js)

* [Link to FacilitatorJS](https://github.com/naeimzarei/Budgetopolis/blob/master/FacilitatorJS.js)

### Important Global Variables 
* All important global variables have been defined in the Client object. 
```
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
        user_choices: {}
    };
```

### Important Functions 
* ```createGooglePieChart()```: renders the Google pie chart along with the division of community resource values. 
* ```sanitize_input() ```: ensures that user inputs numerical values only. Values can have only two decimal places. If the user puts more than two decimals, then this function cuts off the other decimal places and keeps two. In addition, this function makes sure that the users do not put values such as '4..34' instead. It also makes sure that the input value does not exceed the total budget. Lastly, it prevents the user from inputting a value that would cause the budget value to be negative and takes care of budgeting edge cases. 
* ```sanitize_budget()```: converts the budget adjustment the user inputs to USD dollar format.
* ```unsanitize_budget()```: opposite of ```sanitize_budget()```
* ```openBudgetPopupAlt()```: opens a budgeting dialogue asking the user to input a vaue or select from predefined options. 
* ```update_budget_breakdown()```: updates a specific community resource and updates Client.budget_breakdown, which contains the name and value of each community resource. 
* ```event_handlers()```: a function that sets most event handlers during the beginnig of the game in the ```main()``` function.
* ```main()```: the starting point of the game, initialization of games and event handlers occurs here. 
* ```getCommunityInfo()```: obtains values from the database and sets those values in the global Client object. 
* ```connect()```: connects to the MangoDB Atlas platform. 

## Design Descisions 

### Dependencies 
* jQuery: used for simplifying JavaScript coding.
* Google Visualization: API used for rendering the Google Pie chart, which displays what percentage of the total budget each resource has used. 
* Google Fonts: used for the varous fonts used in the Budgetopolis application. 
* Bootstrap: used for making the tables and fonts look more modern and to improve placement of elements on the page.
* MangoDB Stitch: import needed to obtain database values from the JavaScript side of the web app. 