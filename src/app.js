const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const axios = require('axios');
const { HfInference } = require('@huggingface/inference');
const bodyParser = require('body-parser');
const hbs = require('hbs');

require('dotenv').config();
require('./db/conn');

const hf = new HfInference(process.env.H_FACE_KEY);

const app = express();
const port = process.env.PORT || 1000;

const staticPath = path.join(__dirname, "../public");
const templatePath = path.join(__dirname, "../templates/views");
const partialPath = path.join(__dirname, "../templates/partials");
const postPath = path.join(__dirname, "../templates/posts");
const audioDirectory = path.join(__dirname, 'public', 'audio');

if (!fs.existsSync(audioDirectory)) {
    fs.mkdirSync(audioDirectory, { recursive: true });
}

app.use(bodyParser.json());
app.use('/css', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css")));
app.use('/js', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/js")));
app.use('/jq', express.static(path.join(__dirname, "../node_modules/jquery/dist")));
app.use(express.static(staticPath));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/audio', express.static(audioDirectory));


// Set up Handlebars
app.set("view engine", "hbs");
app.set("views", [templatePath, postPath]);
hbs.registerPartials(partialPath);


// const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';
const HF_AUD_API_URL = 'https://api-inference.huggingface.co/models/microsoft/speecht5_tts'

const User = require("./models/usermessage");

// Routes
app.get("/", (req, res) => {
    res.render('index', {layout : 'index'});
});

app.get("/posts", (req, res) => {
    res.render("posts");
});

app.get("/projects", (req, res) => {
    res.render("projects");
});

app.get("/assistant", (req, res) => {
    res.render("assistant");
});

app.get("/ml_post", (req, res) => {
    res.render("ml_post");
});

app.post("/contact", async (req, res) => {
    try {
        const userData = new User(req.body);
        await userData.save();
        res.status(201).render("index");
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/regression", (req, res) => {
    res.render("regression");
});

app.get('/api/projects', async (req, res) => {
    const { username, page, projectsPerPage} = req.query;
    const accessToken = process.env.GITHUB_ACCESS_TOKEN;
    const url = `https://api.github.com/users/${username}/repos?page=${page}&per_page=${projectsPerPage}`;
    
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
    };

    if (accessToken) {
        headers['Authorization'] = `token ${accessToken}`;
    }

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            return res.status(response.status).json({ error: response.statusText });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


let conversationHistory = [];

async function fetchFromModel(prompt, retries = 3, delay = 15000) {
    try {
        const response = await axios.post(HF_API_URL, {
            inputs: prompt,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.H_FACE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data[0].generated_text.trim();
    } catch (error) {
        if (error.response && error.response.data.error.includes('currently loading') && retries > 0) {
            console.log('Model is loading, retrying in 5 seconds...');
            await new Promise(res => setTimeout(res, delay));
            return fetchFromModel(prompt, retries - 1, delay);
        } else {
            throw error;
        }
    }
}

app.post("/api/openai", async (req, res) => {
    const prompt = req.body.prompt.trim();
    console.log('Text at server:', prompt);

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt cannot be empty' });
    }

    try {
        let responseText;

        if (prompt.toLowerCase().includes("good day") || prompt.toLowerCase().includes("hello")) {
            responseText = prompt;
        } else {
            conversationHistory.push(`User: ${prompt}`);
            const conversationContext = conversationHistory.join('\n') + '\nAI:';
            responseText = await fetchFromModel(conversationContext);

            if (!responseText) {
                return res.status(500).json({ error: 'No response received from the model' });
            }

            conversationHistory.push(`AI: ${responseText}`);
        }
        console.log("text : ",responseText);

        console.log("aud processing begin ..");
        

        const audioResponse = await axios.post(HF_AUD_API_URL, {
            inputs: responseText,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.H_FACE_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'audio/wav'
            },
            responseType: 'arraybuffer'
        });

        const audioFilePath = path.join(audioDirectory, 'output.wav');
        const writeFile = util.promisify(fs.writeFile);
        await writeFile(audioFilePath, audioResponse.data , "binary");

        console.log("Audio saved to:", audioFilePath);

        res.json({
            message: responseText,
            audio: `/audio/output.wav`
        });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to process request' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
