const dgram = require('dgram');
const fs = require('fs');
const server = dgram.createSocket('udp4');
const PORT = 12346;
const IP_ADDRESS = '127.0.0.1';

const clients = new Map();
const MAX_CLIENTS = 4;
const INACTIVITY_TIMEOUT = 60000;
let firstClient = null;

function logMessage(clientAddress, command) {
    const timestamp = new Date().toISOString();
    const logEntry = `Timestamp: ${timestamp}, Client: ${clientAddress}, Command: ${command}\n`;
    fs.appendFile('server.log', logEntry, (err) => {
        if (err) console.error('Error logging message:', err);
    });
}