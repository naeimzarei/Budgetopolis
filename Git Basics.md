# Git Basics

I went ahead and created a GitHub repository for us. You can go ahead and clone it on your local machine with the following command, but make sure you have Git installed: git clone https://github.com/naeimzarei/Budgetopolis.git. To create your branch, run this command in Terminal while being in the same directory as Budgetopolis: ```git checkout -b your-name master```. This will create a branch on your name based off the master branch, which will have our final product.

When you make a change to a file, do the command: ```git add *``` . This will add all the files that have been edited on your end for queueing. Then you do the command: ```git commit -m "Description of what you worked on or did goes here"```. Then run the command: git status. That shows you what files are queued to be pushed. After you have done that, do the command: ```git push origin your-branch-name```. This will push the changes to your branch.
In order to sync your branch with the master branch, you will need to do the command: ```git checkout master```, then ```git merge your-branch-name```, then ```git push origin master```.

At some point, Git will ask you to configure global variables and here is how to do them. First, you must tell Git your GitHub email: ```git config --global user.email "your-GitHub-email-goes-here"```. Then, you will have to tell Git your GitHub username: ```git config --global user.name "your-GitHub-username-goes-here"```. 

If you want to pull changes from the master branch to your own branch, you need to do the command: ```git checkout master```. This will change the working branch to the master branch. Then, you will need to do the follow command: ```git pull```. This will pull changes from the master branch to your local machine, under the master branch. Then, do: ```git checkout your-branch-name```. Finally, you will need to do: ```git merge master```. This will merge the master branch on your local branch, locally. 

Keep in mind, each time you call: ```git checkout branch-name```, Git changes your working directory to reflect the files on that branch that you checked out to. For instance, if you were originally in the master branch, switching to your branch would only show your branch's files in the directory that it was switched to. Your code editor's directory will reflect the changes, as you will see. Essentially, the folder that you have Budgetopolis would only show the files on the branch that you checked to. At any time, you can switch back to the original branch by doing this: ```git checkout original-working-branch```. 

# Markdown Basics

Here is a link to a website that has a markdown cheat sheet, which I have found really useful: [Markdown Basics ](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). 