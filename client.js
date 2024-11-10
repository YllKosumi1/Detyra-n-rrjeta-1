const dgram = require('dgram');
const readline = require('readline');
const client = dgram.createSocket('udp4');

const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 12347; 

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
       
    } else if (!isConnected) {
        console.log(`Klienti është lidhur me serverin në ${SERVER_HOST}:${SERVER_PORT}`);
        console.log("Komandat e disponueshme:");
        console.log("  READ <file>         - Lexon përmbajtjen e një skedari");
        console.log("  APPEND <file> <text> - Shton tekstin në fund të skedarit");
        console.log("  EXECUTE <command>   - Ekzekuton një komandë në server");
        console.log("  CREATE <file>       - Krijon një skedar të ri");
        console.log("  ERASE <client>      - Fshin një klient të specifikuar nga serveri");
        console.log("  LIST                - Shfaq listën e klientëve të lidhur");
        console.log("  EXIT                - Largoheni nga serveri");
        console.log("\nShkruani komandën tuaj:");

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
    } else {
        console.log(`Përgjigje nga serveri: ${message}`);
    }
});

client.on('close', () => {
    console.log('Klienti u mbyll.');
});
