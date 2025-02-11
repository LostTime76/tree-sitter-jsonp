import XCTest
import SwiftTreeSitter
import TreeSitterJsonp

final class TreeSitterJsonpTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_jsonp())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading JSONP grammar")
    }
}
