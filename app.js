const express = require('express')
const app = express()
const path = require('path')
const tmi = require('tmi.js')
const bannedWords = require('./bannedWords.json')
const fs = require('fs')

require('dotenv').config()
const port = process.env.PORT || "8080"
let upVotes = 0;
let downVotes = 0;


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get( '/', (req,res)=>{
  res.render('vote',{upVotes,downVotes})
})

const opts = {
  options: {debug: true},
	identity: {
		username: process.env.BOT_USER_NAME,
		password: process.env.BOT_OAUTH_TOKEN
	},
	channels: [
		process.env.CHANNEL_NAME
	]
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect().catch(console.error);

function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();
  const name = target.slice(1, target.length)
  // If the command is known, let's execute it
  switch(commandName){
    case "!dice":
      const num = rollDice();
      client.say(target, `You rolled a ${num}`);
      console.log(`* Executed ${commandName} command`);
      break;
    case "!upvote":
      client.say(target, `@${name} you up voted!`);
      console.log(`Up vote added`)
      upvote()
      break;
    case "!downvote":
      client.say(target, `@${name} you down voted!`)
      downvote()
      console.log(`Down votes added`)
      break;
    case "!insult":
      const thisInsult = insult(name)
      client.say(target, `${thisInsult}`)
      console.log(`* Executed ${commandName} command`);
      break;
      case '!info':
       
       break;
    default:
          console.log(`* Unknown command ${commandName}`);
  }
}

// Function called when the "dice" command is issued
function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

function insult(target){
  return `@${target}...  You're mother looks like an ogre!`
}
function upvote(){
  upVotes = upVotes + 1 ;
}

function downvote(){
  downVotes = downVotes + 1;
}
// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

app.listen(port, () =>{
  console.log(`Node is currently working on ${port}`)
})