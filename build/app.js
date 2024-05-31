"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
// import axios from 'axios';
const cors_1 = __importDefault(require("cors")); // Import cors
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
// Load properties data
const properties_json_1 = __importDefault(require("./src/ressources/properties.json"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)()); // Use cors middleware
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const openai = new openai_1.default();
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
    console.log("fetch data");
    res.status(200).json(properties_json_1.default);
});
//call openai
app.post('/api/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userMessage = req.body.message;
    try {
        const completion = yield openai.chat.completions.create({
            messages: [{ "role": "system", "content": "You are a helpful assistant. acts like a real estate agent" },
                { "role": "user", "content": userMessage }],
            model: "gpt-3.5-turbo",
        });
        const botMessage = ((_c = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim()) || '';
        res.status(200).json({ message: botMessage });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}));
//parse chat to json
app.post('/api/parse-to-json', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userMessage = req.body.message;
    try {
        const completion = yield openai.chat.completions.create({
            messages: [{ "role": "system", "content": "You are a helpful assistant designed to output JSON." },
                {
                    "role": "system", "content": `
                Extrait de cette conversation les informations et envoie moi un JSON avec les message du client afin de creer un filtre. Par exemple : {
                "city": "londom",
                "type": "villa",
                "priceMin": 400000 #float,
                "priceMax": 2000000 #float,
                "rooms": 7 #integer,
                "area": 134 #integer
            }`
                },
                { "role": "user", "content": userMessage }],
            model: "gpt-3.5-turbo-0125",
            response_format: { type: "json_object" },
        });
        const botMessage = completion.choices[0].message.content ? JSON.parse(completion.choices[0].message.content) : {};
        console.log(botMessage);
        // const resp = {
        //     city: 'paris',
        //     type: 'Villa',
        //     priceMin: null,
        //     priceMax: null,
        //     rooms: null,
        //     area: null
        //   }
        res.status(200).json({ message: botMessage });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
