# Azure AI Foundry - Architecture

## Hub and Project Architecture

Azure AI Foundry uses a two-level organizational structure built on top of Azure Resource Manager:

### AI Foundry Hub (Central Governance Layer)

The Hub is the top-level resource that provides centralized governance and shared infrastructure for AI development. A Hub maps to an Azure resource group and manages:

- **Shared Compute Resources**: Compute instances and clusters that can be shared across projects within the Hub
- **Connections**: Centrally managed connections to Azure services and external APIs (Azure OpenAI, AI Search, Blob Storage, Key Vault, custom endpoints)
- **Security Policies**: Network isolation rules, managed identity configuration, role-based access control (RBAC) policies
- **Billing Scope**: All resource consumption within the Hub rolls up to a single Azure subscription for cost management
- **Compliance Boundaries**: Data residency, encryption settings, and audit policies apply Hub-wide

A typical enterprise might have one Hub per business unit or region (e.g., "North America AI Hub", "EMEA AI Hub").

### AI Foundry Project (Team Workspace)

Projects are the working environments within a Hub where teams build and deploy AI applications:

- **Model Deployments**: Each project manages its own model endpoints independently
- **Prompt Flows**: Project-scoped orchestration pipelines
- **Evaluations**: Test runs and evaluation results are project-scoped
- **Assets**: Datasets, indexes, and fine-tuned model artifacts belong to a project
- **Access Control**: Project-level RBAC allows fine-grained team permissions
- **Environment Isolation**: Projects provide logical isolation while sharing Hub infrastructure

A Hub can contain multiple Projects (e.g., "Customer Service Bot", "Document Processor", "Code Assistant").

## Model Deployment Architecture

Azure AI Foundry supports three deployment models, each with different trade-offs:

### 1. Managed Compute Deployments
- Dedicated VM instances running the model exclusively for your workload
- Best for: Consistent high-throughput workloads, models requiring GPU customization
- Scaling: Manual or auto-scale based on metrics
- Billing: Per-hour compute cost (VM SKU based)
- Supports: Open source models (Llama, Mistral, Phi), fine-tuned models

### 2. Serverless API Deployments (Models as a Service)
- Pay-per-token pricing with no infrastructure management
- Best for: Variable workloads, rapid prototyping, multi-model strategies
- Scaling: Automatic, managed by the platform
- Billing: Per 1K input/output tokens
- Supports: Azure OpenAI models, select partner models (Cohere, Mistral, Meta via MaaS)

### 3. Global Batch Deployments
- Asynchronous processing of large datasets at reduced cost
- Best for: Bulk document processing, dataset augmentation, offline analysis
- Billing: Discounted per-token pricing (typically 50% less than real-time)
- Supports: Azure OpenAI models (GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo)

## Connection Architecture

Connections are the bridge between AI Foundry and external services:

```
AI Foundry Project
  ├── Azure OpenAI Connection (model inference)
  ├── Azure AI Search Connection (vector search, RAG)
  ├── Azure Blob Storage Connection (data, documents)
  ├── Azure Key Vault Connection (secrets, API keys)
  ├── Azure Cosmos DB Connection (conversation history)
  ├── Custom API Connection (third-party services)
  └── GitHub Connection (CI/CD, code sync)
```

### Connection Authentication Methods
- **API Key**: Simple key-based authentication (stored in Key Vault)
- **Managed Identity**: System-assigned or user-assigned managed identity (recommended for production)
- **Service Principal**: Azure AD application credentials
- **Personal Access Token**: For GitHub and similar services

## Network Architecture

### Standard (Public) Deployment
- Hub and Projects accessible over public internet
- Azure service connections use Azure backbone network
- Suitable for development and non-sensitive workloads

### Private Endpoint Deployment
- Hub accessible only through Azure Private Link
- All connected services communicate over private endpoints
- No data traverses the public internet
- Required for regulated industries (healthcare, finance, government)

## CI/CD Integration with GitHub

Azure AI Foundry integrates with GitHub for DevOps workflows:

1. **Prompt Flow as Code**: Prompt flows export to YAML/Python, storable in Git repositories
2. **GitHub Actions**: Automated evaluation and deployment pipelines
3. **Environment Promotion**: Dev → Staging → Production deployment patterns
4. **A/B Testing**: Traffic splitting across model deployments for gradual rollout
5. **Model Registry**: Version control for fine-tuned models and deployment configurations

### Typical CI/CD Pipeline
```
GitHub Push → GitHub Actions Trigger
  → Run Prompt Flow Evaluations
  → Check Quality Thresholds (groundedness, relevance, coherence)
  → Check Safety Thresholds (content safety scores)
  → Deploy to Staging (managed compute or serverless)
  → Run Integration Tests
  → Promote to Production (with traffic splitting)
```

## Data Architecture

### Vector Index Storage
- Azure AI Search as the primary vector store for RAG scenarios
- Supports hybrid search (vector + keyword), semantic ranking
- Integrated chunking and embedding pipeline within AI Foundry

### Data Processing Pipeline
```
Source Documents (Blob Storage)
  → Document Cracking (PDF, DOCX, PPTX, HTML)
  → Chunking (fixed-size, semantic, or custom)
  → Embedding Generation (text-embedding-ada-002, text-embedding-3-large)
  → Vector Index (Azure AI Search)
  → Query-time Retrieval (hybrid search + reranking)
```

### Monitoring and Observability
- **Azure Monitor Integration**: Metrics, logs, and alerts for model endpoints
- **Application Insights**: Request tracing, latency monitoring, error tracking
- **Tracing**: Built-in distributed tracing for prompt flow executions showing each step's input/output, latency, and token usage
- **Cost Tracking**: Per-project and per-deployment cost attribution
