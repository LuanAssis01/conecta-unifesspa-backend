import { FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";

export async function chatWithAgent(request: FastifyRequest, reply: FastifyReply) {
  const { question } = request.body as { question: string };

  if (!question) {
    return reply.status(400).send({ error: "Pergunta não fornecida" });
  }

  try {
    // Monta a URL com o parâmetro codificado
    const encodedQuestion = encodeURIComponent(question);
    const response = await axios.get(`http://136.248.105.71:8000/chat/${encodedQuestion}`);

    return reply.status(200).send({
      query: question,
      answer: response.data.response,
    });
  } catch (error: any) {
    console.error("Erro ao conectar ao agente de IA:", error?.response?.data || error.message);
    return reply.status(500).send({ error: "Falha ao se comunicar com o agente de IA" });
  }
}
