import Foundation

struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let error: String?
    let message: String?
}

struct PaginatedResponse<T: Codable>: Codable {
    let items: [T]
    let total: Int
    let page: Int
    let pageSize: Int
    
    enum CodingKeys: String, CodingKey {
        case items
        case total
        case page
        case pageSize = "page_size"
    }
}
