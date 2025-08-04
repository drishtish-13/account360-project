const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Contact = require('../models/Contact');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    const contacts = await Contact.find();
    const contactData = contacts
      .map(c => `${c.name} - ${c.email} - ${c.profession}`)
      .join('\n');

    const prompt = `
You are a contact data assistant. Based on this data:
${contactData}

Answer this question: ${question}
    `;

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 200,
    });

    const reply = chatCompletion.choices[0].message.content.trim();
    res.json({ answer: reply });
  } catch (error) {
    console.error('🔥 AI route error:', error);
    res.status(500).json({ error: 'Something went wrong with AI assistant.' });
  }
});


module.exports = router;
