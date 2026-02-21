# Azure Functions — Features

## Core Capabilities

- **Event-driven serverless compute** — functions execute in response to triggers (HTTP, timers, queues, Cosmos DB, Event Hubs, Service Bus, Kafka, and more)
- **Automatic scaling** — instances added or removed dynamically based on incoming events
- **Pay-per-execution pricing** — charged only for compute time consumed
- **99.95% SLA** on Flex Consumption plan

## Hosting Plans (as of 2025)

| Plan | Best For |
|------|----------|
| **Flex Consumption** | Production workloads requiring VNet integration, faster cold starts, user-defined concurrency, and scale-to-zero |
| **Premium** | Continuous execution, prewarmed workers, advanced networking, longer execution times |
| **Consumption** | Lightweight, sporadic workloads (note: newer language versions not added to Linux Consumption) |
| **Container Apps** | Custom container images, microservices architecture, cloud-native deployments |

## Durable Functions

- **Stateful orchestrations** for complex business processes with reliability and fault tolerance
- **High-scale orchestrations** via the new `durable-task-scheduler` backend (highest throughput option as of 2025)
- **Multiple storage back-ends**: Azure Storage, Netherite, MSSQL, and durable-task-scheduler
- **Orchestration versioning** (preview as of July 2025)
- **PowerShell SDK** available as standalone module (GA July 2025)
- **Durable Task Extension for Microsoft Agent Framework** — enables resilient, scalable AI agents with automatic session management and failure recovery

## Security & Networking

- **Managed Identity** support — eliminates secrets for authentication/authorization
- **VNet integration** with private endpoints and NAT gateways (Flex Consumption and Premium plans)
- **Built-in authentication** for inbound client traffic using identity providers
- **Azure API Management integration** — expose HTTP functions as managed REST APIs with OAuth 2.0, JWT validation, rate limiting, and versioning

## AI & Agent Integration (2025)

- **Azure AI Foundry Agent Service integration** (GA May 2025)
- **MCP (Model Context Protocol) extension** — build MCP servers using Functions triggers & bindings
- **BYO Remote MCP Server** support (preview August 2025)

## Observability

- **OpenTelemetry support** (preview June 2025) — improved diagnostics, performance insights, and troubleshooting

## SDK Type Bindings

Enhanced bindings for direct SDK type access:
- **Azure Service Bus** — `ServiceBusReceivedMessage` type
- **Azure Cosmos DB** — SDK type bindings for advanced scenarios
- **Azure Event Hubs** — SDK type bindings

## Language Support (as of February 2026)

| Language | Supported Versions |
|----------|-------------------|
| .NET | 8.0 (isolated worker model recommended; in-process ends Nov 2026) |
| Java | 8, 11, 17, 21 (GA), 25 (preview) |
| Node.js | 18, 20, 22 |
| Python | 3.10–3.13 (GA), 3.14 (preview) |
| PowerShell | 7.4 (ends Nov 2026) |

## Deprecations & End-of-Support

| Feature | End Date |
|---------|----------|
| **Azure Functions Proxies** | September 30, 2025 — migrate to Azure API Management |
| **Runtime v1.x** | September 14, 2026 — migrate to v4.x |
| **.NET in-process model** | November 10, 2026 — migrate to isolated worker model |
