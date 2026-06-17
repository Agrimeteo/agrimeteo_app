# 07. Séquence - interactions communautaires

Cette séquence couvre le flux principal de la communauté : publication, commentaire, like et rafraîchissement du feed.

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant FE as Frontend Community
    participant API as Backend Express
    participant CC as communityController
    participant CS as communityService
    participant DB as Supabase DB
    participant RT as Supabase Realtime

    U->>FE: Publie un post
    FE->>API: POST /api/v1/community
    API->>CC: createPost()
    CC->>CS: createCommunityPost(actor, payload)
    CS->>DB: insert community_posts
    DB-->>CS: post stored
    CS-->>API: hydrated post
    API-->>FE: success
    DB-->>RT: event post created
    RT-->>FE: refresh feed trigger

    U->>FE: Ajoute un commentaire
    FE->>API: POST /api/v1/community/:postId/comments
    API->>CS: addCommunityComment()
    CS->>DB: insert community_comments
    DB-->>CS: comment stored
    CS-->>API: comment
    API-->>FE: success
    DB-->>RT: event comment created
    RT-->>FE: refresh feed trigger

    U->>FE: Like ou unlike un post
    FE->>API: POST /api/v1/community/:postId/like
    API->>CS: toggleCommunityLike()
    alt like absent
        CS->>DB: insert community_likes
    else like existant
        CS->>DB: delete community_likes
    end
    DB-->>CS: updated like state
    CS-->>API: post with counts
    API-->>FE: updated post
```

## Remarques

- Les commentaires supportent une hiérarchie via `parent_comment_id`.
- Les likes sont contraints par l'unicité `(post_id, user_id)`.
- Le feed est pensé pour fonctionner avec Supabase Realtime.

