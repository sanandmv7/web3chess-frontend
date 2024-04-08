# Web3Chess
Just a fun little project.

# Instructions

npm install

npm start

## Start websocket server

cd backend

npm install

node server.js

## Deploy app to internet
* Create an account in github
* Create a repo to store backend of the project
* Create a repo to store frontend of the project
* Go to Render(https://render.com/) and sign up with your github account

--------------------------------------------------
Backend:
Click on New + button in top right corner of Render dashboard and choose Web Service

Deploy server.js
Build Command: npm install
Start Command: node server.js

Deploy chatserver.js
Build Command: npm install
Start Command: node chatserver.js

---------------------------------------------------
Update backend URLs in frontend src/utils/const.js
---------------------------------------------------

Frontend:
Click on New + button in top right corner of Render dashboard and choose Static Site

Build Command: npm run build
Publish directory: build