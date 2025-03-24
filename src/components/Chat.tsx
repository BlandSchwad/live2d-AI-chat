import { useChat } from "ai/react";
import { ChatForm } from "./chatform";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ArrowUp } from "lucide-react";



export default function Chat() {
    const { messages, setMessages, input, handleInputChange, handleSubmit,} = useChat({
        api: `http://127.0.0.1:61234/api/chat`,
        streamProtocol: 'text',
        
        onToolCall: async (toolCall) => {
          console.log(toolCall)
          return toolCall
        },
        // onResponse: async (response) => {
        //   const reader = response.body?.getReader();
        //   const decoder = new TextDecoder("utf-8");
        //   let fullText = "";
      
        //   // Manually append a placeholder assistant message
        //   const messageId = crypto.randomUUID();
        //   setMessages((prev) => [...prev, { id: messageId, role: 'assistant', content: '' }]);
      
        //   while (true) {
        //     const { done, value } = await reader.read();
        //     if (done) break;
      
        //     const chunk = decoder.decode(value, { stream: true });
        //     fullText += chunk;
      
        //     // Custom manipulation
        //     const manipulatedChunk = chunk.toUpperCase(); // Example
      
        //     // Update the last message's content incrementally
        //     setMessages((prev) =>
        //       prev.map((m) =>
        //         m.id === messageId
        //           ? { ...m, content: m.content + manipulatedChunk }
        //           : m
        //       )
        //     );
        //   }
      
        //   console.log("Final fullText:", fullText);
        // }
    });



    function submitChat() {
        console.log()

    }
    return (
      
      <div className="flex flex-col h-full my-8 p-8 mx-80 justify-end items-center">
        {/* {messages.map((m) => <div key={m.id}>{m.content}</div>)} */}
        <div className='flex w-full flex-col h-full'>
        {messages.map(message => (
          <div className={message.role === 'user' ? "userChat p-3 self-end rounded-lg background bg-gray-800 text-secondary" : 'AIChat space-y-2 p-3 text-secondary'} key={message.id}>
            {/* {message.role === 'user' ? 'User: ' : 'AI: '} */}
            {message.content}
          </div>
          
        ))}
        </div>
  
        <div>
       
        </div>
        <div className="h-1/6 w-full flex flex-col relative ">
        <form className='h-full' onSubmit={handleSubmit}>
          <Textarea 
              className="resize-none w-full h-full p-4 pr-16 rounded-2xl bg-gray-800 text-secondary border-transparent"
              placeholder="Enter message"
              name="prompt" value={input} onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); // Prevent newline
                 handleSubmit(); // Trigger form submit
                }
              }} />
               <button
              type="submit"
              className=" absolute bottom-2 right-2 rounded-full text-white px-2 py-2 shadow-md bg-primary hover:bg-blue-600 transition"
            
            >
              <ArrowUp />
            </button>
        </form>
        </div>
      </div>
    );
  }

// {
//     const { messages, input, handleInputChange, handleSubmit } = useChat({});


//     return (
//       <div className="h-full flex flex-col">
//         {/* Chat history */}
//         <div className="flex-grow overflow-auto">
//           {/* Messages go here */}
//           {messages.map(message => (
//         <div key={message.id}>
//           {message.role === 'user' ? 'User: ' : 'AI: '}
//           {message.content}
//         </div>
//       ))}


//         </div>
  
//         {/* Chat input at bottom */}
//         <div className="h-40 border-t">
//           <ChatForm handleSubmit={handleSubmit}/>
//         </div>
//       </div>
//     );
//   }