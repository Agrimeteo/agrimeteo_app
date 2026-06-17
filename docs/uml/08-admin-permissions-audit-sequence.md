# 08. Séquence - administration, permissions et audit

Cette séquence montre comment la gouvernance admin fonctionne dans AgriMétéo.

```mermaid
sequenceDiagram
    actor A as Admin
    participant FE as Frontend Admin
    participant PM as permissionMiddleware
    participant API as Backend Express
    participant PC as permissionController
    participant AC as adminController
    participant PS as permissionService
    participant ADS as adminService
    participant AUS as auditService
    participant DB as Supabase DB
    participant AUTH as Supabase Auth

    A->>FE: Ouvre Admin > Permissions
    FE->>API: GET /api/v1/permissions/me
    API->>PM: auth + role check
    PM->>PS: roleHasPermission(role, permissions.read)
    PS->>DB: select role_permissions
    DB-->>PS: permissions matrix
    PS-->>PM: allowed
    PM-->>API: continue
    API->>PC: getCurrentUserPermissions()
    PC->>PS: getRolePermissions(role)
    PS->>DB: read permissions_catalog + role_permissions
    DB-->>PS: permissions
    PS-->>PC: permissions payload
    PC-->>FE: permissions data

    A->>FE: Modifie les permissions d'un rôle
    FE->>API: PUT /api/v1/permissions/:role
    API->>PM: require permissions.update
    PM->>PS: roleHasPermission(admin, permissions.update)
    PM-->>API: continue
    API->>PC: updateRolePermissions()
    PC->>PS: updateRolePermissions(role, permissions)
    PS->>DB: upsert role_permissions
    DB-->>PS: updated rows
    PS-->>PC: updated matrix
    PC-->>FE: success

    A->>FE: Met à jour le rôle d'un utilisateur
    FE->>API: PUT /api/v1/admin/users/:id
    API->>PM: require users.update
    API->>AC: updateUser()
    AC->>ADS: getProfileById(id)
    ADS->>DB: select profile
    DB-->>ADS: previous user
    AC->>ADS: updateUserRole(id, role)
    ADS->>DB: update profiles.role
    DB-->>ADS: updated user
    AC->>AUS: safeRecordAuditLog(...)
    AUS->>DB: insert admin_audit_logs
    DB-->>AUS: audit stored
    AC-->>FE: updated user
```

## Points clés

- Les permissions admin sont dynamiques et stockées en base.
- Le middleware de permission protège les routes sensibles.
- Les actions de gouvernance peuvent être auditées via `admin_audit_logs`.

