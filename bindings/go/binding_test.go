package tree_sitter_jsonp_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_jsonp "github.com/losttime76/tree-sitter-jsonp/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_jsonp.Language())
	if language == nil {
		t.Errorf("Error loading JSONP grammar")
	}
}
