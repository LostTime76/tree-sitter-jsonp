/**
 * @file Tree sitter grammar for the JSONP format
 * @author colton murphy <none>
 * @license BSD-3
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
	name: "jsonp",
	
	// The external scanner will tokenize comments
	extras: ($) => [$.whitespace, $.comment],
	
	// Whitespace is handled externally due to root properties
	externals: ($) => [$.whitespace, $.comment, $.prop_term],

	rules: {
		
		// A document is a root value or 1 or more root Properties
		doc: ($) => choice($.value, repeat1(seq($.prop, $.prop_term))),
		
		// Properties are a property key followed by a value
		prop: ($) => seq($.prop_key, ':', $.value),
		
		// A property key can be a quoted or unquoted string
		prop_key: ($) => choice(
		
			// Unquoted string
			/[^\p{C} :0-9'"\{\}\[\]+-][^\p{C}:\r\n\t ]*/,
			
			// Single or double quoted string
			$.string
		),
		
		// A string is a double quoted sequence of characters. It cannot contain control characters
		// except whitespace.
		string: ($) => seq('"', repeat(choice((/([\r\n\t ]|[^\p{C}\\"])+/), $.char_esc)), '\"'),
			
		// String character escape sequences
		char_esc: () => token(seq('\\', choice(
			
			// Single characters
			'b', 'r', 'n', 'f', 't', ' ', '"', '\\',
			
			// 2 digit short unicode codepoint
			/x[0-9a-fA-F]{2}/,
			
			// 4 digit short unicode codepoint or surrogate pair
			/u[0-9a-fA-F]{4}/,
			
			// Full unicode codepoint
			/U[0-9a-fA-F]{6}/
		))),
		
		// Number in any format
		number: () => choice(
			
			// Binary number
			/0b[01]([01]|_[01])*/,
			
			// Octal number
			/0o[0-7]([0-7]|_[0-7])*/,
			
			// Hexadecimal number
			/0x[0-9a-fA-F]([0-9a-fA-F]|_[0-9a-fA-F])*/,
			
			// Decimal number (integer & floating point)
			/-?(?:0|[1-9]([0-9]|_[0-9])*)(?:(?:\.([0-9]|_[0-9])+)?(?:[eE][+-]?([0-9]|_[0-9])+)?)?/
		),
		
		// Literal
		literal: ($) => choice(
			$.lit_null,
			$.lit_bool,
			$.lit_num
		),
		
		// Different literals
		lit_null: () => 'null',
		lit_bool: () => choice('true', 'false'),
		lit_num: () => choice('infinity', '-infinity', 'nan'),
		
		// An array can contain any number of values with a trailing comma
		array: ($) => seq('[', optional(ruleWithSeparator($.value)), ']'),
		
		// An object can contain any number of properties with a trailing comma
		object: ($) => seq('{', optional(ruleWithSeparator($.prop)), '}'),
		
		// A value can be a keyword literal, number, string, object, or array
		value: ($) => choice(
			$.literal,
			$.number,
			$.string,
			$.object,
			$.array
		),
	}
});

function ruleWithSeparator(rule) {
	
	// Allow trailing separators
	return seq(rule, repeat(seq(',', optional(rule))));
}