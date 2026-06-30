import SwiftUI

@main
struct ZwamWalletAIApp: App {
    @StateObject private var appViewModel = AppViewModel()
    
    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environmentObject(appViewModel)
        }
    }
}
