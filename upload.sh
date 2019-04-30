#!/bin/bash

# BUILD OPTIONS - EDIT THESE
SITE_S3='s3://daviseford.com/bitcoin-arbitrage/'    # Your S3 bucket address
SITE_OUTPUT_DIR='./_generated/'     # Constants
CSS_DIR="${SITE_OUTPUT_DIR}/css"    # Constants
JS_DIR="${SITE_OUTPUT_DIR}/js"      # Constants

CF_DIST_ID='EOV559H6J3O6V'          # Cloudfront Distribution ID
CF_PATH='/bitcoin-arbitrage/*'      # Cloudfront Path to invalidate


# BUILD OPTIONS - EDIT THESE
MINIFY_CSS=true             # Minify any CSS in your CSS_DIR
MINIFY_JS=true              # Minify any JS files in your JS_DIR
BABELIFY_JS=true            # Babelify any JS files in your JS_DIR
MINIFY_HTML=true            # Minify the Jekyll-generated HTML in your SITE_DIR


# END EDITING. DO NOT EDIT PAST THIS POINT.

make_site_output_dir()
{
    rm -rf ${SITE_OUTPUT_DIR}
    mkdir -p ${SITE_OUTPUT_DIR}
}

move_to_output_dir()
{
    rsync -az "." ${SITE_OUTPUT_DIR} --exclude "*generated*" --exclude "*.idea*" --exclude "*.sh" --exclude "*.git*" --exclude "*.DS_Store"
    echo "Moved files to ${SITE_OUTPUT_DIR}"
}

minify_html()   # Using html-minifier | npm install html-minifier-cli -g
{
if [ "$MINIFY_HTML" = true ]  && [ -d "$SITE_OUTPUT_DIR" ]; then
    for file in `find ${SITE_OUTPUT_DIR} -name "*.html" -type f`; do
        htmlmin -o "${file}.min" "$file"  # Make a minified copy of each .html file
        mv "${file}.min" "$file"          # Overwrite the old HTML with the minified version
    done
    echo "Minified HTML"
fi
}

minify_css()    # Using UglifyCSS | npm install uglifycss -g
{
if [ "$MINIFY_CSS" = true ]  && [ -d "$CSS_DIR" ]; then
    for file in `find ${CSS_DIR} -name "*.css" -type f -not -name "*.min.css"`; do
        uglifycss --ugly-comments --output "${file/.css/.min.css}" "$file" # Create minified CSS file
    done
    echo "Minified CSS"
fi
}

minify_js()     # Using google-closure-compiler-js | npm install google-closure-compiler-js -g
{
if [ "$MINIFY_JS" = true ] && [ -d "$JS_DIR" ]; then
    for file in `find ${JS_DIR} -name "*.js" -type f -not -name "*.min.js"`; do
        npx google-closure-compiler "$file" > "${file/.js/.min.js}"
    done
    echo "Minified JS"
fi
}

babelify_js()
{
if [ "$BABELIFY_JS" = true ] && [ -d "$JS_DIR" ]; then
    # We use the npm-g root trick to load global presets for Babel
    for file in `find ${JS_DIR} -name "*.js" -type f -not -name "*.min.js"`; do
        npx babel "$file" --presets "$(npm -g root)/babel-preset-env" --out-file "$file"
    done
    echo "Babelified JS"
fi
}

### START OF EXECUTION ###
make_site_output_dir && move_to_output_dir

# Babelify/Minify Javascript
babelify_js && minify_js

#Minify CSS/HTML
minify_css && minify_html

# Upload to S3 - unless -n (no-upload) is passed in
aws s3 sync --delete --size-only ${SITE_OUTPUT_DIR} ${SITE_S3} --exclude "*.idea*" --exclude "*.sh" --exclude "*.git*" --exclude "*.DS_Store"
echo "Uploaded to http://daviseford.com/bitcoin-arbitrage/"

aws cloudfront create-invalidation --distribution-id ${CF_DIST_ID} --paths ${CF_PATH}
echo "Invalidated Cloudfront cache."
