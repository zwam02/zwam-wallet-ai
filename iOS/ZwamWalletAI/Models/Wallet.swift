import Foundation

struct Wallet: Codable, Identifiable {
    let id: String
    let name: String
    let address: String
    let balance: Double
    let currency: String
    let type: String // "crypto" or "fiat"
    let icon: String?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case address
        case balance
        case currency
        case type
        case icon
        case createdAt = "created_at"
    }
    
    var formattedBalance: String {
        String(format: "%.2f", balance)
    }
    
    var displayCurrency: String {
        currency.uppercased()
    }
}
