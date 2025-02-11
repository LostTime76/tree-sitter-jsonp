# Introduction
JSONP (json plus) is an extension to the JSON serialization format.

With the myriad options available today for serialization and configuration formats, none of them seem to scratch my itch. Many of the extended json formats are what I consider to be a swing and a miss. Other formats like TOML and YAML have their own set of issues. JSONP aims to be both a good serialization and configuration format while attempting to fix some of the shortcomings of json. However, adding features to json will ultimately make it more complex. That is the tradeoff we have to contend with.

# Backwards compatibility
The jsonp format is a super set of json. Thus any jsonp compliant parser can parse a json document. However, json parsers may not be able to parse a jsonp document.

# Text format
This section will detail the format of a jsonp text, that is a stream of bytes in jsonp format. The only valid encoding for a jsonp text is utf8.

## Control characters
The only valid control characters allowed within a jsonp text are as follows:

Name | Unicode | Meaning
---- | ------- | --------
TAB  | u09     | Horizontal tab
NL   | u0a     | Line feed
CR   | u0d     | Carriage return

## Whitespace
The valid whitespace characters allowed within a jsonp text are unchanged from json.

Name  | Unicode
----- | --------
TAB   | u09
NL    | u0a
CR    | u0d
SPACE | u20

## Line terminators
Line terminators are generally considered whitespace within a jsonp text; however, there are a few instances where they become significant. The following are considered line terminators.

Sequence | Meaning
-------- | -------
CR       | Carriage return
LF       | Line feed
CRLF     | Carriage return followed by line feed

## Structural tokens
A jsonp text supports the same structural tokens as json.

Token | Unicode | Meaning
----- | ------- | -------
{     | u7b     | Start of an object
}     | u7d     | End of an object
[     | y5b     | Start of an array
]     | u5d     | End of an array
:     | u3a     | Property key, value separator
,     | u2c     | Value or property separator

# Document format
The jsonp document format is similar to the json document format. A jsonp document contains one root value or at least one root property. It is not possible to mix root values or properties within a document. An empty document is not allowed.

## Root properties
In most json configuration files, an object value at the root is used. Since this is so ubiquitous, the root object essentially becomes implicit even though json requires the braces explicitly. This increases the indentation level of the entire text. Within a jsonp document, the root braces are now optional for root value objects. If the first element within the document is a root property, the entirety of the rest of the document must only contain root properties. It is not possible to mix root properties and root values in a single document.

A parser can concretely determine if the first root element within a document is a value or property by examining the second token within the document if the first token is ambiguous. That is, if the first token within the document is a potential property key, the second token must be a colon for a property. If a parser encounters a root property, an implicit object value is created and the rest of the document is parsed as if the root element of the document is an object value.

Root properties are terminated when a line terminator, RS character, or the end of the text is encountered. The start of a root property (its property key) must always start on a new line. It is not possible to start a new property on the same line where a preceding property value ends.

# Comments
The jsonp format supports single line comments using the # character (u42). Single line comments are terminated when a line terminator, RS character, or end of the text is encountered.

# Keyword literals
jsonp extends the number of keyword literal values allowed within the text.

Kewyword  | Meaining
--------- | --------
null      | Null value
true      | Boolean true
false     | boolean false
infinity  | Floating point positive infinity
-infinity | Floating point negative infinity
nan       | Floating point not a number

# Numbers
jsonp extends how numbers can be written.
1. Numbers can be written as a json compliant integer or floating point value.
2. The underscore character (u5f) can be used to separate digits within any number value.
3. Additional integer number formats are supported.

Format      | Prefix | Example
----------- | ------ | --------------
Binary      | 0b     | 0b1011, 0b1010_0101
Octal       | 0o     | 0o1234, 0o12_34_56
Hexadecimal | 0x     | 0xdead, 0x123_dead_1

# Strings
String values within a jsonp text are extended and support the following features:
1. Multi line strings are supported.
2. Additional escape sequences within strings are supported

## Escape sequences
The following escape sequences are supported within a jsonp text.

Escape | Example  | Meaning
------ | -------- | -------
\b     | \b       | Backspace control character
\f     | \f       | Form feed control character
\r     | \r       | Carriage return control character
\n     | \n       | Newline control character
\t     | \t       | Tab control character
'\ '   | '\ '     | Escaped space character
\\"    | \\"      | Escaped double quote character
\x     | \x1a     | Short 2 digit unicode codepoint
\u     | \ude12   | Short 4 digit unicode codepoint or utf16 surrogate
\U     | \U1234ab | Full 6 digit unicode codepoint

## Multi line strings
Multi line string values are supported within a jsonp text with no additional formatting. Simply continue a string value onto a subsequent line. When a line terminator is encountered within a string, whitespace until the first non whitespace character is consumed. The first non whitespace character then continues the string, which includes escape sequences.

# Objects
Objects within a jsonp text are extended to support writing property keys as a quoted or unquoted string. Duplicate property keys are allowed. A parser that encounters a duplicate property key will simply replace, not merge, any existing property value. This plugs an unspecification hole in the json format.

## Unquoted string property key
A property key can be written as an unquoted string. This can reduce visual noise within the text. Unquoted strings have the following limitations:
1. Cannot start with a negative sign, decimal digit, or structural token
2. Escape sequences are not supported. Any backslash encountered within the string is interpreted as is.
3. The first whitespace character or colon encountered after the string terminates the property key.
4. The string cannot resolve to any of the keyword literals (case insensitive)

## Property separator
An optional trailing separator is allowed after the last property within an object.

# Arrays
Array values within a jsonp text are mostly unchanged from json.

## Value separator
An optional trailing separator is allowed after the last value within an array.
