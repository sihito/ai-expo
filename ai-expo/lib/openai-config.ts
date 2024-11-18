import { OpenAI } from 'openai';

interface CompanyData {
  name: string
  memo: string
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: 'system' | 'user' | 'assistant';
      content: string | null;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateReport(companyData: CompanyData[]): Promise<string> {
  try {
    const response: ChatCompletionResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたは展示会の報告書作成担当者です. 以下に示す事実を参考に所感を記述してください. 所感とは事実に感想を加えたものです。"
        },
        {
          role: "user",
          content: `AI所感: ${JSON.stringify(companyData)}`
        }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content ? response.choices[0].message.content : '';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to generate report');
  }
}