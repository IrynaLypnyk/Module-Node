process.env.PORT = process.env.PORT || 9090;
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const welcomeMessage = {
  id: 0,
  from: "Bart",
  text: "Welcome to CYF chat system!",
  timeSent: new Date(),
};

//This array is our "data store".
//We will start with one message in the array.
//Note: messages will be lost when Glitch restarts our server.
let messages = [welcomeMessage];

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

app.get('/messages', function(req, res){
  res.status(200).json({messages})
});


app.get('/messages/search', (req, res) => {
  const searchText = req.query.text;
  const filteredMessages = messages.filter((m) =>
      m.text.includes(searchText)
  );
  res.status(200).json({ messages: filteredMessages });
});

app.get('/messages/latest', (req, res) => {
  const recentMessages = messages.slice(-10);

  res.status(200).json({ messages: recentMessages });
});

app.get('/messages/:id', function(req, res){
  const id = req.params.id;
  res.status(200).json({messages: messages.filter(m => String(m.id) === id)});
});

app.post('/messages', function(req, res){
  if(req.body.from && req.body.text){
    const newMessage = {
      id: messages.length,
      from: req.body.from,
      text: req.body.text,
      timeSent: new Date(),
    }
    messages.push(newMessage);
    res.status(201).json({newMessage})
  } else {
    res.status(400).json({error: "Bad request"});
  }
});

app.delete('/messages/:id', function(req, res){
  const id = parseInt(req.params.id);
  // Find the item index in the array
  const msgIndex = messages.findIndex((message) => message.id === id);

  if (msgIndex === -1) {
    // Item not found
    res.status(404).json({ message: 'Message not found' });
  } else {
    // Remove the item from the array
    messages.splice(msgIndex, 1);
    res.status(200).json({ success: true});
  }

});

app.put('/messages/:id', (req, res) => {
  const id = req.params.id;
  const updatedMessage = messages.find((m) => String(m.id) === id);

  if (!updatedMessage) {
    res.status(404).json({ message: 'Message not found' });
  } else {
    // Update the 'text' and 'from' properties if provided by the client
    if (req.body.text !== undefined) {
      updatedMessage.text = req.body.text;
    }
    if (req.body.from !== undefined) {
      updatedMessage.from = req.body.from;
    }

    res.status(200).json({ message: updatedMessage });
  }
});

app.listen(process.env.PORT,() => {
  console.log(`listening on PORT ${process.env.PORT}...`);
});
