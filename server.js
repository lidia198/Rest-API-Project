const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const filePath = path.join(__dirname, 'schedule.json');

const server = http.createServer(async (req, res) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);

    // GET all schedule items
    if (req.url === '/api/schedule' && req.method === 'GET') {
        try {
            const data = await fs.promises.readFile(filePath, 'utf-8');
            const schedule = JSON.parse(data);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(schedule));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error reading file');
        }

    // GET single schedule item
    } else if (req.url.startsWith('/api/schedule/') && req.method === 'GET') {
        const id = parseInt(req.url.split('/')[3]);
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const schedule = JSON.parse(data);

        const item = schedule.find(s => s.id === id);

        if (item) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(item));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Schedule Not Found');
        }

    
    } else if (req.url === '/api/schedule' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const newItem = JSON.parse(body);

            const data = await fs.promises.readFile(filePath, 'utf-8');
            const schedule = JSON.parse(data);

            const newId = schedule.length > 0 ? schedule[schedule.length - 1].id + 1 : 1;
            newItem.id = newId;

            schedule.push(newItem);
            await fs.promises.writeFile(filePath, JSON.stringify(schedule, null, 2));

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newItem));
        });

    
    } else if (req.url.startsWith('/api/schedule/') && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const id = parseInt(req.url.split('/')[3]);
            const updatedData = JSON.parse(body);

            const data = await fs.promises.readFile(filePath, 'utf-8');
            let schedule = JSON.parse(data);

            const index = schedule.findIndex(s => s.id === id);

            if (index !== -1) {
                schedule[index] = { ...schedule[index], ...updatedData, id };
                await fs.promises.writeFile(filePath, JSON.stringify(schedule, null, 2));

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(schedule[index]));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Schedule Not Found');
            }
        });

    
    } else if (req.url.startsWith('/api/schedule/') && req.method === 'DELETE') {
        const id = parseInt(req.url.split('/')[3]);

        const data = await fs.promises.readFile(filePath, 'utf-8');
        let schedule = JSON.parse(data);

        const index = schedule.findIndex(s => s.id === id);

        if (index !== -1) {
            const deleted = schedule.splice(index, 1)[0];
            await fs.promises.writeFile(filePath, JSON.stringify(schedule, null, 2));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(deleted));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Schedule Not Found');
        }

    
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Route Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Schedule API running on http://localhost:${PORT}`);
});
