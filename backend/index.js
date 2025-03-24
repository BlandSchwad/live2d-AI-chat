import express from "express";
import { textToSpeech } from "./models/textToSpeech.js";
import proxy from "express-http-proxy";
import cors from "cors"; // https://expressjs.com/en/resources/middleware/cors.html
import {streamText, createDataStreamResponse, pipeDataStreamToResponse} from "ai"
import { createOpenAI } from "@ai-sdk/openai";
import  { OpenAI } from "openai"
export const maxDuration = 30;
const app = express();
const port = process.env.PORT || 61234;
const lmstudio = createOpenAI({
  name: 'lmstudio',
  apiKey: 'not-needed',
  baseURL: 'http://127.0.0.1:11434/v1/'
})


const tools = [  {
  type: "function",
  function: {
    name: "get_songs",
    description: "Fetches a list of song covers from the server.",
    parameters: {
      type: "object",
      properties: {}, // No parameters required
    },
    required: [],
  },
},

{
  type: "function",
  function: {
    name: "sing",
    description: "Sings a locally available song.",
    parameters: {
      type: "object",
      properties: {}, // No parameters required
    },
    required: [],
  },
},

]


async function get_songs() {
  let response = await fetch(`http://127.0.0.1:61234/api/covers`)
  let list = await response.json()
  return list
}
// const openai = createOpenAI({
//   name:'openai',

//   baseURL: `https://api.openai.com/v1/`
// })

export default async function handler(req, res) {

  
  const { messages } = req.body;
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_ENDPOINT  });

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    stream: true,
    tools: tools,
    store: true
  });

  let toolCallDetected = false;
  let accumulatedToolCall = null;

  // const encoder = new TextEncoder();
  // const decoder = new TextDecoder();

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0].delta;

    if (delta.tool_calls) {
      // console.log('tools detected')
      toolCallDetected = true;
      if (!accumulatedToolCall) {
        accumulatedToolCall = {
          name: "",
          arguments: "",
        };
      }

      for (const toolCall of delta.tool_calls) {
        if (toolCall.function?.name) {
          accumulatedToolCall.name += toolCall.function.name;
        }

        if (toolCall.function?.arguments) {
          accumulatedToolCall.arguments += toolCall.function.arguments;
        }
      }

      continue; // Don't send tool call to frontend
    }

    if (delta.content) {
      // console.log('writing content')
      res.write(`event: content\ndata: ${JSON.stringify({ content: delta.content })}\n\n`);
      // res.write(`${delta.content}`);
    }
  }

  if (toolCallDetected && accumulatedToolCall) {
    const args = JSON.parse(accumulatedToolCall.arguments);
    let toolResult = null
    // 🔧 Call the actual tool function on the backend
    // const songs =.filter(song => song.output_url =! null)
    if(accumulatedToolCall.name === 'get_songs') {
      toolResult = await get_songs()
      console.log('get some songs')
    }

    if(accumulatedToolCall.name === 'sing') {
      console.log("Sing")
      res.write(`event: tool_call\n data: ${JSON.stringify({"name": "sing", "args": null})}\n\n`)
      res.end()
    }
    // Send result back to OpenAI to get final answer
    const followUp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        ...messages,
        {
          role: "assistant",
          tool_calls: [
            {
              id: "call_123",
              type: "function",
              function: {
                name: accumulatedToolCall.name,
                arguments: accumulatedToolCall.arguments,
              },
            },
          ],
        },
        {
          role: "tool",
          type: "function",
          tool_call_id: "call_123",
          content: JSON.stringify(toolResult),
        },
      ],
      stream: true,
    });
    console.log('send followup')
    for await (const chunk of followUp) {
      const delta = chunk.choices[0].delta;
      if (delta.content) {
        // res.write(`${delta.content}`);
        res.write(`event: content\ndata: ${JSON.stringify({ content: delta.content })}\n\n`);
        // res.write(`${delta.content}`);

      }
    }
  }

  // res.write("data: [DONE]\n\n");
  res.end();
}

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
  // console.log(messages)
  const result = streamText({
    // model: openai('gpt-4o'),
    model: lmstudio("TheBloke/OpenHermes-2.5-Mistral-7B-GGUF"),
    system: "You are a AI for chatting. Your job is to entertain users. let's make some short, funny, and humorous conversation",
    messages
  });

  // const response = createDataStreamResponse({
  //   status: 200,
  //   statusText: 'OK',
  //   headers: {
  //     'Custom-Header': 'value',
  //   },
  //   async execute(dataStream) {
  //     // Write data
  //     dataStream.writeData({ value: 'Hello' });
  
  //     // Write annotation
  //     dataStream.writeMessageAnnotation({ type: 'status', value: 'processing' });
  
  //     // Merge another stream
  //     const otherStream = getAnotherStream();
  //     dataStream.merge(otherStream);
  //   },
  //   onError: error => `Custom error: ${error.message}`,
  // });
  // response.pipeDataStreamToResponse(res)
//  createDataStreamResponse()
  // return resultcreatoDataStreamResponse(res)
  return result.pipeTextStreamToResponse(res)

  // return result.toDataStream.pipeDataStreamToResponse(res)

})




app.get('/api/covers', async(req, res) => {
  let response = await fetch(`${process.env.COVER_SERVER}/psql/covers`)
  if(!response.ok){
    throw new Error('Error Contacting Song Server')
  }
  let data = await response.json()
  // console.log(process.env.COVER_SERVER)
  return res.send(data)
})



app.post('/api/derp', handler)
app.listen(port, () => {
  // console.log(process.env.OPENAI_API_KEY, process.env.OPENAI_ENDPOINT)
  console.log(`Example app listening on port ${port}`);
});
