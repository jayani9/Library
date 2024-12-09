## Description
Library System.
Frontend - developed using React JS library(vite project).
Backend - developed using Node.js(18.14.1) and Express.js
DataBase - mongodb
Using multer library to upload and save images in local
password hashing - bcrypt.js
authentication - json web token (refresh and access tokens)


## Authorization
This App have two roles(user, admin).
All users can add, edit and read books data.
Only admin can delete books and add, edit and read books data.

## Style
Using Tailwind css for style all components

## Node JS install(18.14.1)
https://nodejs.org/en/blog/release/v18.14.1 open this link and download node or
open terminal and type 
    1. nvm install 18.14.1
    2. nvm use 18.14.1


## Install Guide
open terminal and type,
 1. git clone https://github.com/migara10/Book-Manage

 ## run server
  1. copy ACCESS_KEY, REFRESH_KEY & DB_URI in config.js
  
  2. open Book-Manage in terminal
  3. cd server
  4. npm i --save
  5. node server.js
  5. The server run on http://localhost:3000


 ## Testing credentials
  1. user ,
     userName = kothalawala,
     password = game1994

  2. admin ,
     userName = jayani,
     password = game1994
   

 


