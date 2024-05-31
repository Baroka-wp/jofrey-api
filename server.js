const express = require('express');
const bodyParser = require('body-parser');
// const axios = require('axios');
const cors = require('cors'); // Import cors
const dotenv = require('dotenv');
const OpenAI = require('openai');

// Load properties data
const properties = require('./src/ressources/properties.json');


dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Use cors middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const openai = new OpenAI()

// Enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    res.json('Bienvenue sur le site de location d\'appartements !');
  });
  

// Define a route to get properties
app.get('/api/properties', (req, res) => {
    console.log("fetch data")
    res.status(200).json(properties);
});


//call openai
app.post('/api/generate', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{"role": "system", "content": "You are a helpful assistant. acts like a real estate agent"},
            {"role": "user", "content": userMessage}],
            model: "gpt-3.5-turbo",
          });

        const botMessage = completion.choices[0].message.content.trim();
        res.status(200).json({ message: botMessage });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }

});


//parse chat to json
app.post('/api/parse-to-json', async (req, res) => {
    const userMessage = req.body.message;
    try {
          const completion = await openai.chat.completions.create({
            messages: [{"role": "system", "content": "You are a helpful assistant designed to output JSON."},
            {"role": "system", "content": `
                Extrait de cette conversation les informations et envoie moi un JSON avec les message du client afin de creer un filtre. Par exemple : {
                "city": "londom",
                "type": "villa",
                "priceMin": 400000 #float,
                "priceMax": 2000000 #float,
                "rooms": 7 #integer,
                "area": 134 #integer
            }`},
            {"role": "user", "content": userMessage}],
            model: "gpt-3.5-turbo-0125",
            response_format: { type: "json_object" },
          });
        

        const botMessage = JSON.parse(completion.choices[0].message.content);
        console.log(botMessage)

        // const resp = {
        //     city: 'paris',
        //     type: 'Villa',
        //     priceMin: null,
        //     priceMax: null,
        //     rooms: null,
        //     area: null
        //   }

        res.status(200).json({ message: botMessage });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }

});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
