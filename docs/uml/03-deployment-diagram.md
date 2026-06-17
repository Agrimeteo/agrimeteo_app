# 03. Diagramme de déploiement

Ce diagramme montre une cible de déploiement complète et réaliste pour AgriMétéo.

```mermaid
flowchart TB
    User["Navigateur / Mobile PWA"]

    subgraph WebLayer["Couche web"]
        Marketing["Site marketing\napps/site"]
        Frontend["Application web / PWA\napps/app"]
    end

    subgraph BackendLayer["Couche API"]
        API["Node.js / Express\nbackend"]
    end

    subgraph SupabaseCloud["Supabase Cloud"]
        SupaAuth["Auth"]
        SupaDB["PostgreSQL"]
        SupaStorage["Storage"]
        SupaRealtime["Realtime"]
    end

    subgraph ExternalServices["Services externes"]
        OpenWeather["OpenWeatherMap API"]
        GoogleOAuth["Google OAuth"]
        GenAI["Google GenAI / services IA"]
    end

    User --> Marketing
    User --> Frontend
    Marketing --> Frontend
    Frontend --> API

    API --> SupaAuth
    API --> SupaDB
    API --> SupaStorage
    API --> SupaRealtime

    Frontend --> SupaAuth

    API --> OpenWeather
    API --> GoogleOAuth
    API --> GenAI
```

## Remarques

- Le site marketing peut être hébergé séparément de l'application.
- L'application frontend peut être déployée en PWA.
- Le backend centralise la logique métier et les intégrations externes.
- Supabase constitue le noyau de persistance et de sécurité.

