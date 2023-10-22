export const sendDiscordMessage = async (loc: string | undefined, lastMessage: string): Promise<any> => {
    try {
        
        const webhook: string = process.env.DISCORD_WEBHOOK || '';
        if (webhook === '') {
          throw new Error('DISCORD_WEBHOOK environment variable not set')
        }
        
        if (loc == undefined) {
            loc = 'Unknown';
        }

        const payload = {
            username: 'Datacrate-Demo',
            content: 'Message from ' + loc + ' at ' + new Date() + ' : "' + lastMessage + '"',
        };
        
        const body = JSON.stringify(payload);

        const response = await fetch(webhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error details:', errorBody);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        console.log('Message sent successfully!');
    } catch (error) {
        console.error('Error sending message to Discord:', error);
    }
}
