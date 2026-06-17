# 02. Diagramme de composants

Ce diagramme présente l'architecture logique du système telle qu'elle ressort du code.

```mermaid
flowchart TB
    subgraph Client["Côté client"]
        Site["apps/site\nSite marketing React/Vite"]
        App["apps/app\nApplication React/Vite"]
        Contexts["Contexts React\nAuth / Permissions / Settings"]
        Pages["Pages métier\nCrops / Weather / Community / Admin"]
    end

    subgraph API["Backend Express"]
        Server["server.ts\nExpress + CORS + Helmet + Morgan"]
        Routes["Routes API v1"]
        Controllers["Controllers"]
        Middlewares["Middlewares\nAuth / Admin / Permission / Upload / Validate"]
        Services["Services métier"]
    end

    subgraph ServiceLayer["Services métier principaux"]
        AuthS["authService"]
        ProfileS["profileService"]
        CropS["cropService"]
        CropPlanS["cropPlanService"]
        WeatherS["weatherService"]
        RecommendationS["recommendationService"]
        ReportS["reportService"]
        CommunityS["communityService"]
        SettingsS["settingsService"]
        NotificationS["notificationService"]
        PermissionS["permissionService"]
        AdminS["adminService"]
        AuditS["auditService"]
        ChatS["chatService"]
        StorageS["storageService"]
    end

    subgraph Supabase["Supabase"]
        Auth["Supabase Auth"]
        DB["PostgreSQL + RLS"]
        Storage["Supabase Storage"]
        Realtime["Realtime"]
    end

    Site --> App
    App --> Contexts
    Contexts --> Pages
    Pages --> Server

    Server --> Routes
    Routes --> Middlewares
    Middlewares --> Controllers
    Controllers --> Services

    Services --> AuthS
    Services --> ProfileS
    Services --> CropS
    Services --> CropPlanS
    Services --> WeatherS
    Services --> RecommendationS
    Services --> ReportS
    Services --> CommunityS
    Services --> SettingsS
    Services --> NotificationS
    Services --> PermissionS
    Services --> AdminS
    Services --> AuditS
    Services --> ChatS
    Services --> StorageS

    AuthS --> Auth
    ProfileS --> DB
    CropS --> DB
    CropPlanS --> DB
    WeatherS --> DB
    RecommendationS --> DB
    RecommendationS --> WeatherS
    ReportS --> Storage
    ReportS --> DB
    CommunityS --> DB
    CommunityS --> Realtime
    SettingsS --> DB
    NotificationS --> DB
    PermissionS --> DB
    AdminS --> DB
    AdminS --> Auth
    AuditS --> DB
    ChatS --> DB
    StorageS --> Storage
```

## Lecture

- Le frontend principal dépend de trois contexts structurants : `Auth`, `Permissions`, `Settings`.
- Le backend suit une architecture classique `Routes -> Middlewares -> Controllers -> Services`.
- Supabase est au centre de l'infrastructure métier.

