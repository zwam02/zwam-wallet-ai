#zwam.wallet.ai

Aplicación iOS nativa construida con SwiftUI que replica completamente la funcionalidad de la versión web.

## 📱 Características

- 🎯 **Dashboard**: Vista general de billeteras y transacciones
- 💳 **Wallets**: Gestión de billeteras de criptomonedas
- 💰 **Transactions**: Historial y detalle de transacciones
- 📊 **Insights**: Análisis impulsados por IA
- ⚙️ **Settings**: Configuración de la aplicación

## 🛠️ Requisitos

- Xcode 15.0+
- iOS 14.0+
- Swift 5.9+

## 📚 Estructura del Proyecto

```
ZwamWalletAI/
├── App/
│   └── ZwamWalletAIApp.swift
├── Models/
│   ├── Wallet.swift
│   ├── Transaction.swift
│   └── User.swift
├── Views/
│   ├── MainTabView.swift
│   ├── Dashboard/
│   ├── Wallets/
│   ├── Transactions/
│   ├── Insights/
│   └── Settings/
├── ViewModels/
│   └── AppViewModel.swift
├── Services/
│   └── APIService.swift
└── Utils/
    └── Constants.swift
```

## 🚀 Instalación

1. Clona el repositorio
2. Abre `ZwamWalletAI.xcodeproj` en Xcode
3. Selecciona tu destino (simulador o dispositivo real)
4. Presiona Cmd + R para ejecutar

## 🔗 Backend

Esta app se conecta con el backend TypeScript ubicado en `../`

## 📝 Licencia

MIT
