# Web3Chess
Just a fun little project.

# Instructions

npm install

npm start

## Start websocket server

cd backend

npm install

node server.js

## Deploy app to internet(Using Render)
* Create an account in github
* Create a repo to store backend of the project
* Create a repo to store frontend of the project
* Go to Render(https://render.com/) and sign up with your github account

--------------------------------------------------
### Backend:
* Click on New + button in top right corner of Render dashboard and choose Web Service

#### Deploy server.js
* Build Command: npm install
* Start Command: node server.js

#### Deploy chatserver.js
* Build Command: npm install
* Start Command: node chatserver.js

---------------------------------------------------
* Update backend URLs in frontend src/utils/const.js
---------------------------------------------------

### Frontend:
* Click on New + button in top right corner of Render dashboard and choose Static Site

* Build Command: npm run build
* Publish directory: build


## How to deploy on Vercel:
* Go to Vercel(https://vercel.com/) and sign in/sign up with github account
* Click on Add New -> Project from dashboard
* Select web3chess frontend repository from Import Git Repository section

## How to deploy on Netlify:
* Go to Netlify(https://www.netlify.com/) and sign in/sign up with github account
* From Team overview section, click on Add New Site -> Import andd existing project
* Click on Deploy with GitHub
* Select the repository
* Fill in Site name and Add environment variable CI=False
* Click on Deploy button

## How to update the game smart contract address to your contract's address

* Copy the contents of `Chess.sol` from the contracts folder
* Go to Remix and create a new .sol file
* Paste the contents
* Compile and Deploy the contract to Polygon Testnet
* Copy the deployed contract address
* Go to src/build.eth/contracts/Chess.json file and paste the copied contract address under "networks":"80001":"address" attribute(or just search for the current address "0x8481ABc4f59F541a9610Ac93Eb5583F881AF9dB4" and replace it with new address)