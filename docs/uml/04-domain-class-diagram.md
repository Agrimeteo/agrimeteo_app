# 04. Diagramme de classes métier

Ce diagramme représente les principales entités métier et leurs relations.

```mermaid
classDiagram
    class User {
      +uuid id
      +string email
      +Session auth
    }

    class Profile {
      +uuid id
      +string full_name
      +string email
      +string phone
      +string role
      +string location
      +string bio
      +string avatar_url
      +datetime created_at
      +datetime updated_at
    }

    class UserSettings {
      +uuid user_id
      +string language
      +string theme
      +string units_system
      +string profile_visibility
      +boolean share_location
      +boolean allow_analytics
      +boolean push_notifications
      +boolean email_alerts
    }

    class Crop {
      +uuid id
      +uuid user_id
      +string crop_type
      +date planting_date
      +date expected_harvest
      +string status
      +float area
      +string location
      +string notes
    }

    class CropPlan {
      +uuid id
      +uuid crop_id
      +Task[] tasks
      +datetime created_at
      +datetime updated_at
    }

    class Task {
      +uuid id
      +string name
      +date date
      +string status
      +string notes
    }

    class Report {
      +uuid id
      +uuid user_id
      +string image_url
      +string description
      +string status
    }

    class Notification {
      +uuid id
      +uuid user_id
      +string title
      +string message
      +string type
      +boolean read
      +json data
      +datetime created_at
    }

    class CommunityPost {
      +uuid id
      +uuid user_id
      +uuid related_crop_id
      +string type
      +string title
      +string content
      +string status
      +datetime created_at
      +datetime updated_at
    }

    class CommunityComment {
      +uuid id
      +uuid post_id
      +uuid user_id
      +uuid parent_comment_id
      +string content
      +string status
      +datetime created_at
      +datetime updated_at
    }

    class CommunityLike {
      +uuid id
      +uuid post_id
      +uuid user_id
      +datetime created_at
    }

    class WeatherAlert {
      +uuid id
      +uuid user_id
      +uuid crop_id
      +uuid region_id
      +string location
      +string type
      +string security
      +string description
      +datetime valid_until
      +datetime created_at
    }

    class PermissionCatalog {
      +string code
      +string resource
      +string action
      +string description
    }

    class RolePermission {
      +string role
      +string permission_code
      +boolean allowed
      +datetime updated_at
    }

    class AdminAuditLog {
      +uuid id
      +uuid actor_user_id
      +string actor_email
      +string actor_name
      +string actor_role
      +string entity_type
      +uuid entity_id
      +string entity_label
      +string action
      +string description
      +json details
      +datetime created_at
    }

    User "1" --> "1" Profile : owns
    User "1" --> "1" UserSettings : configures
    User "1" --> "*" Crop : manages
    User "1" --> "*" Report : creates
    User "1" --> "*" Notification : receives
    User "1" --> "*" CommunityPost : writes
    User "1" --> "*" CommunityComment : writes
    User "1" --> "*" CommunityLike : creates
    User "1" --> "*" WeatherAlert : receives

    Crop "1" --> "0..1" CropPlan : has
    CropPlan "1" --> "*" Task : contains
    Crop "1" --> "0..*" CommunityPost : referenced_by
    Crop "1" --> "0..*" WeatherAlert : concerns

    CommunityPost "1" --> "*" CommunityComment : contains
    CommunityPost "1" --> "*" CommunityLike : contains
    CommunityComment "1" --> "0..*" CommunityComment : replies_to

    PermissionCatalog "1" --> "*" RolePermission : defines
    User "1" --> "*" AdminAuditLog : acts_as_actor
```

## Remarques

- `User` représente l'identité d'authentification Supabase.
- `Profile` représente la projection métier de l'utilisateur dans l'application.
- `RolePermission` modélise le RBAC administrable.
- `AdminAuditLog` trace les opérations sensibles sur les entités principales.

