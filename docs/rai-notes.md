# Responsible AI (RAI) Notes — Presentation Ninja

## Overview

Presentation Ninja is an AI-powered presentation generator that uses the GitHub Copilot SDK to create presentations about Microsoft Foundry and GitHub Copilot products. This document outlines our Responsible AI considerations.

## Content Accuracy

- **Topic-scoped knowledge**: The agent only generates content about verified domains, reducing hallucination risk
- **Curated knowledge packs**: Pre-loaded content sourced from official public documentation
- **Web search grounding**: Tavily web search provides up-to-date data to supplement local knowledge
- **Precanned slides**: Demo and YouTube slides use fixed templates — no AI tokens consumed, no hallucination possible

## Content Safety

- All AI-generated content is topic-constrained to technical documentation
- No user-generated images or external content injection in MVP
- Content is factual and technical, minimizing harmful content risk
- YouTube embeds are user-provided URLs only — no AI-generated links

## Data Privacy

- Per-user data isolation (SQLite foreign keys, auth middleware)
- Demo account data is ephemeral and isolated
- No telemetry collected without explicit Azure App Insights opt-in
- No data shared across users
- GitHub tokens stored in environment variables only, never in database

## Bias Considerations

- Content is technical and factual, minimizing bias surface
- Slide templates use neutral, professional design language
- No demographic or personal data processing

## Transparency

- AI-generated presentations are clearly indicated in metadata
- Generation prompts and parameters are stored and visible
- Users can iterate and modify all generated content
- Mock mode clearly distinguishes demo content from AI-generated content

## Intellectual Property

- Knowledge packs sourced from official, publicly available documentation
- Users retain ownership of their generated presentations
- No proprietary training data used

## Limitations

- Generated content should be reviewed for accuracy before external use
- The agent may occasionally produce imprecise technical details
- Web search results depend on third-party API availability (Tavily)
