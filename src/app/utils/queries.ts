export const executeSparql = async (query: string): Promise<any> => {
    const endpointUrl = process.env.SPARQL_ENDPOINT_URL;
    
    if (endpointUrl == undefined) {
        console.error('SPARQL_ENDPOINT_URL is undefined');
        return
    }
        
    try {
        const url = `${endpointUrl}?query=${encodeURIComponent(query)}&format=json`;
        
        console.log("Executing : " + url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('bad network response ' + response.statusText);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error running SPARQL query:', error);
        return error
    } 
}
