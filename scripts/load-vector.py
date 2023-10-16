import os
from dotenv import load_dotenv
import pinecone
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.document_loaders import JSONLoader

load_dotenv()

# Check if environment variables are set
if None in [os.getenv('OPENAI_API_KEY'), os.getenv('PINECONE_API_KEY'), os.getenv('PINECONE_INDEX'), os.getenv('PINECONE_ENVIRONMENT')]:
    raise Exception("OpenAI key not found in environment variables.")
else:
    openai_api_key = os.getenv('OPENAI_API_KEY')
    pinecone_api_key = os.getenv('PINECONE_API_KEY')
    pinecone_index = os.getenv('PINECONE_INDEX')
    pinecone_environment = os.getenv('PINECONE_ENVIRONMENT')

# Set embedding function
embed = OpenAIEmbeddings(
    model='text-embedding-ada-002',
    openai_api_key=openai_api_key
)

# Init pinecone client
pinecone.init(
    api_key=pinecone_api_key,
    environment=pinecone_environment
)

# Create index if it doesn't exist
if pinecone_index not in pinecone.list_indexes():
    pinecone.create_index(
        name=pinecone_index,
        metric='cosine',
        dimension=1536
    )

# Load documents
loader = JSONLoader(file_path='./scripts/prompt_data.jsonl', jq_schema='.', text_content=False, json_lines=True)
docs = loader.load()

# Load documents into pinecone
Pinecone.from_documents(documents=docs, embedding=embed, batch_size=1000, index_name=pinecone_index)

print("Done!")
