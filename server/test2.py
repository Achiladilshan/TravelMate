import nltk
import ssl

# Specify the path to the SSL certificate bundle
ssl._create_default_https_context = ssl._create_unverified_context
nltk.data.path.append("/path/to/ssl/certificates")

nltk.download('averaged_perceptron_tagger')

