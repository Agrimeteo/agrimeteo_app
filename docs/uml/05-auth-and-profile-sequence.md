# 05. Séquence - authentification et synchronisation de profil

Cette séquence décrit le flux courant de connexion ou de récupération de session côté application.

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant FE as Frontend React
    participant AC as AuthContext
    participant API as Backend Express
    participant AS as authService
    participant PS as profileService
    participant SA as Supabase Auth
    participant DB as Supabase DB

    U->>FE: Saisit email/mot de passe
    FE->>AC: login(email, password)
    AC->>API: POST /api/v1/auth/login
    API->>AS: login()
    AS->>SA: signInWithPassword()
    SA-->>AS: session + user
    AS-->>API: sessionData
    API-->>AC: success + session + user
    AC->>SA: syncSupabaseSession()
    AC->>API: POST /api/v1/profile/sync
    API->>PS: sync/get profile
    PS->>DB: upsert/select profile
    DB-->>PS: profile data
    PS-->>API: profile
    API-->>AC: profile enrichi
    AC-->>FE: user hydrate
    FE-->>U: Dashboard ou role-selection
```

## Variante Google OAuth

- L'utilisateur est redirigé vers Google via Supabase OAuth.
- À son retour, `completeOAuthSession()` récupère la session.
- Le même mécanisme `profile/sync` hydrate ensuite le profil applicatif.

