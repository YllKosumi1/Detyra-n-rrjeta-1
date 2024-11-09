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
client.on('message', (msg, rinfo) => {
    const message = msg.toString();

    if (message.startsWith('Error')) {
        console.log(`Përgjigje nga serveri: ${message}`);
        client.close();
        rl.close();
    } else if (!isConnected) {
        console.log(`Klienti është lidhur me serverin në ${SERVER_HOST}:${SERVER_PORT}`);
        console.log("Shkruani komandën tuaj (READ <file>, APPEND <file> <content>, EXECUTE <command>, EXIT për t'u larguar):");
        isConnected = true;
 
        rl.on('line', (line) => {
            if (line.trim().toUpperCase() === 'EXIT') {
                client.send('DISCONNECT', SERVER_PORT, SERVER_HOST, (err) => {
                    if (err) {
                        console.error('Gabim gjatë dërgimit të mesazhit të largimit:', err);
                    }
                    client.close();
                    rl.close();
                    console.log('U larguat nga serveri.');
                });
            } else {
                client.send(line, SERVER_PORT, SERVER_HOST, (err) => {
                    if (err) {
                        console.error('Gabim gjatë dërgimit të mesazhit:', err);
                    }
                });
            }
        });
    }
    else {
        console.log(`Përgjigje nga serveri: ${message}`);
    }
});

client.on('close', () => {
    console.log('Klienti u mbyll.');
});