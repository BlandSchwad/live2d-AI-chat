import "regenerator-runtime/runtime"; // https://github.com/JamesBrill/react-speech-recognition/issues/110#issuecomment-1898624289
import { useEffect, useRef, useState } from "react";
import { Live2DModel, MotionPriority, SoundManager } from "pixi-live2d-display-lipsyncpatch";
import LLMChatOpenAI from "./models/llm/LLMChatOpenAI.ts";
import { addOrChangeSubtitle } from "./models/live2d/functions/subtitle.ts";
import loadModel from "./models/live2d/functions/loadModel";
import autoWink from "./models/live2d/expression/autowink.ts";
import {
  loadModelTo,
  modelShowsUp,
} from "./models/live2d/functions/loadModelTo.ts";
import {
  useBackendEndpoint,
  useOpenaiApikey,
  useOpenaiEndpoint,
  useOpenaiModelName,
  usePlayerLoading,
  useUseBackendLLM,
  useUseBackendTTS,
  useUseWebLLM,
} from "./models/appstore.ts";
import Debug from "./components/debug.tsx";
import Dictaphones, {
  listenContinuously,
  listenOnce,
  stopListening,
} from "./models/stt/Dictaphones.tsx";
import Setting from "./components/setting.tsx";
import { useSpeechRecognition } from "react-speech-recognition";
import LLMChatWebLLM from "./models/llm/LLMChatWebLLM.ts";
import { ChatCompletionChunk } from "@mlc-ai/web-llm";
import { defaultContext, promptHint } from "./models/prompt/static.ts";
import {
  textToSpeechUseBackend,
  textToSpeechWeb,
} from "./models/tts/textToSpeech.ts";
// import CoverSong from './components/CoverSong.tsx'
import { useChat } from "ai/react"
import SongList from "./components/songlist.tsx";
import { Button } from "./components/ui/button.tsx";
import Player from "./components/Player.tsx";
import WavesurferPlayer from "@wavesurfer/react";
import CoverSong from "./components/CoverSong.tsx";
import { Switch } from "./components/ui/switch.tsx";
export type contextType = {
  role: "user" | "assistant" | "system";
  content: string;
};

let userSpeaking = false;
const reader: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stream: any;
  interruptGenerate: () => void;
} = { stream: null, interruptGenerate: () => {} };

function addToContext(
  text: string,
  setContext: (value: React.SetStateAction<contextType[]>) => void
) {
  setContext((context) => {
    const lastContent = JSON.parse(JSON.stringify(context[context.length - 1]));
    lastContent.content = lastContent.content + text;
    return [...context.slice(0, context.length - 1), lastContent];
  });
}
function isBase64Wav(str : String) {
  return /^data:audio\/wav;base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(str);
}

function base64ToBlobUrl(base64String : String, mimeType = "audio/wav") {
  // Remove the "data:audio/mp3;base64," part if present
  let base64Data = base64String.replace(/^data:audio\/wav;base64,/, "");

  // Convert Base64 to binary data
  let byteCharacters = atob(base64Data);
  let byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  let byteArray = new Uint8Array(byteNumbers);

  // Create a Blob from the binary data
  let blob = new Blob([byteArray], { type: mimeType });

  // Generate a Blob URL
  return URL.createObjectURL(blob);
}


function App() {
  const {messages, input, handleInputChange, handleSubmit } = useChat({
    api: 'http://127.0.0.1:61234/api/chat',
    // streamProtocol: 'data',
    // onResponse: response => {
    //   console.log(response.body)
    //   console.log('Received HTTP response from server:', response);
    // },
  })
  function handleSubmit2(e: Event) {
    if (!model) return;
    if (inputRef.current) {
      e.preventDefault();
      // console.log(inputRef.current.value)
      // setInput('')
      handleSubmit(e);
      handleSpeechRecognized(inputRef.current.value);
      // console.log('cleared:', inputRef.current?.value)
    }
    return;



  }
  const [model, setModel] = useState<Live2DModel | null>(null);
  const [context, setContext] = useState<contextType[]>(defaultContext);
  const [subtitle, setSubtitle] = useState("");
  const [debugMode, setDebugMode] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [showSongList, setShowSongList] = useState(false)
  const [chat, setChat] = useState<LLMChatWebLLM | LLMChatOpenAI | null>(null);

  const stage = useRef<HTMLDivElement>(null);
  const TTS = useRef<
    ((input: string, model?: string) => Promise<string>) | null
  >(null);
  const vocalRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null)
  const [backendEndpoint] = useBackendEndpoint();
  const [useBackendLLM] = useUseBackendLLM();
  const [useBackendTTS] = useUseBackendTTS();
  const [useWebLLM] = useUseWebLLM();
  const [openaiEndpoint] = useOpenaiEndpoint();
  const [openaiApikey] = useOpenaiApikey();
  const [openaiModelName] = useOpenaiModelName();
  const { listening, isMicrophoneAvailable, resetTranscript } =
    useSpeechRecognition();
  // const [vocalElement, setVocalElement] = useState<HTMLElement | null>(null)
  // const [backingElement, setBackingElement] = useState<HTMLElement | null>(null)
  const [soundManagerAudios, setSoundManagerAudios] = useState<HTMLAudioElement[] | null>(null)
  const firstTime = context.length === defaultContext.length;
  const [loading, setPlayerLoading] = usePlayerLoading();
  // load chat engine
  useEffect(() => {
    setChat(
      useWebLLM
        ? new LLMChatWebLLM("")
        : new LLMChatOpenAI(
            openaiApikey,
            openaiModelName,
            useBackendLLM ? backendEndpoint + "/llm" : openaiEndpoint
          )
    );
    TTS.current = useBackendTTS ? textToSpeechUseBackend : textToSpeechWeb;

    return () => {
      setChat(null);
      TTS.current = null;
    };
  }, [
    backendEndpoint,
    openaiApikey,
    openaiEndpoint,
    openaiModelName,
    useBackendLLM,
    useBackendTTS,
    useWebLLM,
  ]);

 
  // load model when init
  useEffect(() => {
    (async () => {
      setModel(await loadModel())
    })();
  }, []);

  // motion event
  
  // when model loaded, put it to stage
  useEffect(() => {
    if (!model) return;
    return loadModelTo(stage, model);
  }, [model]);

  // auto wink
  useEffect(() => {
    if (!model) return;
    return autoWink(model);
  }, [model]);

  // init expression
  useEffect(() => {
    if (!model) return;
    // model.expression('翅膀');
    setSubtitle("-- touch anywhere to start --");
  }, [model]);

   //Audio handling for singing
   useEffect(() => {
    if(!model) return
    model.internalModel.motionManager.on('motionStart', (index : string, group : string, audio : HTMLAudioElement ) => {
      console.log(`Motion Start!\n index: ${index} ${audio ? `Audio ${audio}` : '' }`)
      if(audio) {
        const match = audio.src.match(/(https:\/\/storage.googleapis.com\/song-testing-bucket-426522\/[^/]+\/\d+\/)(vocals.mp3)/);
        // const match = audio.src.match(/\/psql\/cover\/([^/]+)\/(backing|vocals)/);
        // console.log("match:", match[1])
        if (match) {
          audio.id = 'vocals'
          // audio.ref =
          SoundManager.audios[0].pause()
          SoundManager.audios[0].currentTime = 0
          // console.log('Sound Manager Vocals:',SoundManager.audios[0])
          setSoundManagerAudios(SoundManager.audios)
          // setVocalElement(SoundManager.audios[0])
          // SoundManager.add(`${match[1]}backing`)
          
          // let backing = SoundManager.add(`http://localhost:8000/psql/cover/${match[1]}/backing`)
          let backing = SoundManager.add(`${match[1]}backing.mp3`)

          backing.id='backing'
          // console.log(match)

          // console.log(SoundManager.audios)
  
          SoundManager.audios[1].addEventListener('canplaythrough', () => {
            setPlayerLoading(false)
            SoundManager.audios[0].play()
            SoundManager.audios[1].play()
  
          })
        }     
      }
    })
  }, [model])

  // change subtitle by context
  useEffect(() => {
    return setSubtitle(context[context.length - 1].content);
  }, [context]);

  // set subtitle directly
  useEffect(() => {
    return addOrChangeSubtitle(subtitle);
  }, [subtitle]);

  // after user speak
  async function handleSpeechRecognized(text: string) {
    const newContext: contextType[] = [
      ...context,
      { role: "user", content: promptHint + text },
    ];
    userSpeaking = false;
    if (!model || !chat) return;
    const { stream, interruptGenerate } = await chat.ask(newContext);
    reader.stream = stream;
    reader.interruptGenerate = interruptGenerate;
    setContext((context) => [...context, { role: "assistant", content: "" }]);
    let currentSentence = "";
    for await (const chunk of reader.stream) {
      const llmResponse = chunk.choices[0]?.delta?.content;
      if (userSpeaking) {
        currentSentence = "";
        reader.stream = null;
        break;
      }
      if (!llmResponse) continue;
      currentSentence += llmResponse;
      if (/[.,!?]$/.test(currentSentence)) {
        addToContext(currentSentence, setContext);
        console.log(TTS);
        if (!TTS.current) {
          alert("please wait for init");
          return;
        }
        const data = await TTS.current(currentSentence, "tts");
        await handleSpeak(data, model);
        currentSentence = "";
      }
    }
    if (reader.stream && currentSentence !== "") {
      addToContext(currentSentence, setContext);
      if (!TTS.current) {
        alert("please wait for init");
        return;
      }
      const data = await TTS.current(currentSentence, "tts");
      await handleSpeak(data, model);
    }
    reader.stream = null;
  }
  function onSeek(ws) {
    // console.log(ws.media.currentTime)
    if(soundManagerAudios && soundManagerAudios[0] != null){
      soundManagerAudios[1].currentTime = ws.media.currentTime
    }
    

  }
  // when user speak break the ai speak
  async function handleUserSpeaking() {
    if (!model) return;
    userSpeaking = true;
    model.stopSpeaking();
    if (reader.stream) {
      addToContext("[break by user]", setContext);
      if (reader.interruptGenerate) reader.interruptGenerate();
      reader.stream = null;
    }
  }

  // ai speak
  async function handleSpeak(audio_link: string, model: Live2DModel) {
    if (model === null || model === undefined) {
      return;
    }
    
    

    const volume = .2; // 声音大小 [可选参数，可以为null或空][0.0-1.0]
    const expression = undefined; // 模型表情 [可选参数，可以为null或空] [index | expression表情名称]
    const resetExpression = true; // 是否在动画结束后将表情expression重置为默认值 [可选参数，可以为null或空] [true | false] [default: true]
    const crossOrigin = "anonymous"; // 使用不同来源的音频 [可选] [default: null]

    function speakWithPromise(
      audio_link: string,
      {
        volume,
        expression,
        resetExpression,
        crossOrigin,
      }: {
        volume?: number;
        expression?: string | number | undefined;
        resetExpression?: boolean;
        crossOrigin?: string;
      }
    ) {
      return new Promise<void>((resolve, reject) => {

        model
          .motion("Speak", undefined, MotionPriority.FORCE)
          .catch((e) => console.error(e));
        model.motion("Speak", undefined, MotionPriority.FORCE, {sound: audio_link, volume: volume,
          expression: expression,
          resetExpression: resetExpression,
          crossOrigin: crossOrigin, 
          onFinish: () => {
            console.log("model stop speak");
            model.motion("Idle").catch((e) => console.error(e));
            setSoundManagerAudios([])
            resolve(); // 成功时解析 Promise
          },
          onError: (err) => {
            console.error("Error: ", err);
            reject(err); // 发生错误时拒绝 Promise
          },})
       
        // model.speak(audio_link, {
        //   volume: volume,
        //   expression: expression,
        //   resetExpression: resetExpression,
        //   crossOrigin: crossOrigin,
        //   onFinish: () => {
        //     console.log("model stop speak");
        //     model.motion("Idle").catch((e) => console.error(e));
        //     resolve(); // 成功时解析 Promise
        //   },
        //   onError: (err) => {
        //     console.error("Error: ", err);
        //     reject(err); // 发生错误时拒绝 Promise
        //   },
        // });
      });
    }
    if (isBase64Wav(audio_link)){
      audio_link = base64ToBlobUrl (audio_link)
      // console.log(`Converted url: ${base64ToBlobUrl(audio_link, 'mp3')}`)   
    }

    await speakWithPromise(audio_link, {
      volume: volume,
      expression: expression,
      resetExpression: resetExpression,
      crossOrigin: crossOrigin,
    }).catch((e) => console.error("speakWithPromise error: ", e));

    // model.speak(audio_link);
    // model.speak(audio_link, { volume: volume });
    // model.speak(audio_link, {
    //   expression: expression,
    //   resetExpression: resetExpression,
    // });
  }

  // user click screen
  function handleClickScreen() {
    if (chat instanceof LLMChatWebLLM) {
      if (chat.getInitStatus() === "not start") {
        const answer = confirm(
          "webLLM need to load every time, first time need some time to download model(~1.5G(PC)/~800MB(phone)). load now?"
        );
        if (answer) {
          const timer = setInterval(() => {
            setSubtitle(chat.initProgress || "webLLM loading");
          }, 1000);
          chat.init().then(() => {
            clearInterval(timer);
            if (chat.getInitStatus() === "done") setSubtitle("webLLM loaded");
            else setSubtitle("webLLM error");
          });
        }
        return;
      } else if (chat.getInitStatus() === "working") {
        alert("webLLM loading: " + chat.initProgress);
        return;
      }
    }
    if (firstTime) {
      if (model) {
        setSubtitle("");
        modelShowsUp(model);
        // handleSpeechRecognized(findTopic());
      }
    } else {
      if (listening) {
        stopListening();
        setSubtitle("-- stop listening... --");
      } else {
        listenOnce();
        // listenContinuously();
        handleUserSpeaking();
        setSubtitle("-- start listening... --");
      }
    }
  }

  return (
    <>
      {!isMicrophoneAvailable && <div>❗Microphone not available❗</div>}
      <div
        onClick={() => {
          handleClickScreen();
        }}
        className="w-screen h-screen"
        ref={stage}
        id="canvas"
      >   </div>
       {/* {loading ? <div>Loading</div> : <div>Not Loading</div>} */}

      {soundManagerAudios && soundManagerAudios.length > 1 && 
        // <Player vocals={soundManagerAudios[0]} backing={soundManagerAudios[1]}/>
        <WavesurferPlayer 
          height={100}
          waveColor={"cyan"}
          onSeeking={onSeek}
          media={soundManagerAudios[0]}
          barWidth={2} />
      }
  {soundManagerAudios && soundManagerAudios.length > 1 && <>
        <Button onClick={() => {
          soundManagerAudios[0].pause()
          soundManagerAudios[1].pause()
          }}>Pause</Button>
        <Button onClick={() => { 
          let time = soundManagerAudios[0].currentTime
          soundManagerAudios[0].pause()
          soundManagerAudios[1].pause()
          soundManagerAudios[0].currentTime = time + 10
          soundManagerAudios[1].currentTime = time + 10
          soundManagerAudios[0].play()
          soundManagerAudios[1].play()



        }}>Fast Forward</Button>
        <Button onClick={() => {
          soundManagerAudios[0].pause()
          soundManagerAudios[1].pause()
          setSoundManagerAudios([])
          SoundManager.dispose(soundManagerAudios[1])
          SoundManager.dispose(soundManagerAudios[0])      
        }}>Stop</Button>
      </>}
      <Dictaphones
        onSpeechRecognized={(text: string) => {
          setContext((context) => [
            ...context,
            { role: "user", content: text },
          ]);
          handleSpeechRecognized(text);
        }}
        onUserSpeaking={(text: string) => {
          handleUserSpeaking();
        }}
      />
     
      {/* Setting */}
      <label>
      <Switch checked={showSetting} onCheckedChange={() => {setShowSetting(!showSetting)}}/>
   
        Settings
      </label>
      

      {/* Debug */}
      <label>
        <Switch checked={debugMode} onCheckedChange={() => setDebugMode(!debugMode)}/>
   
        Debug
      </label>
      

      {/* Show context log */}
      <label>
        <Switch checked={showContext} onCheckedChange={() => {setShowContext(!showContext)}}/>
     
        Chat
      </label>
      
      <label>
      <Switch checked={showSongList} onCheckedChange={() => {setShowSongList(!showSongList)}}/>
        
        Songs

      </label>
      {showSetting && <Setting />}
      {debugMode && <Debug model={model} handleSpeak={handleSpeak} />}
      {showContext && (
            <>
            {context.map(message => (
              <div key={message.id}>
                {`${message.role} :`}
                {message.content}
              </div>
            ))}
      
            <form onSubmit={handleSubmit2}>
              <input ref={inputRef} name="prompt" value={input} onChange={handleInputChange} />
              <Button type="submit">Submit</Button>            
            </form>
          </>
      )}
      {showSongList && <SongList model={model} handleSpeak={handleSpeak}/>}
{/*    
      <CoverSong/> */}
    
    </>
  );
}

export default App;
