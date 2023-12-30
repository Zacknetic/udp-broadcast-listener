import dgram from 'dgram';
import { Network } from './Network';

const BROADCAST_PORT: number = 48899; //CHANGE ME
//change to the port your device uses. Possibly 6667 or 49154 according to your wireshark capture

const BROADCAST_MAGIC_STRING: string = 'HF-A11ASSISTHREAD'; //CHANGE ME
//change to the magic string your device uses. Possibly the long string of alphanumerics you see in your wireshark capture starting with 000055aa...

//BUFFER FORMATED MESSAGE
// const BUFFER_BROADCAST_MAGIC_STRING: Buffer = Buffer.from('HF-A11ASSISTHREAD', 'utf8');
//you may need to use this instead of the above if your device uses a different encoding. Additionally, you may need to change the encoding from utf8 to something else such as ascii, hex, or base64, or others.
//see https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings for more information.

const userInterfaces: string[] = [];

export async function discoverDevices() {
	//uses the custom Network class to create a list of all the user interfaces reported by the OS. These are broadcast addresses that we will send to.
	for (const subnet of Network.subnets()) {
		userInterfaces.push(subnet.broadcast);
	}

	const socket: dgram.Socket = dgram
		.createSocket({
			//creates a socket to send and receive messages
			type: 'udp4',
			reuseAddr: true,
		})
		.on('error', (err) => {
			//error handling
			console.log(`server error:\n${err.stack}`);
			socket.close();
		})
		.on('message', (msg, rinfo) => {
			//creats a listener that waits for messages from the device(s). This will continue to listen for messages until the socket is closed.
			console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
		})
		.on('listening', () => {
			//waits for the socket to be fully "ready" before sending the message
			const address = socket.address();
			console.log(`server listening ${address.address}:${address.port}`);
            
			for (const userInterface of userInterfaces) {
                //sends the message to each user interface
				socket.send(BROADCAST_MAGIC_STRING, BROADCAST_PORT, userInterface);
                // socket.send(BUFFER_BROADCAST_MAGIC_STRING, BROADCAST_PORT, userInterface); //use this instead if you need to use the buffer formatted message
			}
		});
	socket.bind(BROADCAST_PORT);
}
