# Azure Functions Overview

Azure Functions is Microsoft's serverless compute platform that enables event-driven application development without managing infrastructure. As of 2026, it remains a cornerstone of cloud-native application design, aligning with Microsoft's strategy around serverless computing, containers/Kubernetes, and AI integration.

## Current Status (February 2026)

- **Recommended version**: 4.x for all new applications
- **Runtime support**: .NET 8, .NET 9, and .NET 10
- **Version 1.x end-of-support**: September 14, 2026
- **In-process model end-of-support**: November 10, 2026 (migrate to isolated worker model)
- **Azure Functions Proxies**: Deprecated; community support ended September 30, 2025 — migrate to Azure API Management

## Key Capabilities

Azure Functions provides:

- **Event-driven compute** — Responds to triggers from HTTP requests, queues, timers, databases, and 20+ Azure services
- **Automatic scaling** — Scales from zero to thousands of instances based on demand
- **Pay-per-execution pricing** — Consumption plan charges only for actual execution time
- **Multiple language support** — .NET, Node.js, Python, Java, PowerShell, and custom handlers

## Hosting Plans

| Plan | Use Case |
|------|----------|
| **Consumption** | Variable workloads, pay-per-execution |
| **Flex Consumption** | Serverless with zero-downtime deployments, rolling updates (GA late 2025) |
| **Elastic Premium** | Enterprise-grade with VNet integration, longer execution times |
| **Dedicated (App Service)** | Predictable pricing, reserved capacity |
| **Container Apps** | Unified platform for event-driven and finite workloads |

## 2025-2026 Innovations

- **Remote MCP server hosting** — Host Model Context Protocol servers for AI agents
- **Durable Functions enhancements** — Dedicated SKU (GA) and Consumption SKU (Preview) for orchestration
- **OpenTelemetry support** — Now generally available for observability
- **.NET 10 support** — Available on isolated worker model for all plans except Linux Consumption
- **Aspire integration** — First-class support for .NET Aspire cloud-native stack
- **GPU support** — Serverless GPU for AI workloads via Container Apps hosting
- **Database triggers** — Azure Database for MySQL triggers (GA November 2025)

## Integration with Azure Services

Azure Functions is part of Azure Integration Services alongside:

- **Logic Apps** — High-level workflow orchestration
- **API Management** — API gateway and management
- **Service Bus** — Enterprise messaging
- **Event Grid** — Event routing at scale

## Language Runtime Support Timeline

| Runtime | End of Support |
|---------|----------------|
| Node.js 20 | April 30, 2026 (upgrade to Node.js 22) |
| Python 3.10 | October 1, 2026 (upgrade to Python 3.13) |
| .NET in-process model | November 10, 2026 (migrate to isolated worker) |
| Functions runtime 1.x | September 14, 2026 |

## Migration Guidance

- **Version 1.x apps**: Migrate to version 4.x before September 2026
- **In-process .NET apps**: Migrate to isolated worker model before November 2026
- **Functions Proxies users**: Migrate to Azure API Management immediately (feature may be removed at any time)
