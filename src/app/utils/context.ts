import { Pinecone, Index, RecordMetadata } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const getContext = async (lastMessage: any): Promise<string> => {
  const pinecone = new Pinecone();

  const indexEnv: string | undefined = process.env.PINECONE_INDEX;
  if (indexEnv === undefined) {
    throw new Error("PINECONE_INDEX is undefined");
  }

  const pineconeIndex: Index<RecordMetadata> = pinecone.Index(indexEnv);

  const vectorStore: PineconeStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );

  const results = await vectorStore.similaritySearch(lastMessage, 2);
  
  // take all the pageContent from the results array and flatten to a single string
  return results.map((result) => result.pageContent).join("\n");
};
