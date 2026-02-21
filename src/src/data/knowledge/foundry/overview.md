# Azure AI Foundry - Overview

## What is Azure AI Foundry?

Azure AI Foundry is Microsoft's unified platform for building, evaluating, and deploying generative AI applications at enterprise scale. It provides a comprehensive development environment that brings together model selection, prompt engineering, orchestration, evaluation, and deployment into a single cohesive experience.

Azure AI Foundry was formerly known as **Azure AI Studio** and was rebranded in November 2024 during Microsoft Ignite. The rebrand reflects the platform's evolution from a studio-style interface into a full-fledged AI development foundry capable of supporting the entire AI application lifecycle.

## Core Value Proposition

Azure AI Foundry addresses the key challenges enterprises face when building AI applications:

- **Model Selection Complexity**: With 1,600+ models in the catalog, teams can compare and evaluate models from Azure OpenAI (GPT-4o, GPT-4 Turbo, o1, o3-mini), Meta (Llama 3.1, Llama 3.2), Mistral (Mistral Large, Mixtral), Cohere (Command R+), and many others without changing their application code.
- **Fragmented Tooling**: Instead of stitching together separate tools for prompt engineering, evaluation, and deployment, everything lives in one platform.
- **Governance and Compliance**: Enterprise-grade security, role-based access control, and responsible AI tooling are built in from the start.
- **Team Collaboration**: Shared resources, centralized governance through Hubs, and project-based isolation enable large teams to work efficiently.

## Key Platform Components

### Model Catalog
The model catalog provides access to over 1,600 foundation models across multiple providers:
- **Azure OpenAI Models**: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo, o1-preview, o1-mini, o3-mini, DALL-E 3, Whisper
- **Open Source Models**: Meta Llama 3.1 (8B, 70B, 405B), Llama 3.2 (1B, 3B, 11B, 90B), Mistral Large, Mixtral 8x7B, Phi-3 family
- **Partner Models**: Cohere Command R+, AI21 Jamba, Databricks DBRX
- **Task-Specific Models**: Embedding models, speech models, vision models, multimodal models

### Prompt Flow
A visual and code-first orchestration framework for building complex AI workflows. Prompt Flow enables chaining of LLM calls, tool integrations, and data processing steps into reproducible, testable pipelines.

### Responsible AI Tools
Built-in content safety, fairness assessment, and responsible AI dashboards help teams build AI applications that align with organizational policies and regulatory requirements.

### Enterprise Security
- Azure Active Directory (Entra ID) integration
- Virtual network support and private endpoints
- Managed identity for service-to-service authentication
- Customer-managed encryption keys
- Comprehensive audit logging

## Platform Access

Azure AI Foundry is accessible through:
- **Web Portal**: ai.azure.com - browser-based development environment
- **VS Code Extension**: Direct integration with Visual Studio Code for code-first development
- **CLI**: Azure CLI extensions for automation and CI/CD
- **SDKs**: Python SDK (azure-ai-projects, azure-ai-inference) for programmatic access
- **REST APIs**: Direct API access for custom integrations

## Pricing Model

Azure AI Foundry itself is free to use. Costs are incurred for:
- Model inference (pay-per-token for serverless API, per-hour for managed compute)
- Compute resources for fine-tuning and managed deployments
- Connected Azure services (AI Search, Storage, etc.)
- Provisioned throughput units (PTUs) for guaranteed capacity

## Target Audience

- **AI/ML Engineers**: Building and fine-tuning models, creating evaluation pipelines
- **Application Developers**: Integrating AI capabilities into applications using SDKs
- **Data Scientists**: Experimenting with models, building prompt flows, analyzing results
- **Platform Engineers**: Setting up governance, managing compute, configuring security
- **Business Stakeholders**: Reviewing responsible AI metrics and application performance
