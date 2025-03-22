const express = require('express');
const htmlToPdf = require('html-pdf');
const app = express();

// Serve static files
app.use(express.static(__dirname));

// Middleware for parsing JSON
app.use(express.json());

// API endpoint for generating PDF
app.post('/api/generate-pdf', (req, res) => {
    const html = req.body.html;
    
    htmlToPdf.create(html).toBuffer((err, buffer) => {
        if (err) return res.status(500).json({ error: err });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Andriy_Sushko_Resume.pdf');
        res.send(buffer);
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
