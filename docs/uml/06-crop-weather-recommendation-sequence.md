# 06. Séquence - culture, météo, recommandations et notifications

Cette séquence synthétise un flux métier important du projet : la culture alimente la météo, qui nourrit ensuite les recommandations et les alertes.

```mermaid
sequenceDiagram
    actor F as Farmer
    participant FE as Frontend App
    participant API as Backend Express
    participant CS as cropService
    participant CPS as cropPlanService
    participant WS as weatherService
    participant RS as recommendationService
    participant NS as notificationService
    participant DB as Supabase DB
    participant OWM as OpenWeatherMap

    F->>FE: Ajoute une culture
    FE->>API: POST /api/v1/crops
    API->>CS: createCrop()
    CS->>DB: insert crop
    DB-->>CS: crop created
    CS-->>API: crop
    API-->>FE: success

    FE->>API: POST /api/v1/crop-plans/:cropId/generate
    API->>CPS: generateCropPlan(cropId)
    CPS->>DB: select crop + insert crop_plans
    CPS->>NS: createPlanNotification()
    NS->>DB: insert notifications
    CPS-->>API: crop plan
    API-->>FE: plan generated

    FE->>API: GET /api/v1/weather
    API->>WS: getWeatherOverview(userId)
    WS->>DB: resolve profile/crop location + region
    alt API OpenWeather disponible
        WS->>OWM: onecall(lat, lon)
        OWM-->>WS: live weather data
    else fallback local
        WS->>DB: read climate_data
        DB-->>WS: climate profile
    end
    WS-->>API: weather overview
    API-->>FE: weather data

    FE->>API: GET /api/v1/recommendations/:cropPlanId
    API->>RS: generate or fetch recommendations
    RS->>DB: read crop plan + crop + stored recommendations
    RS->>WS: getWeatherOverview(userId)
    RS->>WS: getWeatherAlerts(userId)
    RS->>DB: store current recommendations
    RS-->>API: recommendations
    API-->>FE: actionable recommendations
```

## Points clés

- Les plans de culture dépendent de la culture créée.
- Les recommandations agrègent plusieurs sources : crop, plan, météo, alertes, interventions récentes.
- La météo a une stratégie hybride : API externe si disponible, sinon fallback local.

