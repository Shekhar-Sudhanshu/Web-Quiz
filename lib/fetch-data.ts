export async function GetAPIData() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const proxyUrl = process.env.NEXT_PUBLIC_API_PROXY_URL;

        if(apiUrl){
            if(proxyUrl){
                // URL encode the API URL so it's correctly passed as a query parameter
                const encodedApiUrl = encodeURIComponent(apiUrl);

                // Make the request to AllOrigins
                const response = await fetch(proxyUrl + encodedApiUrl);

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const result = await response.json();
                const data = JSON.parse(result.contents); // Parse the data from the proxy response
                return data;
            }
            else{
                const response = await fetch(
                    apiUrl
                );

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const result = await response.json();
                return result;

            }
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
