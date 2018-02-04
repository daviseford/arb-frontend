#!/bin/bash
# This script does some various utility tasks
# Builds the static site using Jekyll
# And syncs the generated site with S3

# You can run this script with three options
# -i  | enable Image processing. Creates thumbnails and quickly compresses images.
# -c  | enable maximum Compression for images. Creates thumbnails, thoroughly compresses images, and takes a long time doing it
# -n  | No-upload mode. Doesn't upload the build to S3.
# -s  | enable Setup mode. Downloads the necessary npm files for compression

# BUILD OPTIONS - EDIT THESE
SITE_S3='s3://daviseford-website-code/bitcoin-arbitrage/'    # Your S3 bucket address
CSS_DIR='./generated/'     # Constants
JS_DIR='./generated/'       # Constants
SITE_OUTPUT_DIR='./generated/'  # Constants

# BUILD OPTIONS - EDIT THESE
MINIFY_CSS=true             # Minify any CSS in your CSS_DIR
MINIFY_JS=true              # Minify any JS files in your JS_DIR
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
    find ${CSS_DIR} -name "*.min.css" -type f|xargs rm -f   # Delete existing minified files
    for file in `find ${CSS_DIR} -name "*.css" -type f`; do
        uglifycss --ugly-comments --output "${file/.css/.min.css}" "$file" # Create minified CSS file
    done
    echo "Minified CSS"
fi
}

minify_js()     # Using google-closure-compiler-js | npm install google-closure-compiler-js -g
{
if [ "$MINIFY_JS" = true ] && [ -d "$JS_DIR" ]; then
    find ${JS_DIR} -name "*.min.js" -type f|xargs rm -f   # Delete existing minified files
    for file in `find ${JS_DIR} -name "*.js" -type f`; do
        google-closure-compiler-js "$file" > "${file/.js/.min.js}"
    done
    echo "Minified JS"
fi
}

### START OF EXECUTION ###

make_site_output_dir
move_to_output_dir

# Minify CSS and JS source files - important to do this BEFORE building
minify_css && minify_js

# Minify HTML (this modifies the generated HTML) - do AFTER building
minify_html


# Upload to S3 - unless -n (no-upload) is passed in
aws s3 sync --delete --size-only ${SITE_OUTPUT_DIR} ${SITE_S3} --exclude "*.idea*" --exclude "*.sh" --exclude "*.git*" --exclude "*.DS_Store"
echo "Uploaded to http://daviseford.com/bitcoin-arbitrage/"
