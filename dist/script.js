// Function to fetch and process CV content
async function loadCV() {
    try {
        console.log('Loading CV...');
        const response = await fetch('cv.md');
        console.log('Response received');
        const markdown = await response.text();
        
        // Convert markdown to HTML
        const converter = new showdown.Converter({
            tables: true,
            strikethrough: true,
            tasklists: true,
            simpleLineBreaks: true
        });
        
        const html = converter.makeHtml(markdown);
        
        // Add custom formatting
        const formattedHTML = html
            .replace(/<h1>(.*?)<\/h1>/g, '<h1>$1</h1>')
            .replace(/<h2>(.*?)<\/h2>/g, '<h2>$1</h2>')
            .replace(/<h3>(.*?)<\/h3>/g, '<h3>$1</h3>')
            .replace(/<p>(.*?)<\/p>/g, '<p>$1</p>')
            .replace(/<ul>(.*?)<\/ul>/g, '<ul>$1</ul>')
            .replace(/<li>(.*?)<\/li>/g, '<li>$1</li>');
        
        // Convert markdown-style links to HTML links
        const content = formattedHTML
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        document.getElementById('cv-content').innerHTML = content;
        
        // Add download event listeners after content is loaded
        addDownloadListeners();
    } catch (error) {
        console.error('Error loading CV:', error);
        document.getElementById('cv-content').innerHTML = 'Error loading CV. Please try again later.';
    }
}

// Add download event listeners
function addDownloadListeners() {
    document.getElementById('download-pdf').addEventListener('click', () => downloadCV('pdf'));
}

// Function to download CV
async function downloadCV(format) {
    try {
        // Get the HTML content
        const content = document.getElementById('cv-content').innerHTML;
        
        // Create a temporary HTML element with the content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
            <html>
                <head>
                    <style>
                        :root {
                            --primary-color: #2c3e50;
                            --secondary-color: #3498db;
                            --text-color: #333;
                            --background-color: #ffffff;
                            --border-radius: 8px;
                        }

                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }

                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: var(--text-color);
                            background-color: var(--background-color);
                        }

                        h1, h2, h3 {
                            color: var(--primary-color);
                            margin-bottom: 1rem;
                        }

                        h1 {
                            font-size: 2.5rem;
                        }

                        h2 {
                            font-size: 1.8rem;
                            border-bottom: 2px solid var(--secondary-color);
                            padding-bottom: 0.5rem;
                        }

                        h3 {
                            font-size: 1.4rem;
                        }

                        section {
                            margin-bottom: 2rem;
                        }

                        ul {
                            list-style-position: inside;
                            margin-left: 1rem;
                        }

                        a {
                            color: var(--secondary-color);
                            text-decoration: none;
                        }

                        a:hover {
                            text-decoration: underline;
                        }

                        .date {
                            color: #666;
                            font-style: italic;
                        }

                        .highlight {
                            color: var(--secondary-color);
                            font-weight: bold;
                        }

                        @media (max-width: 768px) {
                            .container {
                                margin: 1rem;
                            }
                            
                            h1 {
                                font-size: 2rem;
                            }
                            
                            h2 {
                                font-size: 1.5rem;
                            }
                            
                            h3 {
                                font-size: 1.2rem;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
            </html>
        `;
        
        // Send request to server
        const response = await fetch(`/api/generate-${format}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ html: tempDiv.innerHTML })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate CV');
        }
        
        // Create a temporary anchor element for download
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Andriy_Sushko_Resume.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading CV:', error);
        alert('Error downloading CV. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cvContent = document.getElementById('cv-content');
    const downloadPdfBtn = document.getElementById('download-pdf');

    // Initialize Showdown converter
    const converter = new showdown.Converter();

    // Fetch and render CV
    fetch('cv.md')
        .then(response => response.text())
        .then(markdown => {
            const html = converter.makeHtml(markdown);
            cvContent.innerHTML = html;
            
            // Add click event listener to download buttons
            downloadPdfBtn.addEventListener('click', () => {
                const cvContent = document.getElementById('cv-content').innerHTML;
                fetch('/api/generate-pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ html: cvContent }),
                })
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'Andriy_Sushko_Resume.pdf';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                })
                .catch(error => console.error('Error:', error));
            });
        })
        .catch(error => console.error('Error:', error));
});
