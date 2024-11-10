const dgram = require('dgram');
const fs = require('fs');
const { exec } = require('child_process');
const server = dgram.createSocket('udp4');

const PORT = 12347;
const IP_ADDRESS = '127.0.0.1';

const clients = new Map();
const MAX_CLIENTS = 4;
const INACTIVITY_TIMEOUT = 60000;
const NON_ADMIN_DELAY = 2000; 
let firstClient = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function logMessage(clientAddress, command) {
    const timestamp = new Date().toISOString();
    const logEntry = `Timestamp: ${timestamp}, Client: ${clientAddress}, Command: ${command}\n`;
    fs.appendFile('server.log', logEntry, (err) => {
        if (err) console.error('Error logging message:', err);
    });
}

server.on('listening', () => {
    console.log(`Server is listening on ${IP_ADDRESS}:${PORT}`);
});

server.on('message', (message, rinfo) => {
    const clientAddress = `${rinfo.address}:${rinfo.port}`;
    const command = message.toString().trim();

    if (command === 'DISCONNECT') {
        handleDisconnect(clientAddress, rinfo);
        return;
    }

    if (!clients.has(clientAddress) && clients.size >= MAX_CLIENTS) {
        server.send('Error: Numri maksimal i klientëve është arritur. Lidhja u refuzua.', rinfo.port, rinfo.address);
        console.log(`Klienti ${clientAddress} u refuzua për shkak të limitit të klientëve.`);
        return;
    }

    if (!clients.has(clientAddress)) {
        clients.set(clientAddress, Date.now());
        console.log(`Klienti ${clientAddress} u shtua. Numri i klientëve tani është: ${clients.size}`);

        if (!firstClient && clients.size === 1) {
            firstClient = clientAddress;
            console.log(`Klienti i parë u caktua: ${firstClient}`);
        }

    }

    clients.set(clientAddress, Date.now());
    logMessage(clientAddress, command);

    const isFirstClient = clientAddress === firstClient;
    handleCommand(command, rinfo, isFirstClient);
});

function handleDisconnect(clientAddress, rinfo) {
    if (clients.has(clientAddress)) {
        clients.delete(clientAddress);
        console.log(`Klienti ${clientAddress} u largua manualisht.`);
        console.log(`Numri aktual i klientëve: ${clients.size}`);
        server.send('You have been disconnected. A spot is now available for a new client.', rinfo.port, rinfo.address);

        if (clientAddress === firstClient) {
            firstClient = clients.size > 0 ? Array.from(clients.keys())[0] : null;
            if (firstClient) {
                console.log(`Klienti i ri me privilegje të plota: ${firstClient}`);
            } else {
                console.log('Nuk ka më klientë me privilegje të plota.');
            }
        }
    }
}

async function handleCommand(command, rinfo, isFirstClient) {
    if (!isFirstClient) {
        await sleep(NON_ADMIN_DELAY);
    }

    if (command.startsWith('READ')) {
        const fileName = command.split(' ')[1];
        const filePath = `./${fileName}`;
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                server.send('Error: File not found or could not be read.', rinfo.port, rinfo.address);
            } else {
                server.send(`File content: ${data}`, rinfo.port, rinfo.address);
            }
        });
    } else if (isFirstClient && command.startsWith('APPEND')) {
        const [_, fileName, ...content] = command.split(' ');
        const filePath = `./${fileName}`;
        const dataToAppend = content.join(' ');
        fs.appendFile(filePath, `\n${dataToAppend}`, (err) => {
            if (err) {
                server.send('Error: Failed to append to the file.', rinfo.port, rinfo.address);
            } else {
                server.send('Content successfully appended to the file.', rinfo.port, rinfo.address);
            }
        });
    } else if (isFirstClient && command.startsWith('EXECUTE')) {
        const cmd = command.split(' ').slice(1).join(' ');
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                server.send('Error: Command execution failed.', rinfo.port, rinfo.address);
            } else {
                server.send(`Command output:\n${stdout}`, rinfo.port, rinfo.address);
            }
        });
    } else if (isFirstClient && command.startsWith('CREATE')) {
        const fileName = command.split(' ')[1];
        fs.writeFile(`./${fileName}`, '', (err) => {
            if (err) {
                server.send('Error: File could not be created.', rinfo.port, rinfo.address);
            } else {
                server.send(`File ${fileName} successfully created.`, rinfo.port, rinfo.address);
            }
        });
    } else if (isFirstClient && command.startsWith('ERASE')) {
        const clientToErase = command.split(' ')[1];
        if (clients.has(clientToErase)) {
            clients.delete(clientToErase);
            server.send(`Client ${clientToErase} has been removed.`, rinfo.port, rinfo.address);
            console.log(`Client ${clientToErase} erased by ${rinfo.address}:${rinfo.port}`);
        } else {
            server.send('Error: Specified client not found.', rinfo.port, rinfo.address);
        }
    } else if (isFirstClient && command === 'LIST') {
        const clientList = Array.from(clients.keys()).join('\n');
        server.send(`Connected clients:\n${clientList}`, rinfo.port, rinfo.address);
    } else {
        server.send('Unknown command or insufficient permissions.', rinfo.port, rinfo.address);
    }
}

setInterval(() => {
    const now = Date.now();
    for (const [client, lastActivity] of clients.entries()) {
        if (now - lastActivity > INACTIVITY_TIMEOUT) {
            clients.delete(client);
            console.log(`Klienti ${client} u hoq për shkak të inaktivitetit.`);
            console.log(`Numri aktual i klientëve: ${clients.size}`);
        }
    }
}, INACTIVITY_TIMEOUT);

server.bind(PORT, IP_ADDRESS);
