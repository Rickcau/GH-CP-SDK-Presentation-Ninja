# Azure AI Foundry - Features

## Model Catalog and Deployment

### Model Discovery
- Browse 1,600+ models organized by task (text generation, embeddings, vision, speech, multimodal)
- Filter by provider (Azure OpenAI, Meta, Mistral, Cohere, Microsoft Research, Hugging Face)
- Model cards with benchmarks, pricing, capabilities, and licensing information
- Side-by-side model comparison on standard benchmarks (MMLU, HumanEval, HellaSwag)

### Model Deployment Options
- **One-click deployment**: Deploy any catalog model to a managed endpoint in minutes
- **Serverless API**: Pay-per-token deployment for Azure OpenAI and select partner models
- **Managed compute**: Dedicated GPU instances for open-source model hosting
- **Provisioned throughput (PTU)**: Reserved capacity for guaranteed latency and throughput

### Model Benchmarking
- Run standardized benchmarks against your specific use case data
- Compare multiple models on quality, latency, cost, and safety metrics
- Export benchmark results for stakeholder review

## Prompt Flow (Orchestration Engine)

### Visual Workflow Builder
Prompt Flow provides a drag-and-drop interface for building AI orchestration pipelines:

- **LLM Nodes**: Call any deployed model with templated prompts
- **Python Nodes**: Execute custom Python code for data transformation
- **Tool Nodes**: Integrate with external APIs and services
- **Conditional Nodes**: Branch logic based on model outputs or data conditions
- **Parallel Nodes**: Execute multiple operations concurrently

### Code-First Development
```python
from promptflow import tool
from promptflow.connections import AzureOpenAIConnection

@tool
def generate_response(connection: AzureOpenAIConnection, question: str, context: str) -> str:
    # Custom orchestration logic
    prompt = f"Context: {context}\nQuestion: {question}\nAnswer:"
    response = connection.chat(messages=[{"role": "user", "content": prompt}])
    return response.choices[0].message.content
```

### Prompt Flow Features
- **Variants**: A/B test different prompts and model configurations
- **Batch Runs**: Process datasets through flows for evaluation
- **Debugging**: Step-through execution with input/output inspection at each node
- **Caching**: Node-level caching to avoid redundant LLM calls during development
- **Deployment**: Direct deployment of flows as REST endpoints

## Fine-Tuning

### Supervised Fine-Tuning
- Upload training datasets in JSONL format (prompt-completion or chat format)
- Supported models: GPT-4o, GPT-4o-mini, GPT-3.5 Turbo, Phi-3, Llama 3.1
- Configurable hyperparameters: epochs, learning rate, batch size
- Automatic training/validation split with loss monitoring

### LoRA (Low-Rank Adaptation)
- Parameter-efficient fine-tuning for open-source models
- Significantly lower compute cost compared to full fine-tuning
- Supported for Llama, Mistral, and Phi model families
- Export LoRA adapters for deployment alongside base models

### Fine-Tuning Workflow
1. Prepare dataset (minimum 10 examples, recommended 50-100+)
2. Select base model and configure hyperparameters
3. Launch training job on managed compute
4. Monitor training metrics (loss, validation accuracy)
5. Deploy fine-tuned model to endpoint
6. Evaluate against base model on your task-specific metrics

## Evaluations

### Automated Quality Evaluations
Built-in evaluators measure AI application quality across multiple dimensions:

- **Groundedness**: Does the response stay grounded in the provided context? (critical for RAG)
- **Relevance**: Is the response relevant to the user's question?
- **Coherence**: Is the response logically coherent and well-structured?
- **Fluency**: Is the response grammatically correct and natural?
- **Similarity**: How similar is the response to a ground-truth reference answer?
- **F1 Score**: Token-level overlap with reference answers

### Safety Evaluations
- **Violence**: Detection of violent content in model outputs
- **Sexual Content**: Detection of sexually explicit material
- **Self-Harm**: Detection of self-harm related content
- **Hate/Unfairness**: Detection of hateful or discriminatory content
- **Jailbreak Detection**: Evaluation of prompt injection resistance

### Custom Evaluators
```python
from azure.ai.evaluation import evaluate

# Define a custom evaluator
def length_evaluator(response: str, **kwargs) -> dict:
    return {"response_length": len(response), "within_limit": len(response) < 500}

# Run evaluation
results = evaluate(
    data="test_dataset.jsonl",
    evaluators={
        "groundedness": GroundednessEvaluator(model_config),
        "relevance": RelevanceEvaluator(model_config),
        "custom_length": length_evaluator,
    },
)
```

### Evaluation Dashboard
- Visual results with per-metric breakdowns
- Distribution histograms for each quality and safety metric
- Drill-down into individual examples for failure analysis
- Comparison across evaluation runs to track improvements

## Content Safety (Azure AI Content Safety)

- **Text Moderation**: Real-time content filtering for text inputs and outputs
- **Image Moderation**: Detection of harmful visual content
- **Prompt Shields**: Protection against jailbreak attacks and prompt injection
- **Groundedness Detection**: API to verify responses are grounded in source documents
- **Protected Material Detection**: Identification of copyrighted content in outputs
- **Custom Blocklists**: Organization-specific content filtering rules
- **Severity Levels**: Configurable thresholds (safe, low, medium, high) per category

## Tracing and Monitoring

### Built-in Tracing
- Distributed tracing for every prompt flow execution
- Token usage tracking per node and per request
- Latency breakdown across the entire pipeline
- Input/output capture for debugging and auditing

### Azure Monitor Integration
- Custom metrics dashboards for model performance
- Alerting on latency spikes, error rates, and cost thresholds
- Log Analytics queries for deep investigation
- Workbook templates for common AI monitoring scenarios

## Vector Indexes

### Index Creation
- Upload documents directly through the portal or SDK
- Automatic document cracking (PDF, DOCX, PPTX, HTML, Markdown)
- Configurable chunking strategies (fixed-size with overlap, semantic chunking)
- Built-in embedding generation using Azure OpenAI embedding models

### Index Management
- Incremental index updates without full rebuilds
- Scheduled refresh for dynamic data sources
- Index versioning for rollback capabilities
- Performance metrics (query latency, recall rates)

## Code-First SDK

### azure-ai-projects
```python
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

client = AIProjectClient(
    credential=DefaultAzureCredential(),
    subscription_id="...",
    resource_group_name="...",
    project_name="my-project",
)

# List deployments
deployments = client.deployments.list()

# Run an evaluation
evaluation = client.evaluations.create(
    data="test_data.jsonl",
    evaluators={"groundedness": {"type": "groundedness"}},
)
```

### azure-ai-inference
```python
from azure.ai.inference import ChatCompletionsClient
from azure.core.credentials import AzureKeyCredential

client = ChatCompletionsClient(
    endpoint="https://my-endpoint.inference.ai.azure.com",
    credential=AzureKeyCredential("your-key"),
)

response = client.complete(
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum computing in simple terms."},
    ],
    model="gpt-4o",
)
```
