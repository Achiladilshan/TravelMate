import spacy
from nltk.corpus import wordnet
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load spaCy model for English
nlp = spacy.load("en_core_web_sm")

class NLPProcessor:
    """Class for NLP processing"""

    def __init__(self, nlp_model):
        self.nlp_model = nlp_model

    def extract_keywords_from_text(self, text: str) -> list[str]:
        """Extract keywords from a given text"""
        print(text)
        doc = self.nlp_model(text)
        keywords = [token.text for token in doc if not token.is_stop and token.pos_ in ['NOUN', 'PROPN']]
        return keywords

    def expand_keywords_list(self, keywords: list[str]) -> list[str]:
        """Expand a list of keywords with synonyms"""
        expanded_keywords = set(keywords)
        for keyword in keywords:
            synsets = wordnet.synsets(keyword)
            synonyms = set([lemma for synset in synsets for lemma in synset.lemma_names()])
            expanded_keywords.update(synonyms)
        return list(expanded_keywords)

nlp_processor = NLPProcessor(nlp)

@app.route('/extract_keywords', methods=['POST'])
def extract_keywords_route():
    try:
        data = request.json
        if not isinstance(data, dict) or 'text' not in data:
            return jsonify({'error': 'Invalid request data'}), 400
        text = data['text']
        print(text)
        if not isinstance(text, str):
            return jsonify({'error': 'Invalid "text" value'}), 400
        keywords = nlp_processor.extract_keywords_from_text(text)
        return jsonify({'keywords': keywords})
    except spacy.errors.ParserError as e:
        return jsonify({'error': 'Failed to parse text'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/expand_keywords', methods=['POST'])
def expand_keywords_route():
    try:
        data = request.json
        if not isinstance(data, dict) or 'keywords' not in data:
            return jsonify({'error': 'Invalid request data'}), 400
        keywords = data['keywords']
        if not isinstance(keywords, list) or not all(isinstance(keyword, str) for keyword in keywords):
            return jsonify({'error': 'Invalid "keywords" value'}), 400
        expanded_keywords = nlp_processor.expand_keywords_list(keywords)
        return jsonify({'expanded_keywords': expanded_keywords})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)