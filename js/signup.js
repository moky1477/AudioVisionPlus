document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("signup-form");
    const message = document.getElementById("message");

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // You can validate the input here if needed.

        // Send the data to the server for database connection.
        fetch("/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
        })
        .then(response => response.json())
        .then(data => {
            message.textContent = data.message;
        })
        .catch(error => {
            console.error(error);
            message.textContent = "An error occurred during signup.";
        });
    });
});
