import Foundation

struct Transaction: Codable, Identifiable {
    let id: String
    let walletId: String
    let type: TransactionType
    let amount: Double
    let currency: String
    let description: String
    let status: TransactionStatus
    let date: Date
    let fee: Double?
    let hash: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case walletId = "wallet_id"
        case type
        case amount
        case currency
        case description
        case status
        case date
        case fee
        case hash
    }
    
    var formattedAmount: String {
        let prefix = type == .send ? "-" : "+"
        return "\(prefix)\(String(format: "%.2f", amount)) \(currency.uppercased())"
    }
    
    var amountColor: String {
        type == .send ? "red" : "green"
    }
}

enum TransactionType: String, Codable {
    case send
    case receive
    case swap
    case stake
}

enum TransactionStatus: String, Codable {
    case pending
    case completed
    case failed
    case cancelled
}
