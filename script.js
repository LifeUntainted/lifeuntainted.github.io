document.getElementById('niche-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = {
        interests: document.getElementById('interests').value,
        // Collect other fields similarly...
    };

    // Display loading message
    document.getElementById('results').innerHTML = "<p>Analyzing your inputs, please wait...</p>";

    try {
        // Send data to the backend serverless function
        const response = await fetch('https://niche-analyzer-84e5rguhg-321niche-projects.vercel.app', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.result) {
            // Display results
            document.getElementById('results').innerHTML = `<h2>Your Niche Ideas:</h2><pre>${data.result}</pre>`;
        } else {
            document.getElementById('results').innerHTML = "<p>Sorry, we couldn't generate niche ideas at this time.</p>";
        }
    } catch (error) {
        document.getElementById('results').innerHTML = "<p>An error occurred while processing your request.</p>";
        console.error('Error:', error);
    }
});
