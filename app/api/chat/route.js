import { NextResponse } from "next/server";
import { OpenAI } from 'openai';

const systemPrompt = "You are in a customer support service, so handle user requests with grace";

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()


const completion = await openai.chat.completions.create({
    messages: [{
        role : 'system',
        content : systemPrompt
    },...data],
    model : 'gpt-4o',
    stream: true,
})

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chuck of completion) {
                    const content = chuck.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (error) {
                controller.error(error)
            } finally {
                controller.close()
            }
        }
    })

    return new NextResponse(stream)

}