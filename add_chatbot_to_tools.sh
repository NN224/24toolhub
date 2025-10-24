#!/bin/bash

# Add chatbot to all tool pages
for file in tools/*.html; do
    # Check if chatbot is already added
    if ! grep -q "chatbot.js" "$file"; then
        # Find </body> tag and add chatbot before it
        sed -i 's|</body>|    <!-- AI Chatbot -->\n    <link rel="stylesheet" href="../css/chatbot.css">\n    <script src="../js/chatbot.js"></script>\n  </body>|' "$file"
        echo "Added chatbot to: $file"
    fi
done

echo "Chatbot added to all tool pages!"
