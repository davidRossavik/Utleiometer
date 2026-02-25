
# Description of files in /Properties

This folder contains all functionality to handle properties. The structure follows a feature-based architeture which divides between UI, hooks and data-layer.

### Data-flow:

Firestore  
   ↓  
fetchProperties (data/)  
   ↓  
useProperties (hook)  
   ↓  
PropertiesClient (UI)  
   ↓  
PropertyCard / registerButton (presentasjon)  

## 📁 client/PropertiesClient.tsx
This is the "entry point" to the property-screen for the client.

Type: Client Component
Responsibilites:
- Renders the property-side (UI)
- Handles search (state)
- Filters list of properties
- Uses UI-components and hooks
Used by: app/(public)/properties/page.tsx


## 📁 components/registerButton.tsx
Presentation-component

Type: UI-component
Responsibility:
- Render a button to register new property
Used by: PropertiesClient.tsx ?


## 📁 data / fetchProperties.ts
This file only contain databasecall.

Type: Datalayer-function
Responsibilites:
- Fetchs properties from Firestore
- Sort on adress
- Maps Firestore-documents to Property-objects
Used by: hooks/useProperties.ts


## 📁 hooks/useProperties.ts
State layer between UI and database

Type: React hook
Responsibilites:
- Fetches properties via fetchProperties.ts
- Triggers datafetching by mount
Used by: PropertiesClient.tsx


## 📁 hooks/usePropertySearch.ts
This file only contains search-logic (no database or UI).

Type: React hook
Responsibilites:
- Filters list of properties based on search text
- Uses useMemo for optimilization
Used by: PropertiesClient.tsx


## 📁 types.ts

Type: Typescript-types
Responsibilites:
- Define Property-type
- Ensures consistent datastructure in the entire feature