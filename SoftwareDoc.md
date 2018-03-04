# Software Design Document

## Architecture

![Budgetopolis Diagram](https://imgur.com/a/rU43O "Budgetopolis")

* Budgetopolis consists primarily of a JavaScript (jQuery) front-end with a MongoDB Atlas database on the back-end. 

## Decomposition

### Modules

* There are two main webpages in Budgetopolis, the __ClientHTML__ and __FacilitatorHTML__.

##### Client Files

* __ClientHTML:__ This is the webpage that players of the game will see. It begins with a title screen where players can enter a 4 digit code to synchronize with a facilitator's game. This HTML file consists of two pages: A community values page, and the game page.

* __ClientCSS:__ Adds styling to the ClientHTML page

* __ClientJS:__ This file holds the game logic and adds the functionality to the ClientHTML page.


##### Facilitator Files
* __FacilitatorHTML:__ This page is what the facilitator sees when starting a game. This page allows the facilitator to generate a game code for players to enter to join the facilitator's session.

* __FacilitatorCSS:__ Adds styling to the FacilitatorHTML page

* __FacilitatorJS:__ Includes logic for generating game codes and adds functionality to the FacilitatorHTML page.


##### MongoDB Atlas Back-end
* The database is powered by MongoDB atlas and contains the following schemas:


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



### Detailed Module Definitions

* JSDoc has been used to give more detailed descriptions for individual functions in __ClientJS__ and __FacilitatorJS__

* [Link to ClientJS](https://github.com/naeimzarei/Budgetopolis/blob/master/ClientJS.js)

* [Link to FacilitatorJS](https://github.com/naeimzarei/Budgetopolis/blob/master/FacilitatorJS.js)