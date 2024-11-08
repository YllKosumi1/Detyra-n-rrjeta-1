const dgram = require('dgram');
const readline = require('readline');
const client = dgram.createSocket('udp4');

const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 12346; 
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let isConnected = false;

client.send('CONNECT', SERVER_PORT, SERVER_HOST, (err) => {
    if (err) {
        console.error('Gabim gjatë dërgimit të mesazhit të parë të lidhjes:', err);
    }
});
