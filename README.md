# mantine-react-node-mongodb-typescript-auth-boilerplate

Mantine (mantine.dev) boilerplate for MERN (MongoDB, Express, React, Node) TypeScript applications.

Features include:
• JWT implementation with refresh tokens
• 'Forgot Password' feature with Nodemailer
• User ability to change password after authentication

# How to use

First, you need to create a `.env` file in the root of the directory with the following credentials:
DB_USER=YOUR_MONGODB_USER_HERE
DB_PASSWORD=YOUR_MONGODB_PASSWORD_HERE
DB_DATABASE=YOUR_MONGODB_DATABASE_NAME_HERE
NODEMAILER_USER=YOUR_NODEMAILER_USER_HERE
NODEMAILER_PASSWORD=YOUR_NODEMAILER_PASSWORD_HERE

**Be sure to replace all the values of the above key/value pairs**

Then, run `npm i` in the root of the project *as well as* the `/server` directory

Finally, to run the server and the client, run `npm run dev` in the root folder of the project
