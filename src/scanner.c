#include "tree_sitter/parser.h"
#include "tree_sitter/alloc.h"
#include "tree_sitter/array.h"

enum TokenType {
	WHITESPACE,
	COMMENT,
	PROP_TERM
};

void     tree_sitter_jsonp_external_scanner_destroy(void *payload) { }
void     tree_sitter_jsonp_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) { }
uint32_t tree_sitter_jsonp_external_scanner_serialize(void *payload, char *buffer) { return 0; }
void*    tree_sitter_jsonp_external_scanner_create() { return NULL; }

static bool _emit_ws(TSLexer* lexer, bool has_ws);
static bool _emit_comment(TSLexer* lexer);
static bool _emit_pt(TSLexer* lexer);
static bool _consume_comment(TSLexer* lexer);
static bool _consume_ws(TSLexer* lexer, bool consume_lt);
static bool _consume_pt(TSLexer* lexer);

bool tree_sitter_jsonp_external_scanner_scan(
	void *payload, TSLexer *lexer, const bool *valid_symbols)
{	
	if (valid_symbols[PROP_TERM])
	{
		return _consume_pt(lexer);
	}
	
	return _consume_ws(lexer, true);
}

static bool _emit_ws(TSLexer* lexer, bool has_ws)
{
	lexer->result_symbol = WHITESPACE;
	return has_ws;
}

static bool _emit_comment(TSLexer* lexer)
{
	lexer->result_symbol = COMMENT;
	return true;
}

static bool _emit_pt(TSLexer* lexer)
{
	lexer->result_symbol = PROP_TERM;
	return true;
}

static bool _consume_comment(TSLexer* lexer)
{	
	lexer->advance(lexer, false);
	
	while (!lexer->eof(lexer))
	{
		switch(lexer->lookahead)
		{
			case '0x00':
				return false;
			case '\r':
			case '\n':
				return _emit_comment(lexer);
			default:
				lexer->advance(lexer, false);
				break;
		}
	}
	
	return _emit_comment(lexer);
}

static bool _consume_ws(TSLexer* lexer, bool consume_lt)
{	
	bool has_ws = false;
	
	while (!lexer->eof(lexer))
	{
		switch(lexer->lookahead)
		{
			case '#':
				if (has_ws)
				{
					return _emit_ws(lexer, true);
				}
			
				return _consume_comment(lexer);
			case '\r':
			case '\n':
				if (!consume_lt)
				{
					return _emit_ws(lexer, has_ws);
				}
				
				// Fallthrough intentional
				
			case '\t':
			case ' ':
				lexer->advance(lexer, false);
				has_ws = true;
				break;
			default:
				return _emit_ws(lexer, has_ws);
		}
	}
	
	return _emit_ws(lexer, has_ws);
}

static bool _consume_pt(TSLexer* lexer)
{	
	if (lexer->eof(lexer))
	{
		return _emit_pt(lexer);
	}
	
	switch(lexer->lookahead)
	{
		case '\r':
		case '\n':
			return _emit_pt(lexer);
	}
	
	return _consume_ws(lexer, false);
}