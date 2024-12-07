// Define the connectToChat function in mqttFunctions.js
// import mqtt from 'mqtt';
let client = null;
export function connectToChat(username) {
    const brokerUrl = "wss://f141901889024fdaa90d30b636ca5f0a.s1.eu.hivemq.cloud:8884/mqtt"; 
    const options = {
        clientId: 'mqttClient_' + Math.random().toString(16).substr(2, 8), // Unique client ID
        clean: true,
        connectTimeout: 4000,
        username: 'mqttClient',
        password: 'Mqtt@1912',
        reconnectPeriod: 1000
    };

    client = mqtt.connect(brokerUrl, options);

    client.on("connect", () => {
        console.log("Connected to MQTT broker");

        // Subscribe to the global chat topic
        client.subscribe("chat/global", (err) => {
            if (!err) {
                console.log("Subscribed to chat topic");

                // Notify others about the new user
                const joinMessage = JSON.stringify({
                    type: "join",
                    username: username,
                });
                client.publish("chat/global", joinMessage);
            }
        });
    });

    client.on("message", (topic, message) => {
        if (topic === "chat/global") {
            const data = JSON.parse(message.toString());

            const chatBox = document.getElementById("chatBox");
            const msg = document.createElement("p");
            if (data.type === "join") {
                msg.className = "joinMessage";
                msg.textContent = `${data.username} has joined the chat.`;
            } else if (data.type === "message") {
                if (data.username === username) {
                    msg.className = "chat-message my-message";
                } else {
                    msg.className = "chat-message other-message";
                }
                msg.textContent = `${data.username}: ${data.content}`;
            }

            chatBox.appendChild(msg);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
    return client;
}
export function sendMessage(client, messageContent, username) {
    const chatMessage = JSON.stringify({
        type: "message",
        username: username,
        content: messageContent,
    });

    client.publish("chat/global", chatMessage);
}
