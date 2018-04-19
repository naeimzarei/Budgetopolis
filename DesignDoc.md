# Design Document
## 1) Title Page
__Budgetopolis__

"Don't cross the bottom line!"
### Team:
Yashar Asgari, Naeim Zarei, Daniel Estrada, Robert Anderson

Last Updated: 4/19/2018

## 2) Game Overview
* __Concept:__ 
Three to six group members make budget decisions for their local government based on the group's administration values, which are selected at the beginning of gameplay. Players must decide how to balance their budget each round, when certain scenarios arise where funds may need to be reallocated or cut. The point of the game is to simulate local government budgeting and illustrate the importance of appeasing their constituents throughout. Although there is no winner in Budgetopolis, each group is given a chance to reflect on their choices and see how much they were able to maintain their underlying values.

* __Target Audience:__ 
Currently it's comprised of School of Government students and elected officials, but in the future, should also include 
students (K-12).

* __Genres:__ Educational, Simulation, Board Game

* __Purpose:__ To educate players in the strategy and importance of balancing between budgeting and appeasing their constituents. The game will expose the players to real life scenarios that face elected officials currently in office including (for example), cuts to funding for certain groups. This game will help teach players how to work together effectively as a group, efficiently allocate funds, along with illustrating how certain actions can disrupt the populace.

* __Look and Feel:__ (will be revised) There will be a group (typically between 3-6 players) with a laptop that allows one player to input group budget decisions. The game will look similar to a board game, with an image of the game board showing the city or county's "resources", along with how much money is allocated for each. A radio button will allow players to change from the pie chart view to a tabular view of the budget information. In the middle of the game board are the group's chosen values, each having the ability for the user to obtain more information about the topic. Below the resources, there is a box where game scenarios are shown. On the right side of the screen, there is a box for social media responses. In this box, different media outlets will blast stories, messages, etc regarding the actions the group took (intended to simulate real media and their tendencies). 

* __Intended Use:__ This game will be used in groups to begin training players about the basics of budgeting, along with how their actions can affect the populace they are "elected" to represent. It will also teach players how to work together effectively as a team, and become accustomed to certain group dynamics that are present in real life governmental roles.

## 3) Gameplay

* __Objectives:__ Properly represent the city/county by staying true to the group's chosen "values" along with maintaining a legal, sustainable budget. By working in groups, players will learn to work with another to create solutions to proposed scenarios that cause budget shifts, along with learning the effects of media when receiving blasts in real time (simulating TV, social media, newspapers, etc) in response to their actions.

* __Game Progression and Flow:__ Currently, Budgetopolis supports a city the size of Chapel Hill. In the future, the group will first be assigned a city/county which they must represent. The information included will notify the group of the district's location, population, size, etc which will dictate the amount of resources and funds available. Next, the group must choose four values from a list (with definitions given if a user clicks on one) that they want their administration to stand for along with allocating their budget to each of the resources on the board. Once initial game setup is complete, the computer will notify the group of a certain scenario where they must then adjust/re-allocate the funding to the various resources. Once the group inputs their decisions, the computer will generate media blasts that will "attack" their actions or support them if their decisions align with their chosen values. This cycle repeats for each round, until a certain number of rounds is completed. Ideally, an educational component will be implemented before the start of the game. 

* __Mission/Challenge Structure:__ The main challenge in this game is to efficiently and effectively maintain a balanced budget while staying true to the values selected. Any action taken that may contradict these values are subject to scrutiny in the media and general populace, which can lead to increased pressure facing the administration. Throughout the game, scenarios (simulating real life issues) are imposed on the group where they then must decide how to re-allocate their funds, all while appeasing their constituents.

## 4) Mechanics

* __Rules:__ The rules are centered around community values and budgeting. Therefore, the players are reminded
of what roles they chose at the beginning of the game and must continously maintain them throughout the course
of the game. If they make a decision that diverges from their original values, then they are reminded by the
game logic. In addition, the players must remember that they only have a set budget that cannot be exceeded. 
In order to make budgeting work, the players have to effectively make budget cuts or increases. Again, the 
group must ensure that they do not exceed the budget and that they should use as much of the budget as needed.
The computer logic, of course, will take care of ensuring that this process is carried out the way it should. 

* __Model of the Game Universe:__ This game simulates local government budgeting. The players (government officials) must work together to make budgetary decisions. 

* __Physics:__ For the purpose of this game, there is no need for a physics engine. 

* __Economy:__ The game involves budgeting, so there will be a need to keep track of some numbers. The main
number to keep track of is the budget that is left and how much of it has been spent. In addition, the 
budget cuts and increases need to be kept track of as well. 

* __Character Movement in the Game:__ There is no need for character momvement.

* __Objects:__ In the original game, the chips and values were used as resources. However, in the virtual
game, there is no need to pick up and move objects. 

* __Actions:__ The players must input values and select budget cuts and increases using the mouse and 
keyboard. The players must communicate outside the game in the physical environment to decide what
community values and budgetary decisions they will pursue. 

* __Combat:__ There is no combat in this game. 

* __Screen Flow:__ The screen will show the gameboard in circular format, with the values displayed. As the
game progresses, the screen will have options for the group to select whether or not they want to make 
budget cuts or increases for certain values and options. A tabular view will also be shown that shows the current value, starting value, and percent change for all budget resources. Some sort of social media component will be 
incorporated to simulate community feedback. The social media will be displayed in screen flow. For the 
most part, the screen will be constant until some popup asks for input. When making budget adjustments, a popup will be displayed for players to increase or decrease spending to resources.

* __Game Options:__ The groups have the option to choose their community values and make their own
budgetary decisions. The budget is affected as the group makes these decisions, which determines 
whether or not the group can spend more on or cut certain options.

* __Replaying and Saving:__ There is no option to save the game. However, the user can go back to the game
session they opened earlier, either through web caching or by inputting a randomly generated session ID. 

* __Cheats and Easter Eggs:__ For the purpose of this game, there will be no cheats or Easter Eggs. 

## 5) Story and Narrative

* __Back Story:__ The School of Government at UNC originally built this game to help newly elected city
and council members to think about how to properly spend hte local government budget. This game was originally
a board game and is now being transformed into a web app. 

* __Plot Elements:__ There is no clear plot in the game as it is instructional in manner. However, there are
rounds of gameplay. Each round will consist of each group making budgetary decisions. There is no winner in the
game, so there is no distinct conclusion. The game ends with the group reflecting on their budgetary choices and
seeing how well they were able to maintain their community values. 

* __Game Story Progression:__ There is no game story progression. There are only rounds.

* __Cut Scenes:__ There will be no cut scenes. There will be rounds where the game pauses and waits for the
group to make a decision. 

## 6) Game World

* __General Look and Feel of the World:__ There is no real "world" in Budgetopolis.

* __Areas:__ The only areas for this online game is really the game board and the different parts of the webpage that can be interacted with.

## 7) Characters

* __Characters:__ There aren't any characters in the game because it is a board game.

* __Artificial Intelligence Use in Opponent and Enemy:__ There are no opponents in this game, but random events will occur that will cause the players to make decisions about the current working budget.

* __Non-combat and Friendly Characters:__ There aren't any characters.

## 8) Levels

* __How Levels are Used:__ There are no levels in budgetopolis like in other games, but there will be different variations of the game based on who the players are. The vast majority of Budgetopolis players are adults, so the first priority will be to make the game with an adult audience in mind. This will mean allowing for more control over the budgeting decisions. In the default version, players would be able to distribute funds however they wanted, down to the last dollar while also dealing with pools of funds that more accurately represent what a town or municipality would deal with. In later versions of the game, there would be different settings to allow for a simpler version of the game intended for elementary or middle school students. In these versions, the pool of funds would be set at a lower amount (possibly $100 in total) in order to simplify and streamline the experience for a younger audience.

* __Introductory Material:__ In the current Budgetopolis boardgame, there is an introductory information session about budgeting and community management. In the web application version, the information will be built in via collapsable tool tips. In the future, the clients in the school of goverment may want to implement more introductory educational material in the form of a video before the game begins.

## 9) Interface

* __Visual System:__ Each game of Budgetopolis will have one person inputting all of the agreed upon decisions. The look of the game will be like the board game, but oriented so that all of the text isn't upside down. The middle of the screen will be reserved for displaying the community values and the budget scenarios. The left side of the screen will display the pie chart of the budget, as well as the tabular view of the budget. The right side will display the social media and the happiness indicator with approval rating.

* __HUD:__ The circular board consists of different areas for different public services that need funding. Each area will show how much funding is allocated to that particular service. In the middle of the board, there is an area that displays the values that the group is to be focusing on. When making budget changes, the desired resource is selected and a popup appears, allowing the players to enter a customized value to reduce or increase the budget for that particular resource by, or alternatively choose a predetermined option that will increase or decrease the budget.

* __Menus:__ On the main landing page, players will be asked to enter in a 4 digit code that will link with the facilitators game session. The facilitator side of the game is not implemented yet, but ideally it would allow the facilitator to see the decisions made by each table of players. After entering in the 4 digit code, the user will be asked to select exactly 5 community values. After they are chosen, the game begins and the player will be taken to the main game page with the pie chart and scenario box. Upon completion of the game, a game summary will be shown that reviews the decisions that were made during the game along with the impact of those decisions through op-eds, social media responses, and news headlines.

* __Camera Model:__ The camera in Budgetopolis will be an aerial view of the gameboard.

* __Control System:__ As mentioned above, only one group member will input the budget decisions. They will do so by either typing the desired amount of funding or clicking on an arrow that decreases or increases funding for a particular resource.

* __Audio, Music, Sound effects:__ During the game, sound will be kept to a minimal in order to prevent distraction during group discussions. Alert sounds for the tool tips, social media posts, op-ed articles, and headlines would be a good way to draw attention to the publics responses after budget decisions are made but no sounds are currently implemented.

* __Game Art:__ The game art style will be similar to what is on the current game board; simple, colorful, and cartoonish. A simple style will help keep the focus of players on the discussions about budget decisions rather than fancy or distracting animations. 

* __Help System:__ Having a button with a question mark on the page at all times that can be pressed to bring up a rundown of the objective of the game and basic guidelines of how to play will be present. 

