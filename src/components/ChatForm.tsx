"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
const formSchema = z.object({
  chat: z.string().min(1).max(500),
})

export function ChatForm({handleSubmit} : {handleSubmit: (text: string)=> void}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            chat: ""
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        let {chat} = values
        console.log
        form.reset()
        handleSubmit(chat)
    }

    return (
     
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-grow h-full relative"
        >
          <FormField
            control={form.control}
            name="chat"
            render={({ field }) => (
              <FormItem className="flex flex-col flex-grow">
                <div className="relative flex-grow">
                  <FormControl>
                    <Textarea
                      placeholder="Enter message"
                      {...field}
                      className="resize-none w-full h-full p-4 pr-16 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    className="absolute bottom-2 right-2 rounded-full text-white px-4 py-2 shadow-md hover:bg-blue-600 transition"
                  >
                    <ArrowUp />
                  </Button>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
  
    )
    
}


