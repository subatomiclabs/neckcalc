#!/bin/sh

echo "using a python super simple web server to serve the content:"
echo "please open http://0.0.0.0:8000/index.html"
# python >3
#python -m http.server

# python <3
python -m SimpleHTTPServer

