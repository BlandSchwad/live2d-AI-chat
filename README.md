# live2d chat

this is a app, you can talk with a live2d model.

![image](https://github.com/user-attachments/assets/d5185348-a251-4ff8-aa3e-e2ffcaa03bed)


# feature

1. show live2d model 🆗
2. auto change expression of model
3. auto change motion of model 🆗
4. speech to text 🆗 (web speech api) 
5. text to speech 🆗 (backend: node-edge-tts) 
6. style of speech
7. subtitle of AI and User 🆗
8. long-term memory
9. Custom chat model
10. Speaking first / Find topics
11. changeable model, expression and motion
12. other function: playing games, singing，searching google, etc.

# how to develop?

1. install [ollama](https://ollama.com/) and pull llama3.1 model (you can change the model in src/config.ts)
2. install nodejs, pnpm, bun(optional)
3. git clone https://github.com/zoollcar/live2d-AI-chat
4. cd live2d-AI-chat & pnpm install & cd backend & pnpm install
5. run the backend: cd backend & node index.js
6. run the app: cd live2d-AI-chat & pnpm run dev

# how to build to exe? (have some issue for now, not work)

1. install nodejs, pnpm, bun
2. git clone https://github.com/zoollcar/live2d-AI-chat
3. cd live2d-AI-chat & pnpm install & cd backend & bun install
4. build the backend embed to frontend : cd backend & bun run build:windows
5. cd live2d-AI-chat & pnpm run tauri:build

# config

frontend: src/config.ts
backend: backend/.env.local


# credits
live2d model: [Tianyelulu](https://tianyelulu.booth.pm)
