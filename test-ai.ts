import fetch from "node-fetch";

async function run() {
  const resumeText = "This is a resume text. I am a software engineer. ".repeat(300000); // about 15MB
  const prompt = `Act as an expert career coach and executive resume writer. 
    Analyze the following raw text and structure it into a professional, polished resume in JSON format.
    
    Target Job Title: Software Engineer
    Job Description: We need a dev.
    
    RAW TEXT TO ANALYZE:
    ${resumeText}`;
  try {
    const response = await fetch("http://127.0.0.1:3000/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model: "gemini-3-flash-preview", config: { responseMimeType: "application/json" } })
    });
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text.substring(0, 100));
  } catch (e) {
    console.error(e);
  }
}
run();
