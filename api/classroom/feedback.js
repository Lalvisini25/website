import { Configuration, OpenAIApi } from "openai";

// Configuration for the OpenAI API
// This is used to generate feedback for students
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

// Initialize the OpenAI API
const openai = new OpenAIApi(configuration)
// Generates feedback for a student based on their scores and areas to improve
export const generateFeedback = async (req, res) => {
  const { paper_type, criteria, improvement_notes = "" } = req.body

  if (!paper_type || !criteria) {
    return res.status(400).json({ error: "Missing paper type or criteria" })
  }

  // Prompt sent to the GPT model
  // The model is instructed to generate concise feedback based on the scores and areas to improve
  const prompt = `
    You are an IB teacher. Based on these scores and areas to improve, generate concise feedback.

    Paper Type: ${paper_type}
    Criteria A: ${criteria.A}/ ${paper_type === 'paper 2' ? 10 : 5}
    Criteria B: ${criteria.B}/ ${paper_type === 'paper 2' ? 10 : 5}
    Criteria C: ${criteria.C}/5
    Criteria D: ${criteria.D}/5

    Things the student should work on: ${improvement_notes}

    Briefly comment on each criterion and offer actionable advice based on the student's scoring and the paper type. Avoid generic praise.

    After commenting on each criterion, offer the student some resources to help them improve their score based on their lowest scoring criteria and what they should 
    work on.

    Speak in the second person directly to the student.
  `

  try {
    // Use the GPT model to generate feedback
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500
    })

    // Extract the generated feedback from the response
    const feedback = completion.data.choices[0].message.content.trim()
    res.json({ feedback })
  } catch (err) {
    console.error("GPT error:", err.message)
    // If there is an error, send a 500 error
    res.status(500).json({ error: "Failed to generate feedback" })
  }
}
