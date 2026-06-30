import Foundation

struct Insight: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let type: InsightType
    let value: Double
    let change: Double
    let recommendation: String?
    let confidence: Double
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case title
        case description
        case type
        case value
        case change
        case recommendation
        case confidence
        case createdAt = "created_at"
    }
    
    var changePercentage: String {
        String(format: "%.2f%%", change)
    }
    
    var changeIndicator: String {
        change > 0 ? "📈" : "📉"
    }
}

enum InsightType: String, Codable {
    case portfolio
    case opportunity
    case risk
    case prediction
}
