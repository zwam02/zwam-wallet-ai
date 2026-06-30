import Foundation

struct User: Codable, Identifiable {
    let id: String
    let name: String
    let email: String
    let avatar: String?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case email
        case avatar
        case createdAt = "created_at"
    }
}
