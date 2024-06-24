const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Access the API key
const apiKey = process.env.API_KEY;


const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(bodyParser.json());

// Google Places API endpoint
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

// Specify CORS options
const corsOptions = {
  origin: ['http://localhost:3000', 'http://192.168.50.22:3000'], // Allow requests only from this origin
  methods: ['GET', 'POST'], // Allow only specified HTTP methods
};

// Enable CORS with custom options
app.use(cors(corsOptions));

const { GoogleGenerativeAI } = require("@google/generative-ai");

const geminiApiKey = 'AIzaSyAXZEytpJC5F8hpjx-YAZd3qMYJPGUcPr0';
const googleAI = new GoogleGenerativeAI(geminiApiKey);

async function sendPrompt(prompt) {
    const geminiConfig = {
        temperature: 0.9, // Controls randomness of the response (0-1)
        topP: 1, // Probability of picking the most likely word (0-1)
        topK: 1, // Number of highest probability words to consider
        maxOutputTokens: 4096, // Maximum number of words in the response
    };

    const geminiModel = googleAI.getGenerativeModel({ model: "gemini-pro", geminiConfig });

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        //console.log(text); 
        return text;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function geminiAIExtractKeywords(userInput) {
    try {
        // Send prompt to Gemini AI to extract keywords
        let keywords = await sendPrompt(`From the following text, please extract the main keywords or key phrases: '${userInput}'.`);
        
        // Split the string into an array of keywords based on newline character
        keywords = keywords.split('\n').map(keyword => keyword.trim());

        return keywords;
    } catch (error) {
        // Handle any errors
        console.error('Error extracting keywords from Gemini AI:', error);
        throw error;
    }
}

// Function to remove asterisks from keywords
function removeAsterisks(keywords) {
    return keywords.map(keyword => keyword.replace(/^[\*\-\s]*/, ''));
}


async function getDestinationsFromKeywords(keywords,country) {
    try {
        // Construct prompt with keywords
        let destinations = await sendPrompt(`Suggest destinations based on the following keywords: ${keywords}. Include diverse destinations${country ? ` in ${country}` : ''} that match any of the provided keywords. Provide a selection of destinations, ensuring diversity, in a mixed order without numbering and seperating by topics, with a minimum of 10 and up to 30 destinations. **Each destination must strictly adhere to the format 'destination, country' (eg: Paris, France).`);
        
        // Send prompt to Gemini AI
        destinations = destinations.split('\n')
            .map(destination => destination.trim())
            .filter(destination => {
                const parts = destination.split(',').map(part => part.trim());
                return parts.length === 2 && parts[0] && parts[1] && parts[1].match(/^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/);
            });

        return destinations;
    } catch (error) {
        // Handle any errors
        console.error('Error getting destinations from Gemini AI:', error);
        throw error;
    }
}

async function getPlaceDetailsByQuery(query) {
    try {
        const response = await axios.get(`${PLACES_API_URL}?query=${query}&key=${apiKey}`);
        const place = response.data.results[0]; // Assuming we only need details for the first result
        return place;
    } catch (error) {
        console.error('Error fetching place details by query:', error);
        throw error;
    }
}


app.post('/recommend', async (req, res) => {
    try {
        const { userInput } = req.body;

        const country=req.body.country;

        let tagsArray = req.body.tags;


        // Extract keywords using Gemini AI
        let keywords = await geminiAIExtractKeywords(userInput);

        // Convert keywords to an array if it's not already one
        if (!Array.isArray(keywords)) {
            keywords = [keywords];
        }
        // Remove asterisks from keywords
        const cleanedKeywords = removeAsterisks(keywords);

        console.log(cleanedKeywords);
        

        

        const combinedKeywords = [...cleanedKeywords, ...tagsArray];
        console.log(combinedKeywords);

        /////////////////////////////////////////////////////////////////////////

        let destinations = await getDestinationsFromKeywords(combinedKeywords,country);

        if (!Array.isArray(destinations)) {
            destinations = [destinations];
        }
        const cleaneddestinations = removeAsterisks(destinations);

        console.log(cleaneddestinations);

        const destinationsWithPhotos = [];

        for (const destination of destinations) {
            try {
                const place = await getPlaceDetailsByQuery(destination);
                const placeId = place.place_id;
                const name = place.name;
                const photoReference = place.photos ? place.photos[0].photo_reference : null;
                destinationsWithPhotos.push({ name, placeId, photoReference });
            } catch (error) {
                console.error(`Error fetching details for destination '${destination}':`, error);
            }
        }

        
        // Send only the list of destinations
        res.status(200).json(destinationsWithPhotos);

    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});