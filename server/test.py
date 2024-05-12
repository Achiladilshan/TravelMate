import json
import nltk
from nltk import word_tokenize, pos_tag, RegexpParser

def extract_keywords(text):
    tokens = word_tokenize(text)
    tagged_tokens = pos_tag(tokens)
    
    # Define a grammar for noun phrases
    grammar = r"""
        NP: {<DT>?<JJ>*<NN.*>+}  # Chunk sequences of DT, JJ, and NN
    """
    cp = RegexpParser(grammar)
    parsed_tokens = cp.parse(tagged_tokens)
    
    # Extract phrases that match the NP pattern
    keyword_phrases = []
    for subtree in parsed_tokens.subtrees(filter=lambda t: t.label() == 'NP'):
        keyword_phrases.append(" ".join(word for word, pos in subtree.leaves()))
    
    return keyword_phrases

# Example JSON input
json_input = '''
{
    "text": "I want to travel to historical places and do some hiking."
}
'''

data = json.loads(json_input)
text = data['text']

keywords = extract_keywords(text)
print("Keywords:", keywords)
