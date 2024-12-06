import express from "express";
import { textToSpeech } from "./models/textToSpeech.js";
import proxy from "express-http-proxy";
import cors from "cors"; // https://expressjs.com/en/resources/middleware/cors.html
import {streamText} from "ai"
import { createOpenAI } from "@ai-sdk/openai";
export const maxDuration = 30;
const app = express();
const port = process.env.PORT || 61234;
const lmstudio = createOpenAI({
  name: 'lmstudio',
  apiKey: 'not-needed',
  baseURL: 'http://127.0.0.1:11434/v1/'
})
app.use(express.json());
var corsOptions = {
  origin: JSON.parse(process.env.cors_allowed_origins),
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
app.use("/static", express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/tts", async (req, res) => {
  console.log(`request path: ${req.url} -- "${req.body.input}"`);
  let data = await textToSpeech(req.body.input);
  res.send(`${data}`);
});

app.post(
  "/llm*",
  proxy(process.env.openai_endpoint, {
    filter: function (req, res) {
      return req.method == "POST";
    },
    proxyReqPathResolver: function (req) {
      console.log(`request path: ${req.url}`);

      return `/v1${req.url.replace('/llm','')}`;
    }
  })
);

app.post("/api/chat", async(req, res) => {
  const { messages } = req.body
  console.log(messages)
  const result = streamText({
    model: lmstudio("TheBloke/OpenHermes-2.5-Mistral-7B-GGUF"),
    system: "You are a AI for chatting. Your job is to entertain users. let's make some short, funny, and humorous conversation",
    messages
  });
  
  return result.pipeDataStreamToResponse(res)  

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
