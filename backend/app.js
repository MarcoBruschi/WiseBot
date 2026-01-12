import express from "express";
import generateText from "./generateText.js";
import cors from "cors";
import dbConnection from "./dbConnection.js";
import dotenv from "dotenv";
import Topic from "./Topic.js";

dotenv.config();

const conn = await dbConnection();

conn.once("open", () => {
  console.log("Banco conectado");
});

const app = express();
app.use(express.json());
app.use(cors());

app.post("/generate", async (req, res) => {
  const topic = req.body.topic;
  const apiKey = req.body.apiKey;
  if (!topic) {
    return res.status(400).json({ error: "Tópico é obrigatório" });
  }
  if (!apiKey) {
    return res.status(400).json({ error: "Uma chave de API é obrigatória" });
  }
  try {
    const topicJson = await generateText(topic, apiKey);
    await Topic.create(JSON.parse(topicJson));
    res.status(200).json({ success: `Sucesso ao criar tópico` });
  } catch (error) {
    res.status(500).json({ error: `Falha ao gerar conteúdo - ${error}` });
  }
});

app.get("/topics", async (req, res) => {
  try {
    const topicsFind = await Topic.find({});
    res.status(200).json({ success: `Sucesso ao consultar tópicos`, data: topicsFind });
  } catch (error) {
    res.status(500).json({ error: `Falha ao consultar tópicos - ${error}` });
  }
});

app.delete("/topics/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) res.status(404).json({ error: "Um id deve ser informado "});
  try {
    await Topic.findByIdAndDelete(id);
    res.status(200).json({ success: "Tópico deletado com sucesso "});
  } catch (error) {
    res.status(500).json({ error: `Falha ao deletar tópico - ${error}` });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log("Servidor ligado na porta 3000");
});
